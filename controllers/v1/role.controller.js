const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");

exports.list = async (req, res) => {
	const roles = await Role.find().populate("permissions");
	res.json({ roles });
};

exports.create = async (req, res) => {
	const { name, permissionIds } = req.body;
	if (await Role.findOne({ name })) {
		return res.status(409).json({ message: "Role already exists" });
	}
	const permissions = await Permission.find({ _id: { $in: permissionIds } });
	const role = await Role.create({
		name,
		permissions: permissions.map((p) => p._id),
	});
	res.status(201).json({ role });
};

exports.update = async (req, res) => {
	const { id } = req.params;
	const { name, permissionIds } = req.body;
	const permissions = await Permission.find({ _id: { $in: permissionIds } });
	const role = await Role.findByIdAndUpdate(
		id,
		{ name, permissions: permissions.map((p) => p._id) },
		{ new: true }
	).populate("permissions");
	if (!role) return res.status(404).json({ message: "Role not found" });
	res.json({ role });
};

exports.delete = async (req, res) => {
	const { id } = req.params;
	const role = await Role.findByIdAndDelete(id);
	if (!role) return res.status(404).json({ message: "Role not found" });
	res.json({ message: "Role deleted" });
};
