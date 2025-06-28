const express = require("express");
const router = express.Router();
const authController = require("../../controllers/v1/auth.controller");

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/request-otp", authController.requestOtp);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/google-login", authController.googleLogin);


module.exports = router;
