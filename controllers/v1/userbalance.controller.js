const UserBalance = require("../../models/userbalance.model");

// Get balance by user ID
exports.getByUserId = async (req, res) => {
	try {
		const { userId } = req.params;
		const balance = await UserBalance.findOne({ user: userId }).populate(
			"user",
			"email role"
		);
		if (!balance) return res.status(404).json({ message: "Balance not found" });
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Credit balance
exports.credit = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, description } = req.body;
		if (amount <= 0)
			return res.status(400).json({ message: "Amount must be positive" });

		const balance = await UserBalance.findOneAndUpdate(
			{ user: userId },
			{
				$inc: { balance: amount },
				$push: {
					history: {
						type: "credit",
						amount,
						description,
					},
				},
			},
			{ new: true, upsert: true }
		);
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Debit balance (with check)
exports.debit = async (req, res) => {
	try {
		const { userId } = req.params;
		const { amount, description } = req.body;
		if (amount <= 0)
			return res.status(400).json({ message: "Amount must be positive" });

		// Atomic check and update
		const balance = await UserBalance.findOneAndUpdate(
			{ user: userId, balance: { $gte: amount } },
			{
				$inc: { balance: -amount },
				$push: {
					history: {
						type: "debit",
						amount,
						description,
					},
				},
			},
			{ new: true }
		);
		if (!balance)
			return res.status(400).json({ message: "Insufficient balance" });
		res.json({ balance });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Get balance history
exports.getHistory = async (req, res) => {
	try {
		const { userId } = req.params;
		const balance = await UserBalance.findOne({ user: userId }, "history");
		if (!balance) return res.status(404).json({ message: "Balance not found" });
		res.json({ history: balance.history });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Top Up Balance (khusus untuk top up, misal dari user atau admin)
exports.topUp = async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, description } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Amount must be positive" });
      }
  
      const balance = await UserBalance.findOneAndUpdate(
        { user: userId },
        {
          $inc: { balance: amount },
          $push: {
            history: {
              type: "credit",
              amount,
              description: description || "Top Up"
            }
          }
        },
        { new: true, upsert: true }
      );
      res.json({ balance });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  