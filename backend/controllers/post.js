const post = require("../models/post");
const Post = require("../models/post");
const User = require("../models/user");
const natural = require('natural');
const { Matrix } = require('ml-matrix');



exports.createPost = async (req, res) => {

    try {
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner:req.user._id,
            tags: req.body.tags || [],
        };
        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.push(post._id);

        await user.save();

        res.status(201).json({
            success:true,
            post,
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({
                success:false,
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== req.user._id.toString()){
            res.status(401).json({
                success:false,
                message: "Only the owner of the posts allowed to modify them"
            })
        }

        await post.remove();

        const user = await User.findById(req.user._id);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        await user.save();

        res.status(200).json({
            success:true,
            message: "Post deleted",
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.likeAndUnlikePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404).json({
                success:false,
                message: "Post not found",
            });
        }

        if(posts.likes.includes(req.user._id)){

            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index, 1);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            });
        } else{
            post.likes.push(req.user._id);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post liked",
            });
        }        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getPostOfFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const posts = await Post.find({
            owner: {
                $in: user.following,
            }
        });

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.updateCaption = async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({
                success:false,
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== req.user._id.toString()){
            res.status(401).json({
                success:false,
                message: "Only the owner of the posts allowed to modify them"
            })
        }
        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({
            success: true,
            message: "Caption updated.",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.commentOnPost = async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({
                success:false,
                message: "Post not found",
            });
        }

        let commentIndex = -1;

        post.comments.forEach((item, index) =>{
            if(item.user.toString() === req.user._id.toString()){
                commentIndex=index;
            }
        });

        if(commentIndex !== -1){

            post.comments[commentIndex].comment = req.body.comment;

            await post.save();

            res.status(200).json({
                success: true,
                message: "Comment updated",
            });

        } else{
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment,
            });

            await post.save();

            res.status(200).json({
                success: true,
                message: "Comment added",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404).json({
                success:false,
                message: "Post not found",
            });
        }

        if(post.owner.toString() === req.user._id.toString()){

            if(req.body.commentId==undefined){
                return res.status(400).json({
                    success: false,
                    message: "comment id is required",
                });
            }

            post.comments.forEach((item, index) =>{
                if(item._id.toString() === req.body.commentId.toString()){
                    return post.comments.splice(index, 1);
                }
            });

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Comment deleted",
            });
        } else{

            post.comments.forEach((item, index) =>{
                if(item.user.toString() === req.user._id.toString()){
                    return post.comments.splice(index, 1);
                }
            });
            await post.save();
            res.status(200).json({
                success: true,
                message: "comment deleted",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getRecommendedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const allPosts = await Post.find().populate('owner', 'name');

        // Content-Based Filtering: Use tags to find similar posts
        const userLikedPosts = await Post.find({ 'likes.user': req.user._id });
        const userLikedTags = userLikedPosts.flatMap(post => post.tags);

        // Collaborative Filtering: Find posts liked by users you follow
        const followingUsers = user.following;
        const followingUsersLikedPosts = await Post.find({ 'likes.user': { $in: followingUsers } });

        // Combine results
        const recommendedPosts = [];

        // Content-Based: Add posts with similar tags
        allPosts.forEach(post => {
            const commonTags = post.tags.filter(tag => userLikedTags.includes(tag));
            if (commonTags.length > 0 && !userLikedPosts.includes(post._id)) {
                recommendedPosts.push(post);
            }
        });

        // Collaborative: Add posts liked by followed users
        followingUsersLikedPosts.forEach(post => {
            if (!userLikedPosts.includes(post._id) && !recommendedPosts.includes(post)) {
                recommendedPosts.push(post);
            }
        });

        // Remove duplicates
        const uniqueRecommendedPosts = [...new Set(recommendedPosts)];

        res.status(200).json({
            success: true,
            posts: uniqueRecommendedPosts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};