const User = require("../../models/user.model");
const Permission = require("../../models/permission.model");

exports.getMenu = async (req, res, next) => {
	try {
		// Cari user dan populate role.permissions.permission
		const user = await User.findById(req.user.id).populate({
			path: "role",
			populate: {
				path: "permissions.permission",
				model: "Permission",
			},
		});
		if (!user) return res.status(401).json({ message: "Unauthorized" });

		// Hanya tampilkan permission yang showOnMenu true
		const menu = user.role.permissions
			.filter((item) => item.permission && item.permission.showOnMenu)
			.map((item) => ({
				key: item.permission.name,
				label: item.permission.label || item.permission.name,
				actions: item.actions,
			}));

		res.json({ menu });
	} catch (err) {
		next(err);
	}
};
