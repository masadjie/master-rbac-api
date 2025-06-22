const express = require("express");
const router = express.Router();
const authController = require("../../controllers/v1/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
