const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	permissions: [
		{
			permission: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Permission",
				required: true,
			},
			actions: [{ type: String }], // ["VIEW", "CREATE", ...]
		},
	],
});
module.exports = mongoose.model("Role", roleSchema);
