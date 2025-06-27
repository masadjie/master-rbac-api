const User = require("../../models/user.model");
const Role = require("../../models/role.model");

// List all users
exports.list = async (req, res) => {
	try {
		const users = await User.find().populate("role", "name permissions");
		res.json({ users });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Get user by ID
exports.getById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate(
			"role",
			"name permissions"
		);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json({ user });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Create user
exports.create = async (req, res) => {
	try {
		const { email, password, role, fullName, phoneNumber } = req.body;

		if (!fullName) {
			return res.status(400).json({ message: "fullName is required" });
		}

		if (await User.findOne({ email })) {
			return res.status(409).json({ message: "Email already registered" });
		}

		// Optionally: validate role exists
		const roleExists = await Role.findById(role);
		if (!roleExists) return res.status(400).json({ message: "Invalid role" });

		const user = new User({ email, password, role, fullName, phoneNumber });
		await user.save();

		res.status(201).json({
			user: {
				_id: user._id,
				email: user.email,
				fullName: user.fullName,
				phoneNumber: user.phoneNumber,
				role: user.role,
			},
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Update user
exports.update = async (req, res) => {
	try {
		const { email, password, role, fullName, phoneNumber } = req.body;
		const updateData = {};

		if (email) updateData.email = email;
		if (role) updateData.role = role;
		if (password) updateData.password = password;
		if (fullName) updateData.fullName = fullName;
		if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

		let user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Jika ingin fullName tetap wajib saat update:
		if (updateData.fullName === undefined && !user.fullName) {
			return res.status(400).json({ message: "fullName is required" });
		}

		Object.assign(user, updateData);
		await user.save();
		user = await User.findById(user._id).populate("role", "name permissions");
		res.json({ user });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Delete user
exports.delete = async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json({ message: "User deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
