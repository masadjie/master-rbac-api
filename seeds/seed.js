require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Permission = require("../models/permission.model");
const Role = require("../models/role.model");
const User = require("../models/user.model");

async function seed() {
	try {
		await connectDB();

		// 1. Buat permission menu tanpa actions di permission (actions di role)
		const permissionsToSeed = [
			{ name: "service", label: "Service" },
			{ name: "billing", label: "Billing" },
			{ name: "ai", label: "AI" },
			{ name: "support", label: "Support" },
		];
		const permissionDocs = [];
		for (const perm of permissionsToSeed) {
			let permission = await Permission.findOne({ name: perm.name });
			if (!permission) {
				permission = await Permission.create(perm);
			} else {
				permission.label = perm.label || permission.label;
				await permission.save();
			}
			permissionDocs.push(permission);
		}

		// 2. Buat role super admin dengan granular permissions + actions
		let superAdminRole = await Role.findOne({ name: "super admin" });
		if (!superAdminRole) {
			superAdminRole = await Role.create({
				name: "super admin",
				permissions: permissionDocs.map((p) => ({
					permission: p._id,
					actions: [
						"VIEW",
						"CREATE",
						"UPDATE",
						"DELETE",
						"EXPORT",
						"PAY",
						"USE",
						"TRAIN",
						"REPLY",
					],
				})),
			});
		}

		// 3. Buat role user dengan granular permissions + actions (hanya service dengan VIEW dan CREATE)
		let userRole = await Role.findOne({ name: "user" });
		if (!userRole) {
			const servicePermission = permissionDocs.find(
				(p) => p.name === "service"
			);
			if (servicePermission) {
				userRole = await Role.create({
					name: "user",
					permissions: [
						{
							permission: servicePermission._id,
							actions: ["VIEW", "CREATE"],
						},
					],
				});
			}
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
				fullName: "Super Admin",
				phoneNumber: "081234567890",
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
				fullName: "Normal User",
				phoneNumber: "089876543210",
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
