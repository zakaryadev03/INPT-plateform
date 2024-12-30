const express = require("express");
const { register, login, followUser, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUsers, forgotpassword, resetpassword } = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot/password").post(forgotpassword);

router.route("/logout").get(logout);
router.route("/follow/:id").get(isAuthenticated, followUser);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);

router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/password/reset/:token").put(resetpassword);

router.route("/delete/me").delete(isAuthenticated, deleteMyProfile);


module.exports = router;