const BillingCycle = require("../../models/billingcycle.model");

// List all billing cycles (optionally only active ones)
exports.list = async (req, res) => {
	try {
		const { active } = req.query;
		const filter = {};
		if (active === "true") filter.isActive = true;
		const billingCycles = await BillingCycle.find(filter).sort({ order: 1 });
		res.json({ billingCycles });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Get billing cycle by ID
exports.getById = async (req, res) => {
	try {
		const billingCycle = await BillingCycle.findById(req.params.id);
		if (!billingCycle)
			return res.status(404).json({ message: "Billing cycle not found" });
		res.json({ billingCycle });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Create billing cycle
exports.create = async (req, res) => {
	try {
		const { name, label, duration, unit, isActive, order } = req.body;
		if (await BillingCycle.findOne({ name })) {
			return res.status(409).json({ message: "Billing cycle already exists" });
		}
		const billingCycle = await BillingCycle.create({
			name,
			label,
			duration,
			unit,
			isActive,
			order,
		});
		res.status(201).json({ billingCycle });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Update billing cycle
exports.update = async (req, res) => {
	try {
		const { name, label, duration, unit, isActive, order } = req.body;
		const billingCycle = await BillingCycle.findByIdAndUpdate(
			req.params.id,
			{ name, label, duration, unit, isActive, order },
			{ new: true }
		);
		if (!billingCycle)
			return res.status(404).json({ message: "Billing cycle not found" });
		res.json({ billingCycle });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Delete billing cycle
exports.delete = async (req, res) => {
	try {
		const billingCycle = await BillingCycle.findByIdAndDelete(req.params.id);
		if (!billingCycle)
			return res.status(404).json({ message: "Billing cycle not found" });
		res.json({ message: "Billing cycle deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
