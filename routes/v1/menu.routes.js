const express = require("express");
const router = express.Router();
const menuController = require("../../controllers/v1/menu.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

// Contoh: akses menu utama hanya untuk user dengan permission "service" dan action "VIEW"
router.get(
	"/",
	authenticate,
	hasPermission("service", "VIEW"),
	menuController.getMenu
);

module.exports = router;
