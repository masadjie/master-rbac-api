const express = require("express");
const router = express.Router();
const permissionController = require("../../controllers/v1/permission.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { onlySuperAdmin } = require("../../middleware/role.middleware");

// Semua endpoint hanya untuk super admin
router.get("/", authenticate, onlySuperAdmin, permissionController.list);
router.post("/", authenticate, onlySuperAdmin, permissionController.create);
router.put("/:id", authenticate, onlySuperAdmin, permissionController.update);
router.delete(
	"/:id",
	authenticate,
	onlySuperAdmin,
	permissionController.delete
);

module.exports = router;
