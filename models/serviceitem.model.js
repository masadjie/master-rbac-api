const mongoose = require("mongoose");
const Service = require("./service.model");

const specSchema = new mongoose.Schema(
	{
		key: { type: String, required: true },
		value: { type: mongoose.Schema.Types.Mixed, required: true },
		unit: { type: String },
	},
	{ _id: false }
);

const serviceItemSchema = new mongoose.Schema(
	{
		service: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Service",
			required: true,
		}, // Relasi ke Service (produk utama)
		name: { type: String, required: true },
		description: { type: String },
		specs: [specSchema],
		price: { type: Number, required: true },
		billingCycle: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "BillingCycle",
			required: true,
		},
		note: String,
		tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
		comingSoon: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = Service.discriminator("ServiceItem", serviceItemSchema);
