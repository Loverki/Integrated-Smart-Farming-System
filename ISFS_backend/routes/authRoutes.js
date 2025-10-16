import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// 🟢 Register
router.post("/register", async (req, res) => {
  const { name, phone, address, password } = req.body;
  
  console.log("Registration attempt:", { name, phone, address: address ? "provided" : "missing" });
  
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Missing required fields: name, phone, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    // Check if phone number already exists
    const existingFarmer = await connection.execute(
      `SELECT FARMER_ID FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    if (existingFarmer.rows.length > 0) {
      await connection.close();
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const result = await connection.execute(
      `INSERT INTO FARMER (FARMER_ID, NAME, PHONE, ADDRESS, PASSWORD)
       VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :address, :password)`,
      { name, phone, address: address || '', password: hashedPassword },
      { autoCommit: true }
    );

    await connection.close();
    res.status(201).json({ message: "Farmer registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.message.includes('unique constraint')) {
      res.status(400).json({ message: "Phone number already registered" });
    } else {
      res.status(500).json({ message: "Error registering farmer: " + err.message });
    }
  }
});

// 🔵 Login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT FARMER_ID, NAME, PASSWORD FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    const farmer = result.rows[0];
    await connection.close();

    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const match = await bcrypt.compare(password, farmer.PASSWORD);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { farmer_id: farmer.FARMER_ID, name: farmer.NAME },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      farmerId: farmer.FARMER_ID,
      name: farmer.NAME
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

export default router;
