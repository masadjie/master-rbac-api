const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true }, // Contoh: "service"
	label: { type: String }, // opsional, untuk display
	showOnMenu: { type: Boolean, default: false }, // <--- Tambahan
});

module.exports = mongoose.model("Permission", permissionSchema);
