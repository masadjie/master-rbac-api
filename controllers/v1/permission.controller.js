const Permission = require("../../models/permission.model");

exports.list = async (req, res) => {
	const permissions = await Permission.find();
	res.json({ permissions });
};

exports.create = async (req, res) => {
	const { name, actions, label } = req.body;
	if (await Permission.findOne({ name })) {
		return res.status(409).json({ message: "Permission already exists" });
	}
	const permission = await Permission.create({ name, actions, label });
	res.status(201).json({ permission });
};

exports.update = async (req, res) => {
	const { id } = req.params;
	const { name, actions, label } = req.body;
	const permission = await Permission.findByIdAndUpdate(
		id,
		{ name, actions, label },
		{ new: true }
	);
	if (!permission)
		return res.status(404).json({ message: "Permission not found" });
	res.json({ permission });
};

exports.delete = async (req, res) => {
	const { id } = req.params;
	const permission = await Permission.findByIdAndDelete(id);
	if (!permission)
		return res.status(404).json({ message: "Permission not found" });
	res.json({ message: "Permission deleted" });
};
