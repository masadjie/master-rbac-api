const express = require("express");
const router = express.Router();
const serviceItemController = require("../../controllers/v1/serviceitem.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

// Semua route wajib autentikasi dan cek permission sesuai action
router.post(
	"/",
	authenticate,
	hasPermission("serviceitem", "CREATE"),
	serviceItemController.createServiceItem
);

router.get(
	"/",
	authenticate,
	hasPermission("serviceitem", "VIEW"),
	serviceItemController.getServiceItems
);

router.get(
	"/:id",
	authenticate,
	hasPermission("serviceitem", "VIEW"),
	serviceItemController.getServiceItemById
);

router.put(
	"/:id",
	authenticate,
	hasPermission("serviceitem", "UPDATE"),
	serviceItemController.updateServiceItem
);

router.delete(
	"/:id",
	authenticate,
	hasPermission("serviceitem", "DELETE"),
	serviceItemController.deleteServiceItem
);

module.exports = router;
