import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import oracledb from "oracledb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => res.send("Server is running"));

// Safe database connection function
async function connectDB() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECT_STRING,
    });
    console.log("✅ Database connection successful");
    return connection;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err; // throw so we can decide whether to start server
  }
}

// Start server function
const startServer = async () => {
  try {
    // Connect to DB first
    await connectDB();

    // Lazy-load routes AFTER DB connection
    const { default: farmerRoutes } = await import("./routes/farmerRoutes.js");
    const { default: farmRoutes } = await import("./routes/farmRoutes.js");
    const { default: cropRoutes } = await import("./routes/cropRoutes.js");
    const { default: labourRoutes } = await import("./routes/labourRoutes.js");
    const { default: fertilizerRoutes } = await import("./routes/fertilizerRoutes.js");
    const { default: equipmentRoutes } = await import("./routes/equipmentRoutes.js");
    const { default: salesRoutes } = await import("./routes/salesRoutes.js");
    const { default: authRoutes } = await import("./routes/authRoutes.js");
    const { default: adminRoutes } = await import("./routes/adminRoutes.js");
    const { default: viewsRoutes } = await import("./routes/viewsRoutes.js");
    const { default: proceduresRoutes } = await import("./routes/proceduresRoutes.js");
    const { default: functionsRoutes } = await import("./routes/functionsRoutes.js");
    const { default: analyticsRoutes } = await import("./routes/analyticsRoutes.js");
    const { protect } = await import("./middleware/authMiddleware.js");

    // Setup routes
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);

    app.use("/api/farmers", protect, farmerRoutes);
    app.use("/api/farms", protect, farmRoutes);
    app.use("/api/crops", protect, cropRoutes);
    app.use("/api/labours", protect, labourRoutes);
    app.use("/api/fertilizers", protect, fertilizerRoutes);
    app.use("/api/equipment", protect, equipmentRoutes);
    app.use("/api/sales", protect, salesRoutes);
    
    // Advanced DBMS features routes
    app.use("/api/views", protect, viewsRoutes);
    app.use("/api/procedures", protect, proceduresRoutes);
    app.use("/api/functions", protect, functionsRoutes);
    app.use("/api/analytics", protect, analyticsRoutes);

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`🛑 ${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
      server.close(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // exit if DB connection failed
  }
};

// Run server
startServer();
