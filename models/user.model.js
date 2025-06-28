const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema(
	{
		code: { type: String },
		expiresAt: { type: Date },
		verified: { type: Boolean, default: false },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		fullName: { type: String, required: true, trim: true },
		phoneNumber: { type: String, trim: true },
		role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
		refreshTokens: [{ token: String }],
		otp: otpSchema,
		isActive: { type: Boolean, default: false },
		otpRequests: [{ type: Date }], // <-- Log permintaan OTP
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
	}
	next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
