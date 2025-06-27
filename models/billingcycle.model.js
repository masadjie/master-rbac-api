const mongoose = require("mongoose");

const billingCycleSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true }, // e.g. "Monthly"
		label: { type: String, required: true }, // e.g. "Billed monthly"
		duration: { type: Number, required: true }, // e.g. 1, 3, 6, 12
		unit: { type: String, required: true, enum: ["month", "year"] }, // "month" or "year"
		isActive: { type: Boolean, default: true }, // Bisa untuk nonaktifkan
		order: { type: Number, default: 0 }, // Urutan tampil di UI
	},
	{ timestamps: true }
);

module.exports = mongoose.model("BillingCycle", billingCycleSchema);
