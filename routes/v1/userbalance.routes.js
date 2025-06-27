const express = require("express");
const router = express.Router();
const userBalanceController = require("../../controllers/v1/userbalance.controller");
const { authenticate } = require("../../middleware/auth.middleware");
const { hasPermission } = require("../../middleware/permission.middleware");

// Semua route wajib autentikasi dan cek permission sesuai action

// Get user balance
router.get(
	"/:userId",
	authenticate,
	hasPermission("userbalance", "VIEW"),
	userBalanceController.getByUserId
);

// Credit balance
router.post(
	"/:userId/credit",
	authenticate,
	hasPermission("userbalance", "UPDATE"),
	userBalanceController.credit
);

// Debit balance
router.post(
	"/:userId/debit",
	authenticate,
	hasPermission("userbalance", "UPDATE"),
	userBalanceController.debit
);

// Get balance history
router.get(
	"/:userId/history",
	authenticate,
	hasPermission("userbalance", "VIEW"),
	userBalanceController.getHistory
);

// Top Up balance (khusus, bisa dipakai user atau admin)
router.post(
    "/:userId/topup",
    authenticate,
    hasPermission("userbalance", "UPDATE"),
    userBalanceController.topUp
  );
  

module.exports = router;
