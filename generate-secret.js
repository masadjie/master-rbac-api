const crypto = require("crypto");
const fs = require("fs");

function generateSecret(length = 64) {
	return crypto.randomBytes(length).toString("base64");
}

const jwtSecret = generateSecret(64);
const jwtRefreshSecret = generateSecret(64);

let env = "";
if (fs.existsSync(".env")) {
	env = fs
		.readFileSync(".env", "utf-8")
		.replace(/^JWT_SECRET=.*$/m, "")
		.replace(/^JWT_REFRESH_SECRET=.*$/m, "")
		.trim();
}

const envContent =
	[env, `JWT_SECRET=${jwtSecret}`, `JWT_REFRESH_SECRET=${jwtRefreshSecret}`]
		.filter(Boolean)
		.join("\n") + "\n";

fs.writeFileSync(".env", envContent);

console.log(
	"JWT_SECRET dan JWT_REFRESH_SECRET berhasil digenerate dan diupdate di .env!"
);
console.log("---");
console.log(envContent);
