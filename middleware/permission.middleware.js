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

		if (!permObj) {
			return res
				.status(403)
				.json({ message: `Forbidden: No permission for ${permissionName}` });
		}

		// Mendukung action tunggal atau array (VIEW dan READ sekaligus)
		if (action) {
			const actionList = Array.isArray(action) ? action : [action];
			const hasAction =
				permObj.actions && permObj.actions.some((a) => actionList.includes(a));
			if (!hasAction) {
				return res.status(403).json({
					message: `Forbidden: No ${actionList.join(
						"/"
					)} access for ${permissionName}`,
				});
			}
		}

		next();
	} catch (err) {
		res.status(500).json({ message: "Internal server error" });
	}
};

