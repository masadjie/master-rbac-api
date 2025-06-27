const Permission = require("../../models/permission.model");

// List all permissions
exports.list = async (req, res) => {
	const permissions = await Permission.find();
	res.json({ permissions });
};

// Create permission
exports.create = async (req, res) => {
	const { name, label, showOnMenu } = req.body;
	if (await Permission.findOne({ name })) {
		return res.status(409).json({ message: "Permission already exists" });
	}
	const permission = await Permission.create({ name, label, showOnMenu });
	res.status(201).json({ permission });
};

// Update permission
exports.update = async (req, res) => {
	const { id } = req.params;
	const { name, label, showOnMenu } = req.body;
	const permission = await Permission.findByIdAndUpdate(
		id,
		{ name, label, showOnMenu },
		{ new: true }
	);
	if (!permission)
		return res.status(404).json({ message: "Permission not found" });
	res.json({ permission });
};

// Delete permission
exports.delete = async (req, res) => {
	const { id } = req.params;
	const permission = await Permission.findByIdAndDelete(id);
	if (!permission)
		return res.status(404).json({ message: "Permission not found" });
	res.json({ message: "Permission deleted" });
};
