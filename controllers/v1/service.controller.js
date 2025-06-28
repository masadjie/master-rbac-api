const Service = require("../../models/service.model");
const ServiceItem = require("../../models/serviceitem.model");
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
		const filter = { kind: { $exists: false } }; // Hanya Service utama
		if (q) filter.name = { $regex: q, $options: "i" };
		if (tag) filter.tags = tag;
		if (comingSoon !== undefined) filter.comingSoon = comingSoon === "true";

		// Ambil semua service utama
		const services = await Service.find(filter).populate("tags");

		// Ambil semua variant (ServiceItem) yang terkait dengan service di atas
		const serviceIds = services.map((s) => s._id);
		const variants = await ServiceItem.find({ service: { $in: serviceIds } })
			.populate("tags")
			.populate("billingCycle");

		// Gabungkan variants ke masing-masing service
		const servicesWithVariants = services.map((service) => {
			const serviceVariants = variants.filter(
				(v) => v.service.toString() === service._id.toString()
			);
			const serviceObj = service.toObject();
			serviceObj.variants = serviceVariants;
			return serviceObj;
		});

		res.json({ success: true, services: servicesWithVariants });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Read single service
exports.getServiceById = async (req, res) => {
	try {
		// Ambil service utama (bukan variant)
		const service = await Service.findById(req.params.id).populate("tags");
		if (!service) {
			return res
				.status(404)
				.json({ success: false, message: "Service not found" });
		}

		// Ambil semua variant (ServiceItem) yang terkait dengan service ini
		const variants = await ServiceItem.find({ service: service._id })
			.populate("tags")
			.populate("billingCycle");

		// Gabungkan variants ke dalam object service
		const serviceObj = service.toObject();
		serviceObj.variants = variants;

		res.json({ success: true, service: serviceObj });
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
