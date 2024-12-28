const Post = require("../models/post");
const User = require("../models/user");



exports.createPost = async (req, res) => {

    try {
        const newPostData = {
            caption:req.body.caption,
            image:{
                public_id:"req.body.public_id",
                url:"req.body.url"
            },
            owner:req.user._id
        }
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