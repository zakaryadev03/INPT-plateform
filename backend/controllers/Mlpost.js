const User = require("../models/user");
const Post = require("../models/post");
const natural = require('natural');
const { Matrix } = require('ml-matrix');
const PCA = require('ml-pca').PCA;

exports.getRecommendedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const allPosts = await Post.find().populate('owner', 'name');

        // === filter de contenu ===
        const userLikedPosts = await Post.find({ 'likes.user': req.user._id });
        const userLikedTags = userLikedPosts.flatMap(post => post.tags);
        const userLikedCaptions = userLikedPosts.map(post => post.caption);

        // TF-IDF pour les posts
        const tfidf = new natural.TfIdf();
        allPosts.forEach(post => {
            const text = `${post.caption} ${post.tags.join(' ')}`;
            tfidf.addDocument(text);
        });

        // calcul des scores similaires
        const contentBasedScores = [];
        allPosts.forEach((post, index) => {
            const postText = `${post.caption} ${post.tags.join(' ')}`;
            let score = 0;

            // comparaison
            userLikedCaptions.forEach((caption, i) => {
                tfidf.tfidfs(postText, (j, measure) => {
                    if (j === i) score += measure; // Accumulate similarity score
                });
            });

            contentBasedScores.push({ post, score });
        });

        // === Filter collaborative  ===
        const users = await User.find();
        const posts = await Post.find();
        const interactionMatrix = new Matrix(users.length, posts.length).fill(0);

        // remplir la matrice
        for (let i = 0; i < users.length; i++) {
            const userLikes = await Post.find({ 'likes.user': users[i]._id });
            for (let j = 0; j < posts.length; j++) {
                if (userLikes.some(like => like._id.toString() === posts[j]._id.toString())) {
                    interactionMatrix.set(i, j, 1);
                }
            }
        }

        // verification
        console.log("Interaction Matrix Dimensions:", interactionMatrix.rows, interactionMatrix.columns);

        // faire le  PCA
        const pca = new PCA(interactionMatrix.to2DArray());

        // Adjust reducedDimensions to be <= min(rows, columns)
        const reducedDimensions = Math.min(interactionMatrix.rows, interactionMatrix.columns, 10); // Max 10 dimensions
        console.log("Reduced Dimensions:", reducedDimensions);

        const userFactors = new Matrix(pca.predict(interactionMatrix.to2DArray(), { nComponents: reducedDimensions }));

        // Predict user-post interactions
        const predictedInteractions = userFactors.mmul(userFactors.transpose());

        // Get recommendations for the current user
        const userId = users.findIndex(u => u._id.toString() === user._id.toString());
        const userPredictions = predictedInteractions.getRow(userId);
        const collaborativeScores = userPredictions
            .map((score, index) => ({ post: posts[index], score }));

        // === combiner les resultats ===
        const combinedScores = allPosts.map(post => {
            const contentScore = contentBasedScores.find(item => item.post._id.toString() === post._id.toString())?.score || 0;
            const collaborativeScore = collaborativeScores.find(item => item.post._id.toString() === post._id.toString())?.score || 0;
            return {
                post,
                score: 0.7 * contentScore + 0.3 * collaborativeScore, // Weighted combination
            };
        });

        // Sort and return top recommendations
        let recommendedPosts = combinedScores
            .sort((a, b) => b.score - a.score)
            .map(item => item.post);

        // === Fallback Strategy ===
        if (recommendedPosts.length === 0 || userLikedPosts.length === 0) {
            recommendedPosts = await Post.find().sort({ likes: -1 }).limit(10);
            console.log("Using fallback strategy: Most liked posts");
        }

        res.status(200).json({
            success: true,
            posts: recommendedPosts.slice(0, 10),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};