const UserBalance = require("../../models/userbalance.model");
const midtransClient = require("midtrans-client");
const User = require("../../models/user.model");
const crypto = require("crypto");

// Helper untuk validasi signature_key Midtrans
function isValidMidtransSignature(body, serverKey) {
	// signature_key = sha512(order_id + status_code + gross_amount + serverKey)
	const { order_id, status_code, gross_amount, signature_key } = body;
	const raw = order_id + status_code + gross_amount + serverKey;
	const hash = crypto.createHash("sha512").update(raw).digest("hex");
	return hash === signature_key;
}

// Request Top Up (Midtrans Core API)
exports.requestTopUp = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, payment_type, bank } = req.body;

		if (!amount || amount <= 0) {
			return res.status(400).json({ message: "Amount must be positive" });
		}
		if (!payment_type) {
			return res.status(400).json({ message: "payment_type is required" });
		}
		if (payment_type === "bank_transfer" && !bank) {
			return res
				.status(400)
				.json({ message: "Bank is required for bank_transfer" });
		}

		// Cari user
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Generate order id unik
		const orderId = `topup-${userId}-${Date.now()}`;

		// Inisialisasi Core API Midtrans
		const core = new midtransClient.CoreApi({
			isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
			serverKey: process.env.MIDTRANS_SERVER_KEY,
		});

		// Siapkan parameter charge
		let chargeParams = {
			payment_type,
			transaction_details: {
				order_id: orderId,
				gross_amount: amount,
			},
			customer_details: {
				first_name: user.fullName || user.email,
				email: user.email,
				phone: user.phoneNumber,
			},
		};

		// Bank Transfer (pilih bank)
		if (payment_type === "bank_transfer") {
			chargeParams.bank_transfer = { bank }; // bank: "bca", "bni", "bri", "permata", "cimb", "danamon"
		}

		// QRIS
		if (payment_type === "qris") {
			// Tidak perlu tambahan param
		}

		// GoPay
		if (payment_type === "gopay") {
			chargeParams.gopay = { enable_callback: false, callback_url: "" };
		}

		// Kirim request ke Midtrans
		const chargeResponse = await core.charge(chargeParams);

		console.log(orderId);

		res.json({
			success: true,
			orderId,
			payment_type,
			bank: payment_type === "bank_transfer" ? bank : undefined,
			midtrans: chargeResponse,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Get balance by user ID
exports.getByUserId = async (req, res) => {
	try {
		const { userId } = req.params;
		let balance = await UserBalance.findOne({ user: userId }).populate(
			"user",
			"email role"
		);
		if (!balance) {
			// Jika saldo tidak ada, buat objek balance dengan saldo 0 dan history kosong
			balance = {
				user: userId,
				balance: 0,
				history: [],
			};
		}
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Credit balance
exports.credit = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, description } = req.body;
		if (amount <= 0)
			return res.status(400).json({ message: "Amount must be positive" });

		const balance = await UserBalance.findOneAndUpdate(
			{ user: userId },
			{
				$inc: { balance: amount },
				$push: {
					history: {
						type: "credit",
						amount,
						description,
						date: new Date(),
					},
				},
			},
			{ new: true, upsert: true }
		);
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Debit balance (with check)
exports.debit = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, description } = req.body;
		if (amount <= 0)
			return res.status(400).json({ message: "Amount must be positive" });

		// Atomic check and update
		const balance = await UserBalance.findOneAndUpdate(
			{ user: userId, balance: { $gte: amount } },
			{
				$inc: { balance: -amount },
				$push: {
					history: {
						type: "debit",
						amount,
						description,
						date: new Date(),
					},
				},
			},
			{ new: true }
		);
		if (!balance)
			return res.status(400).json({ message: "Insufficient balance" });
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Get balance history
exports.getHistory = async (req, res) => {
	try {
		const { userId } = req.params;
		const balance = await UserBalance.findOne(
			{ user: userId },
			"history balance user"
		);
		if (!balance) {
			// Jika belum ada, balikan objek balance default
			return res.json({
				balance: {
					user: userId,
					balance: 0,
					history: [],
				},
			});
		}
		// Jika ada, balikan objek balance dengan history
		return res.json({
			balance: {
				user: balance.user,
				balance: balance.balance || 0,
				history: balance.history || [],
			},
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Top Up Balance (manual, untuk admin)
exports.topUp = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, description } = req.body;
		if (!amount || amount <= 0) {
			return res.status(400).json({ message: "Amount must be positive" });
		}

		const balance = await UserBalance.findOneAndUpdate(
			{ user: userId },
			{
				$inc: { balance: amount },
				$push: {
					history: {
						type: "credit",
						amount,
						description: description || "Top Up",
						date: new Date(),
					},
				},
			},
			{ new: true, upsert: true }
		);
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Webhook Midtrans (otomatis)
exports.midtransWebhook = async (req, res) => {
	try {
		const notification = req.body;
		const {
			order_id,
			transaction_status,
			gross_amount,
			status_code,
			signature_key,
		} = notification;

		// Validasi signature_key
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!isValidMidtransSignature(notification, serverKey)) {
			return res.status(403).json({ message: "Invalid signature key" });
		}

		// Ambil userId dari order_id (topup-<userId>-<timestamp>)
		const match = order_id.match(/^topup-(.+?)-/);
		const userId = match ? match[1] : null;

		const PAID_STATUSES = ["settlement", "capture", "success"];

		if (userId && PAID_STATUSES.includes(transaction_status)) {
			// Cek apakah sudah pernah diproses (idempotent)
			const balanceDoc = await UserBalance.findOne({ user: userId });
			const alreadyCredited =
				balanceDoc &&
				balanceDoc.history.some(
					(h) => h.description && h.description.includes(order_id)
				);

			if (!alreadyCredited) {
				await UserBalance.findOneAndUpdate(
					{ user: userId },
					{
						$inc: { balance: parseInt(gross_amount) },
						$push: {
							history: {
								type: "credit",
								amount: parseInt(gross_amount),
								description: `Top Up (${order_id})`,
								date: new Date(),
							},
						},
					},
					{ upsert: true }
				);
			}
		}

		res.status(200).json({ success: true, status, balanceUpdated });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Manual Check Payment Status (dan update saldo jika sudah dibayar)
exports.checkPaymentStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const core = new midtransClient.CoreApi({
			isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
			serverKey: process.env.MIDTRANS_SERVER_KEY,
		});

		const status = await core.transaction.status(orderId);

		// Ambil userId dari orderId (topup-<userId>-<timestamp>)
		const match = orderId.match(/^topup-(.+?)-/);
		const userId = match ? match[1] : null;

		const PAID_STATUSES = ["settlement", "capture", "success"];
		let balanceUpdated = false;

		if (userId && PAID_STATUSES.includes(status.transaction_status)) {
			// Cek apakah history untuk orderId ini sudah ada
			const balanceDoc = await UserBalance.findOne({ user: userId });

			const alreadyCredited =
				balanceDoc &&
				balanceDoc.history.some(
					(h) => h.description && h.description.includes(orderId)
				);

			if (!alreadyCredited) {
				await UserBalance.findOneAndUpdate(
					{ user: userId },
					{
						$inc: { balance: parseInt(status.gross_amount) },
						$push: {
							history: {
								type: "credit",
								amount: parseInt(status.gross_amount),
								description: `Top Up (${orderId})`,
								date: new Date(),
							},
						},
					},
					{ upsert: true }
				);
				balanceUpdated = true;
			}
		}

		res.status(200).json({ success: true, status, balanceUpdated });
	} catch (err) {
		console.log(err);

		res.status(500).json({ message: err.message });
	}
};
