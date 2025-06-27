const User = require("../models/user.model");

exports.hasPermission = (permissionName, action) => async (req, res, next) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		const user = await User.findById(req.user.id).populate({
			path: "role",
			populate: { path: "permissions.permission" },
		});
		if (!user) return res.status(401).json({ message: "Unauthorized" });

		// Cari permission pada role user
		const permObj = user.role.permissions.find(
			(p) => p.permission && p.permission.name === permissionName
		);

		console.log(user);

		if (!permObj) {
			return res
				.status(403)
				.json({ message: `Forbidden: No permission for ${permissionName}` });
		}
		if (action && (!permObj.actions || !permObj.actions.includes(action))) {
			return res.status(403).json({
				message: `Forbidden: No ${action} access for ${permissionName}`,
			});
		}
		next();
	} catch (err) {
		res.status(500).json({ message: "Internal server error" });
	}
};
