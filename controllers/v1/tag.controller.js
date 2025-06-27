const Tag = require("../../models/tag.model");

// List all tags
exports.list = async (req, res) => {
	const tags = await Tag.find();
	res.json({ tags });
};

// Create tag
exports.create = async (req, res) => {
	const { name, label, color } = req.body;
	if (await Tag.findOne({ name })) {
		return res.status(409).json({ message: "Tag already exists" });
	}
	const tag = await Tag.create({ name, label, color });
	res.status(201).json({ tag });
};

// Update tag
exports.update = async (req, res) => {
	const { id } = req.params;
	const { name, label, color } = req.body;
	const tag = await Tag.findByIdAndUpdate(
		id,
		{ name, label, color },
		{ new: true }
	);
	if (!tag) return res.status(404).json({ message: "Tag not found" });
	res.json({ tag });
};

// Delete tag
exports.delete = async (req, res) => {
	const { id } = req.params;
	const tag = await Tag.findByIdAndDelete(id);
	if (!tag) return res.status(404).json({ message: "Tag not found" });
	res.json({ message: "Tag deleted" });
};

// Read single tag
exports.getTagById = async (req, res) => {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.json({ tag });
};