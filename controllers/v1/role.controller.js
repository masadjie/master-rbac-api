const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");

exports.list = async (req, res) => {
	const roles = await Role.find().populate("permissions.permission");
	res.json({ roles });
};

exports.create = async (req, res) => {
	const { name, permissions } = req.body;
	// permissions: [{ permission: "permId", actions: ["VIEW", "CREATE"] }]
	if (await Role.findOne({ name })) {
		return res.status(409).json({ message: "Role already exists" });
	}
	// Validasi permission id dan actions jika perlu
	const role = await Role.create({ name, permissions });
	res.status(201).json({ role });
};

exports.update = async (req, res) => {
	const { id } = req.params;
	const { name, permissions } = req.body;
	const role = await Role.findByIdAndUpdate(
		id,
		{ name, permissions },
		{ new: true }
	).populate("permissions.permission");
	if (!role) return res.status(404).json({ message: "Role not found" });
	res.json({ role });
};

exports.delete = async (req, res) => {
	const { id } = req.params;
	const role = await Role.findByIdAndDelete(id);
	if (!role) return res.status(404).json({ message: "Role not found" });
	res.json({ message: "Role deleted" });
};

exports.getById = async (req, res) => {
	const { id } = req.params;
	try {
		const role = await Role.findById(id).populate("permissions.permission");
		if (!role) return res.status(404).json({ message: "Role not found" });
		res.json({ role });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
