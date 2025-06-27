const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String },
		price: { type: Number, required: true },
		icon: { type: String, required: true },
		tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
		comingSoon: { type: Boolean, default: false }, // <--- Tambahan
	},
	{
		timestamps: true,
		discriminatorKey: "kind",
	}
);

module.exports = mongoose.model("Service", serviceSchema);
