const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

userSchema.pre("save", async function (next) {
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();  
});

userSchema.methods.matchPassword = async function (password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function () {
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET);
}

module.exports = mongoose.model("User", userSchema);