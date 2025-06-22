require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const menuRoutes = require("./routes/v1/menu.routes");
const authRoutes = require("./routes/v1/auth.routes");
const permissionRoutes = require("./routes/v1/permission.routes");
const roleRoutes = require("./routes/v1/role.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/roles", roleRoutes);

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
