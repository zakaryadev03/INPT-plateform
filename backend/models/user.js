const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },

    avatar: {
        public_id: String,
        url: String,
    },

    email: {
        type: String,
        required: [true, "Please enter your inemail"],
        unique: [true, "Already existed"],
    },

    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "The password must be At least 6 characters."],
        select: false,
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post", 
        },
    ],

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
        },
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
        },
    ],
});

module.exports = mongoose.model("User", userSchema);