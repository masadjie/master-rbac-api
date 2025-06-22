require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Permission = require("../models/permission.model");
const Role = require("../models/role.model");
const User = require("../models/user.model");

async function seed() {
	try {
		await connectDB();

		// 1. Buat permission menu dengan actions dinamis
		const permissionsToSeed = [
			{
				name: "service",
				actions: ["VIEW", "CREATE", "UPDATE", "DELETE", "EXPORT"],
			},
			{
				name: "billing",
				actions: ["VIEW", "CREATE", "PAY", "DOWNLOAD"],
			},
			{
				name: "ai",
				actions: ["VIEW", "USE", "TRAIN"],
			},
			{
				name: "support",
				actions: ["VIEW", "CREATE", "REPLY"],
			},
		];
		const permissionDocs = [];
		for (const perm of permissionsToSeed) {
			let permission = await Permission.findOne({ name: perm.name });
			if (!permission) {
				permission = await Permission.create(perm);
			} else {
				// Update actions jika sudah ada (biar bisa update actions dinamis)
				permission.actions = perm.actions;
				await permission.save();
			}
			permissionDocs.push(permission);
		}

		// 2. Buat role super admin (punya semua permission)
		let superAdminRole = await Role.findOne({ name: "super admin" });
		if (!superAdminRole) {
			superAdminRole = await Role.create({
				name: "super admin",
				permissions: permissionDocs.map((p) => p._id), // semua permission
			});
		}

		// 3. Buat role user (hanya menu service)
		let userRole = await Role.findOne({ name: "user" });
		if (!userRole) {
			const servicePermission = permissionDocs.find(
				(p) => p.name === "service"
			);
			userRole = await Role.create({
				name: "user",
				permissions: [servicePermission._id], // hanya permission service
			});
		}

		// 4. Buat super admin user
		const email = "superadmin@example.com";
		const password = "passwordku123";
		let adminUser = await User.findOne({ email });
		if (!adminUser) {
			adminUser = new User({
				email,
				password,
				role: superAdminRole._id,
			});
			await adminUser.save();
			console.log("Super admin user created!");
		} else {
			console.log("Super admin user already exists.");
		}

		// 5. Buat user biasa
		const userEmail = "user@example.com";
		const userPassword = "passwordku123";
		let normalUser = await User.findOne({ email: userEmail });
		if (!normalUser) {
			normalUser = new User({
				email: userEmail,
				password: userPassword,
				role: userRole._id,
			});
			await normalUser.save();
			console.log("User created!");
		} else {
			console.log("User already exists.");
		}
	} catch (err) {
		console.error("Seed error:", err);
	} finally {
		mongoose.connection.close();
	}
}

seed();
