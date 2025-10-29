import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// 🟢 Register - SIMPLIFIED VERSION
router.post("/register", async (req, res) => {
  const { name, phone, address, password } = req.body;
  
  console.log("📝 Registration attempt:", { name, phone });
  
  if (!name || !phone || !password) {
    return res.status(400).json({ 
      message: "Missing required fields: name, phone, and password are required" 
    });
  }

  let connection;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    connection = await getConnection();

    // Check if phone number already exists
    const existingFarmer = await connection.execute(
      `SELECT FARMER_ID FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    if (existingFarmer.rows.length > 0) {
      await connection.close();
      return res.status(400).json({ 
        message: "Phone number already registered" 
      });
    }

    // Insert new farmer (simple version)
    console.log("💾 Inserting new farmer...");
    await connection.execute(
      `INSERT INTO FARMER (FARMER_ID, NAME, PHONE, ADDRESS, PASSWORD)
       VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :address, :password)`,
      { 
        name, 
        phone, 
        address: address || '', 
        password: hashedPassword
      },
      { autoCommit: true }
    );

    // Get the farmer ID that was just created
    const farmerResult = await connection.execute(
      `SELECT FARMER_ID, NAME FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    if (farmerResult.rows.length === 0) {
      throw new Error("Farmer was inserted but couldn't be retrieved");
    }

    const newFarmer = farmerResult.rows[0];
    const farmerId = newFarmer[0];
    const farmerName = newFarmer[1];

    console.log(`✅ Farmer registered successfully! ID: ${farmerId}, Name: ${farmerName}`);

    await connection.close();
    
    res.status(201).json({ 
      message: "Farmer registered successfully",
      farmerId: farmerId,
      name: farmerName
    });

  } catch (err) {
    console.error("❌ Registration error:", err.message);
    
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr.message);
      }
    }
    
    // Handle specific errors
    if (err.message && err.message.includes('unique constraint')) {
      return res.status(400).json({ 
        message: "Phone number already registered" 
      });
    }
    
    if (err.message && err.message.includes('ORA-02289')) {
      return res.status(500).json({ 
        message: "Database sequence not found. Please run: CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1;"
      });
    }
    
    if (err.message && err.message.includes('ORA-00942')) {
      return res.status(500).json({ 
        message: "FARMER table not found. Please run the database schema setup."
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      message: "Registration failed: " + err.message
    });
  }
});

// 🔵 Login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmer = result.rows[0];
    const farmerId = farmer[0];
    const farmerName = farmer[1];
    const hashedPassword = farmer[2];
    const status = farmer[3];

    // Check if account is active
    if (status === 'INACTIVE') {
      await connection.close();
      return res.status(403).json({ 
        message: "Your account has been deactivated. Please contact support." 
      });
    }

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      await connection.close();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { farmer_id: farmerId, name: farmerName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await connection.close();

    res.json({
      message: "Login successful",
      token,
      farmerId: farmerId,
      name: farmerName
    });
  } catch (err) {
    if (connection) await connection.close();
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in: " + err.message });
  }
});

// 🔍 Verify current user exists in database
router.get("/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      valid: false, 
      message: "No token provided" 
    });
  }

  let connection;
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if farmer exists in database
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT FARMER_ID, NAME, PHONE, STATUS FROM FARMER WHERE FARMER_ID = :farmer_id`,
      { farmer_id: decoded.farmer_id }
    );
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        valid: false, 
        message: "User no longer exists",
        userDeleted: true
      });
    }

    const farmer = result.rows[0];
    
    if (farmer[3] === 'INACTIVE') {
      return res.status(403).json({ 
        valid: false, 
        message: "Account is inactive",
        accountInactive: true
      });
    }

    res.json({ 
      valid: true, 
      farmer: {
        farmerId: farmer[0],
        name: farmer[1],
        phone: farmer[2],
        status: farmer[3]
      }
    });
  } catch (err) {
    if (connection) await connection.close();
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false, 
        message: "Token expired",
        tokenExpired: true
      });
    }
    
    return res.status(401).json({ 
      valid: false, 
      message: "Invalid token" 
    });
  }
});

export default router;

