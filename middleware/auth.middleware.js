const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
	// Ambil token dari cookie atau Authorization header
	const token =
		req.cookies.accessToken ||
		(req.headers.authorization && req.headers.authorization.split(" ")[1]);

	if (!token) {
		return res.status(401).json({ message: "Unauthorized: No token" });
	}

	try {
		// Validasi token dengan opsi keamanan tambahan
		const decoded = jwt.verify(token, process.env.JWT_SECRET, {
			algorithms: ["HS256"], // pastikan algoritma yang digunakan
			issuer: process.env.JWT_ISSUER, // opsional: pastikan issuer sesuai jika digunakan
			audience: process.env.JWT_AUDIENCE, // opsional: pastikan audience sesuai jika digunakan
		});

		// Token otomatis dicek expired oleh jwt.verify
		req.user = decoded;
		next();
	} catch (err) {
		// Jangan bocorkan detail error ke client
		return res.status(401).json({ message: "Unauthorized: Invalid token" });
	}
};
