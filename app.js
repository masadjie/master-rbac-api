require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");

const menuRoutes = require("./routes/v1/menu.routes");
const authRoutes = require("./routes/v1/auth.routes");
const permissionRoutes = require("./routes/v1/permission.routes");
const roleRoutes = require("./routes/v1/role.routes");
const serviceRoutes = require("./routes/v1/service.routes");
const tagRoutes = require("./routes/v1/tag.routes");
const serviceItemRoutes = require("./routes/v1/serviceitem.routes");
const userRoutes = require("./routes/v1/user.routes");
const userBalanceRoutes = require("./routes/v1/userbalance.routes");
const biliingCycleRoutes = require("./routes/v1/billingcycle.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors());

connectDB();

app.get("/", (req, res) => {
	res.json({ message: "API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/tags", tagRoutes);
app.use("/api/v1/service-items", serviceItemRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/user-balances", userBalanceRoutes);
app.use("/api/v1/billing-cycles", biliingCycleRoutes);


app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
