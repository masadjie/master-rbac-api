const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true }, // Contoh: "service"
	actions: [{ type: String }], // Contoh: ["VIEW", "CREATE", "UPDATE", "DELETE"]
});

module.exports = mongoose.model("Permission", permissionSchema);
