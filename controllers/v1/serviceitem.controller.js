const ServiceItem = require("../../models/serviceitem.model");

// Create ServiceItem (variant)
exports.createServiceItem = async (req, res) => {
	try {
		if (req.body.tags && !Array.isArray(req.body.tags)) {
			req.body.tags = [req.body.tags];
		}
		const serviceItem = new ServiceItem(req.body);
		await serviceItem.save();
		await serviceItem
			.populate("tags")
			.populate("service")
			.populate("billingCycle");
		res.status(201).json({ success: true, serviceItem });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// List all ServiceItems (variants), filter by service, tag, billingCycle, comingSoon, etc.
exports.getServiceItems = async (req, res) => {
	try {
		const { q, tag, service, billingCycle, comingSoon } = req.query;
		const filter = { kind: "ServiceItem" };
		if (q) filter.name = { $regex: q, $options: "i" };
		if (tag) filter.tags = tag;
		if (service) filter.service = service;
		if (billingCycle) filter.billingCycle = billingCycle;
		if (comingSoon !== undefined) filter.comingSoon = comingSoon === "true";
		const serviceItems = await ServiceItem.find(filter)
			.populate("tags")
			.populate("service")
			.populate("billingCycle");
		res.json({ success: true, serviceItems });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Get ServiceItem (variant) by id
exports.getServiceItemById = async (req, res) => {
	try {
		const serviceItem = await ServiceItem.findById(req.params.id)
			.populate("tags")
			.populate("service")
			.populate("billingCycle");
		if (!serviceItem)
			return res
				.status(404)
				.json({ success: false, message: "ServiceItem not found" });
		res.json({ success: true, serviceItem });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Update ServiceItem (variant)
exports.updateServiceItem = async (req, res) => {
	try {
		if (req.body.tags && !Array.isArray(req.body.tags)) {
			req.body.tags = [req.body.tags];
		}
		const serviceItem = await ServiceItem.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true }
		)
			.populate("tags")
			.populate("service")
			.populate("billingCycle");
		if (!serviceItem)
			return res
				.status(404)
				.json({ success: false, message: "ServiceItem not found" });
		res.json({ success: true, serviceItem });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

// Delete ServiceItem (variant)
exports.deleteServiceItem = async (req, res) => {
	try {
		const serviceItem = await ServiceItem.findByIdAndDelete(req.params.id);
		if (!serviceItem)
			return res
				.status(404)
				.json({ success: false, message: "ServiceItem not found" });
		res.json({ success: true, message: "ServiceItem deleted" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};
