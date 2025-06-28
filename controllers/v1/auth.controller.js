const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate OTP
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Convert phone number to international format (62)
function convertPhoneNumber(phone) {
	if (phone && phone.startsWith("0")) {
		return "62" + phone.slice(1);
	}
	return phone;
}

function maskPhoneNumber(phone) {
	if (!phone) return "";
	// Contoh: 08123456789 -> 0812****6789
	if (phone.length < 8) return phone;
	const start = phone.slice(0, 4);
	const end = phone.slice(-4);
	return `${start}${"*".repeat(phone.length - 8)}${end}`;
}

// Helper: Send OTP via WhatsApp
async function sendOtpViaWhatsapp(phoneNumber, otpCode) {
	const WA_API_KEY = process.env.WA_API_KEY;
	const WA_SESSION_URL = process.env.WA_SESSION_URL;
	const WA_SEND_URL = process.env.WA_SEND_URL;

	// 1. Cek session WhatsApp
	const sessionRes = await axios.get(WA_SESSION_URL, {
		headers: { "x-api-key": WA_API_KEY },
	});
	const session = (sessionRes.data || []).find((s) => s.status === "WORKING");
	if (!session) {
		throw new Error(
			"OTP tidak bisa dikirim, hubungi pihak penyedia layanan (WA session tidak aktif)"
		);
	}

	// 2. Format nomor dan siapkan data pengiriman
	const formattedPhone = convertPhoneNumber(phoneNumber);
	const chatId = formattedPhone.endsWith("@c.us")
		? formattedPhone
		: `${formattedPhone}@c.us`;
	const sessionName = session.name;

	const body = {
		chatId,
		reply_to: null,
		text: `Kode OTP Djiecloud kamu: ${otpCode}`,
		linkPreview: false,
		linkPreviewHighQuality: false,
		session: sessionName,
	};

	// 3. Kirim OTP via WhatsApp
	const sendRes = await axios.post(WA_SEND_URL, body, {
		headers: {
			"x-api-key": WA_API_KEY,
			"Content-Type": "application/json",
		},
	});

	if (sendRes.status !== 201) {
		throw new Error(
			"OTP tidak bisa dikirim, hubungi pihak penyedia layanan (WA error)"
		);
	}
}

// Helper: Generate JWT tokens
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

// REGISTER - Step 1: Register & Send OTP via WA
// REGISTER - Step 1: Register & Send OTP via WA
exports.register = async (req, res) => {
	try {
		const { email, password, fullName, phoneNumber } = req.body;

		// Validasi field wajib
		if (!email || !password || !fullName || !phoneNumber) {
			return res.status(400).json({
				success: false,
				message: "email, password, fullName, dan phoneNumber wajib diisi",
			});
		}

		if (await User.findOne({ email })) {
			return res
				.status(409)
				.json({ success: false, message: "Email sudah terdaftar" });
		}

		const role = await Role.findOne({ name: "user" });
		if (!role)
			return res
				.status(400)
				.json({ success: false, message: "Role tidak ditemukan" });

		// Generate OTP
		const otpCode = generateOTP();
		const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

		const user = new User({
			email,
			password,
			role: role._id,
			fullName,
			phoneNumber,
			otp: { code: otpCode, expiresAt: otpExpires, verified: false },
			isActive: false,
			otpRequests: [new Date()],
		});
		await user.save();

		// Kirim OTP ke WhatsApp user
		try {
			await sendOtpViaWhatsapp(phoneNumber, otpCode);
		} catch (err) {
			return res.status(500).json({
				success: false,
				message:
					err.message ||
					"OTP tidak bisa dikirim, hubungi pihak penyedia layanan",
			});
		}

		res.status(201).json({
			success: true,
			message:
				"Registrasi berhasil. Silakan verifikasi kode OTP yang dikirim ke WhatsApp Anda.",
			userId: user._id,
			needOtp: true,
			phoneNumber: maskPhoneNumber(user.phoneNumber),
		});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

// REGISTER - Step 2: Verifikasi OTP
exports.verifyOtp = async (req, res) => {
	try {
		const { userId, otp } = req.body;
		const user = await User.findById(userId).populate("role");
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" });

		if (
			!user.otp ||
			user.otp.code !== otp ||
			user.otp.expiresAt < new Date() ||
			user.otp.verified
		) {
			return res.status(400).json({
				success: false,
				message: "OTP tidak valid atau sudah kadaluarsa",
			});
		}

		user.otp.verified = true;
		user.isActive = true;
		await user.save();

		// Setelah verifikasi, login otomatis
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
				message: "Verifikasi OTP berhasil. Akun aktif dan login berhasil.",
				accessToken: tokens.accessToken,
			});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

// LOGIN
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).populate("role");
		if (!user || !(await user.comparePassword(password))) {
			return res
				.status(401)
				.json({ success: false, message: "Email atau password salah" });
		}
		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: "Akun belum aktif. Silakan verifikasi OTP.",
				needOtp: true,
				userId: user._id, // <-- Aman, karena hanya dikirim setelah autentikasi password
				phoneNumber: maskPhoneNumber(user.phoneNumber),
			});
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
				message: "Login berhasil",
				accessToken: tokens.accessToken,
				userId: user._id, // <-- Aman juga di sini
			});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

// REQUEST OTP ULANG (Resend OTP via WhatsApp, max 3x per hari)
exports.requestOtp = async (req, res) => {
	try {
		const { userId } = req.body;
		const user = await User.findById(userId);
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		if (user.isActive)
			return res
				.status(400)
				.json({ success: false, message: "Akun sudah aktif" });

		// Pembatasan: maksimal 3x request OTP dalam 24 jam
		const now = new Date();
		user.otpRequests = (user.otpRequests || []).filter(
			(ts) => ts > new Date(now.getTime() - 24 * 60 * 60 * 1000)
		);
		if (user.otpRequests.length >= 3) {
			return res.status(429).json({
				success: false,
				message:
					"Maksimal request OTP hanya 3x dalam 24 jam. Silakan coba lagi besok atau hubungi admin.",
			});
		}

		// Generate OTP baru
		const otpCode = generateOTP();
		const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

		user.otp = { code: otpCode, expiresAt: otpExpires, verified: false };
		user.otpRequests.push(now);
		await user.save();

		// Kirim OTP ke WhatsApp user
		try {
			await sendOtpViaWhatsapp(user.phoneNumber, otpCode);
		} catch (err) {
			return res.status(500).json({
				success: false,
				message:
					err.message ||
					"OTP tidak bisa dikirim, hubungi pihak penyedia layanan",
			});
		}

		res.json({
			success: true,
			message: "OTP baru sudah dikirim ke WhatsApp Anda.",
		});
	} catch (err) {
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

// REFRESH TOKEN
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

// LOGOUT
exports.logout = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (refreshToken) {
		try {
			// Verifikasi token untuk ambil user id
			const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
			// Temukan user
			const user = await User.findById(payload.id);
			if (user) {
				// Hapus token dari array refreshTokens
				user.refreshTokens = (user.refreshTokens || []).filter(
					(t) => t.token !== refreshToken
				);
				await user.save();
			}
		} catch (err) {
			// Token invalid, abaikan
		}
	}
	res
		.clearCookie("accessToken")
		.clearCookie("refreshToken")
		.json({ success: true, message: "Logout berhasil" });
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
	const { idToken } = req.body;
	if (!idToken)
		return res
			.status(400)
			.json({ success: false, message: "No idToken provided" });

	try {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		const email = payload.email;
		const fullName = payload.name;

		let user = await User.findOne({ email }).populate("role");
		if (!user) {
			const userRole = await Role.findOne({ name: "user" });
			user = new User({
				email,
				password: "", // kosong, karena login by Google
				role: userRole._id,
				fullName,
				isActive: true,
				otp: { verified: true },
			});
			await user.save();
			await user.populate("role");
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
				message: "Login by Google berhasil",
				accessToken: tokens.accessToken,
				user: {
					id: user._id,
					email: user.email,
					fullName: user.fullName,
					role: user.role.name,
				},
			});
	} catch (err) {
		console.error(err);
		res.status(401).json({ success: false, message: "Google login failed" });
	}
};
