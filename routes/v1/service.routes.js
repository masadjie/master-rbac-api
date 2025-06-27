const express = require("express");
const router = express.Router();
const serviceController = require("../../controllers/v1/service.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

router.post(
	"/",
	authenticate,
	hasPermission("service", "CREATE"),
	serviceController.createService
);
router.get(
	"/",
	authenticate,
	hasPermission("service", "VIEW"),
	serviceController.getServices
);
router.get(
	"/:id",
	authenticate,
	hasPermission("service", "VIEW"),
	serviceController.getServiceById
);
router.put(
	"/:id",
	authenticate,
	hasPermission("service", "UPDATE"),
	serviceController.updateService
);
router.delete(
	"/:id",
	authenticate,
	hasPermission("service", "DELETE"),
	serviceController.deleteService
);

module.exports = router;
