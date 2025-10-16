import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import farmerRoutes from "./routes/farmerRoutes.js";
import farmRoutes from "./routes/farmRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import labourRoutes from "./routes/labourRoutes.js";
import fertilizerRoutes from "./routes/fertilizerRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Public auth routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/farmers", protect, farmerRoutes);
app.use("/api/farms", protect, farmRoutes);
app.use("/api/crops", protect, cropRoutes);
app.use("/api/labours", protect, labourRoutes);
app.use("/api/fertilizers", protect, fertilizerRoutes);
app.use("/api/sales", protect, salesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
