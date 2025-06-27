const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user, role) => {
	const accessToken = jwt.sign(
		{ id: user._id, email: user.email, role: role.name },
		process.env.JWT_SECRET,
		{ expiresIn: "15m" }
	);
	const refreshToken = jwt.sign(
		{ id: user._id, email: user.email, role: role.name },
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: "7d" }
	);
	return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
	try {
		const { email, password} = req.body;
        roleName = "user";
		if (await User.findOne({ email })) {
			return res
				.status(409)
				.json({ success: false, message: "Email sudah terdaftar" });
		}
		const role = await Role.findOne({ name: roleName });
		if (!role)
			return res
				.status(400)
				.json({ success: false, message: "Role tidak ditemukan" });
		const user = new User({ email, password, role: role._id });
		await user.save();

		// Setelah register, langsung login (generate dan simpan token)
		const tokens = generateTokens(user, role);
		user.refreshTokens.push({ token: tokens.refreshToken });
		await user.save();

		const isProduction = process.env.NODE_ENV === "production";
		res
			.cookie("accessToken", tokens.accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 15 * 60 * 1000,
			})
			.cookie("refreshToken", tokens.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.status(201)
			.json({
				success: true,
				message: "Registrasi dan login berhasil",
				accessToken: tokens.accessToken,
			});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
        
        
		const user = await User.findOne({ email }).populate("role");
		if (!user || !(await user.comparePassword(password))) {
			return res
				.status(401)
				.json({ success: false, message: "Email atau password salah" });
		}
		const tokens = generateTokens(user, user.role);
		user.refreshTokens.push({ token: tokens.refreshToken });
		await user.save();

		// Cookie hanya secure di production (biar mudah testing di localhost)
		const isProduction = process.env.NODE_ENV === "production";

		res
			.cookie("accessToken", tokens.accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 15 * 60 * 1000,
			})
			.cookie("refreshToken", tokens.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.json({
				success: true,
				message: "Login berhasil",
				accessToken: tokens.accessToken, // untuk frontend SPA/mobile
			});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

exports.refreshToken = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken)
		return res
			.status(401)
			.json({ success: false, message: "No refresh token" });
	try {
		const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		const user = await User.findById(payload.id).populate("role");
		if (!user || !user.refreshTokens.find((t) => t.token === refreshToken)) {
			return res
				.status(403)
				.json({ success: false, message: "Invalid refresh token" });
		}
		const tokens = generateTokens(user, user.role);
		user.refreshTokens.push({ token: tokens.refreshToken });
		await user.save();

		const isProduction = process.env.NODE_ENV === "production";
		res
			.cookie("accessToken", tokens.accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 15 * 60 * 1000,
			})
			.cookie("refreshToken", tokens.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.json({
				success: true,
				message: "Token refreshed",
				accessToken: tokens.accessToken,
			});
	} catch {
		res.status(403).json({ success: false, message: "Invalid refresh token" });
	}
};

exports.logout = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (refreshToken) {
		try {
			const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
			await User.updateOne(
				{ _id: payload.id },
				{ $pull: { refreshTokens: { token: refreshToken } } }
			);
		} catch {}
	}
	res
		.clearCookie("accessToken")
		.clearCookie("refreshToken")
		.json({ success: true, message: "Logout berhasil" });
};

exports.googleLogin = async (req, res) => {
	const { idToken } = req.body;
	if (!idToken)
		return res
			.status(400)
			.json({ success: false, message: "No idToken provided" });

	try {
		// Verifikasi id_token dari frontend (Google Sign-In)
		const ticket = await client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		const email = payload.email;
		const name = payload.name;

		// Cari user di MongoDB, jika belum ada buat baru (role default: user)
		let user = await User.findOne({ email }).populate("role");
		if (!user) {
			const userRole = await Role.findOne({ name: "user" });
			user = new User({
				email,
				password: "", // kosong, karena login by Google
				role: userRole._id,
				name,
			});
			await user.save();
			await user.populate("role");
		}

		// Generate JWT accessToken & refreshToken
		const tokens = generateTokens(user, user.role);
		user.refreshTokens.push({ token: tokens.refreshToken });
		await user.save();

		const isProduction = process.env.NODE_ENV === "production";
		res
			.cookie("accessToken", tokens.accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 15 * 60 * 1000,
			})
			.cookie("refreshToken", tokens.refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			})
			.json({
				success: true,
				message: "Login by Google berhasil",
				accessToken: tokens.accessToken,
				user: {
					id: user._id,
					email: user.email,
					name: user.name,
					role: user.role.name,
				},
			});
	} catch (err) {
		console.error(err);
		res.status(401).json({ success: false, message: "Google login failed" });
	}
};