const express = require("express");
const router = express.Router();
const userController = require("../../controllers/v1/user.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

// Semua route wajib autentikasi dan cek permission sesuai action
router.get(
	"/",
	authenticate,
	hasPermission("userManagement", "VIEW"),
	userController.list
);

router.get(
	"/:id",
	authenticate,
	hasPermission("userManagement", "VIEW"),
	userController.getById
);

router.post(
	"/",
	authenticate,
	hasPermission("userManagement", "CREATE"),
	userController.create
);

router.put(
	"/:id",
	authenticate,
	hasPermission("userManagement", "UPDATE"),
	userController.update
);

router.delete(
	"/:id",
	authenticate,
	hasPermission("userManagement", "DELETE"),
	userController.delete
);

module.exports = router;
