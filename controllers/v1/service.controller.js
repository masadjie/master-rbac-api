const Service = require("../../models/service.model");
const Tag = require("../../models/tag.model");

// Create service (tags: array of tagId)
exports.createService = async (req, res) => {
	try {
		if (req.body.tags && !Array.isArray(req.body.tags)) {
			req.body.tags = [req.body.tags];
		}
		// comingSoon bisa langsung diambil dari req.body
		const service = new Service(req.body);
		await service.save();
		await service.populate("tags");
		res.status(201).json({ success: true, service });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Read all services (support filter by tag, search by name, filter by comingSoon)
exports.getServices = async (req, res) => {
	try {
		const { q, tag, comingSoon } = req.query;
		const filter = {};
		if (q) filter.name = { $regex: q, $options: "i" };
		if (tag) filter.tags = tag;
		if (comingSoon !== undefined) filter.comingSoon = comingSoon === "true";
		const services = await Service.find(filter).populate("tags");
		res.json({ success: true, services });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Read single service
exports.getServiceById = async (req, res) => {
	try {
		const service = await Service.findById(req.params.id).populate("tags");
		if (!service)
			return res
				.status(404)
				.json({ success: false, message: "Service not found" });
		res.json({ success: true, service });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Update service
exports.updateService = async (req, res) => {
	try {
		if (req.body.tags && !Array.isArray(req.body.tags)) {
			req.body.tags = [req.body.tags];
		}
		// comingSoon bisa diupdate
		const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		}).populate("tags");
		if (!service)
			return res
				.status(404)
				.json({ success: false, message: "Service not found" });
		res.json({ success: true, service });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Delete service
exports.deleteService = async (req, res) => {
	try {
		const service = await Service.findByIdAndDelete(req.params.id);
		if (!service)
			return res
				.status(404)
				.json({ success: false, message: "Service not found" });
		res.json({ success: true, message: "Service deleted" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
