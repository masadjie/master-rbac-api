const User = require("../../models/user.model");
const Permission = require("../../models/permission.model");

exports.getMenu = async (req, res, next) => {
	try {
		// Cari user dan populate role beserta permissions
		const user = await User.findById(req.user.id).populate({
			path: "role",
			populate: { path: "permissions" },
		});
		if (!user) return res.status(401).json({ message: "Unauthorized" });

		// Ambil permission user (array of Permission object)
		const userPermissions = user.role.permissions;

		// Format menu dari permission yang user miliki
		const menu = userPermissions.map((perm) => ({
			key: perm.name,
			label: perm.label || perm.name, // label bisa diambil dari field label, fallback ke name
			actions: perm.actions,
		}));

		res.json({ menu });
	} catch (err) {
		next(err);
	}
};
