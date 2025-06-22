const User = require("../models/user.model");

exports.hasPermission = (permissionName, action) => async (req, res, next) => {
	try {
		// Pastikan user sudah di-authenticate dan ada id
		if (!req.user || !req.user.id) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		// Query user dan populate role & permissions
		const user = await User.findById(req.user.id).populate({
			path: "role",
			populate: { path: "permissions" },
		});
		if (!user) return res.status(401).json({ message: "Unauthorized" });

		// Cari permission yang sesuai
		const permission = user.role.permissions.find(
			(p) => p.name === permissionName
		);
		if (!permission) {
			return res
				.status(403)
				.json({ message: `Forbidden: No permission for ${permissionName}` });
		}

		// Jika pakai granular action
		if (
			action &&
			(!permission.actions || !permission.actions.includes(action))
		) {
			return res
				.status(403)
				.json({
					message: `Forbidden: No ${action} access for ${permissionName}`,
				});
		}

		next();
	} catch (err) {
		res.status(500).json({ message: "Internal server error" });
	}
};
