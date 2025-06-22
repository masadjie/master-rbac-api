const User = require("../models/user.model");

exports.onlySuperAdmin = async (req, res, next) => {
	// Pastikan sudah authenticate dulu!
	const user = await User.findById(req.user.id).populate("role");
	if (!user || user.role.name !== "super admin") {
		return res
			.status(403)
			.json({ message: "Forbidden: Only super admin allowed" });
	}
	next();
};
