const express = require("express");
const router = express.Router();
const billingCycleController = require("../../controllers/v1/billingcycle.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

// Semua route wajib autentikasi dan cek permission sesuai action
router.get(
	"/",
	authenticate,
	hasPermission("billingcycle", "VIEW"),
	billingCycleController.list
);

router.get(
	"/:id",
	authenticate,
	hasPermission("billingcycle", "VIEW"),
	billingCycleController.getById
);

router.post(
	"/",
	authenticate,
	hasPermission("billingcycle", "CREATE"),
	billingCycleController.create
);

router.put(
	"/:id",
	authenticate,
	hasPermission("billingcycle", "UPDATE"),
	billingCycleController.update
);

router.delete(
	"/:id",
	authenticate,
	hasPermission("billingcycle", "DELETE"),
	billingCycleController.delete
);

module.exports = router;
