const mongoose = require("mongoose");

const userBalanceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		balance: { type: Number, default: 0 },
		history: [
			{
				type: {
					type: String, // "credit" | "debit"
					enum: ["credit", "debit"],
					required: true,
				},
				amount: { type: Number, required: true },
				description: { type: String },
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model("UserBalance", userBalanceSchema);
