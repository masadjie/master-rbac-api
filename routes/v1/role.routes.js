const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/v1/role.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { onlySuperAdmin } = require("../../middleware/role.middleware");

// Semua endpoint hanya untuk super admin
router.get("/", authenticate, onlySuperAdmin, roleController.list);
router.get("/:id", authenticate, onlySuperAdmin, roleController.getById);
router.post("/", authenticate, onlySuperAdmin, roleController.create);
router.put("/:id", authenticate, onlySuperAdmin, roleController.update);
router.delete("/:id", authenticate, onlySuperAdmin, roleController.delete);

module.exports = router;
