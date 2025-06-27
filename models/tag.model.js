// models/tag.model.js
const mongoose = require("mongoose");
const tagSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	label: { type: String }, // opsional, untuk display
	color: { type: String }, // opsional, untuk styling
});
module.exports = mongoose.model("Tag", tagSchema);
