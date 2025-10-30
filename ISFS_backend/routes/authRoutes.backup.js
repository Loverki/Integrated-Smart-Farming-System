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
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // AUTO-RESET FARMER_SEQ to match current farmer count
    try {
      const countResult = await connection.execute(
        `SELECT NVL(MAX(farmer_id), 0) AS max_id FROM FARMER`
      );
      const maxFarmerId = countResult.rows[0][0];
      
      // Check if sequence exists
      const seqCheckResult = await connection.execute(`
        SELECT COUNT(*) as seq_count 
        FROM user_sequences 
        WHERE sequence_name = 'FARMER_SEQ'
      `);
      const sequenceExists = seqCheckResult.rows[0][0] > 0;
      
      if (sequenceExists) {
        try {
          await connection.execute(`BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;`);
          console.log(`✅ FARMER_SEQ reset to ${maxFarmerId + 1}`);
        } catch (procError) {
          await connection.execute(`DROP SEQUENCE FARMER_SEQ`);
          await connection.execute(
            `CREATE SEQUENCE FARMER_SEQ START WITH ${maxFarmerId + 1} INCREMENT BY 1 NOCACHE`
          );
          console.log(`✅ FARMER_SEQ manually reset to ${maxFarmerId + 1}`);
        }
      } else {
        await connection.execute(
          `CREATE SEQUENCE FARMER_SEQ START WITH ${maxFarmerId + 1} INCREMENT BY 1 NOCACHE`
        );
        console.log(`✅ FARMER_SEQ created to start from ${maxFarmerId + 1}`);
      }
    } catch (seqError) {
      console.log("⚠️  Sequence management warning:", seqError.message);
    }

    // Insert farmer
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
      `SELECT FARMER_ID FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    const newFarmerId = farmerResult.rows[0]?.[0] || null;
    console.log(`✅ New farmer registered with ID: ${newFarmerId}`);

    await connection.close();
    res.status(201).json({ 
      message: "Farmer registered successfully",
      farmerId: newFarmerId
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.errorNum,
      offset: err.offset
    });
    
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
    
    if (err.message && err.message.includes('unique constraint')) {
      return res.status(400).json({ message: "Phone number already registered" });
    }
    
    if (err.message && err.message.includes('ORA-02289')) {
      return res.status(500).json({ 
        message: "Database sequence error. Please contact administrator.",
        detail: "FARMER_SEQ sequence may not exist. Run database setup scripts."
      });
    }
    
    return res.status(500).json({ 
      message: "Error registering farmer",
      detail: err.message || "Unknown error"
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

    const farmer = result.rows[0];
    await connection.close();

    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    // Check if account is active
    if (farmer.STATUS === 'INACTIVE') {
      return res.status(403).json({ 
        message: "Your account has been deactivated. Please contact support." 
      });
    }

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
    if (connection) await connection.close();
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
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
    
    if (farmer.STATUS === 'INACTIVE') {
      return res.status(403).json({ 
        valid: false, 
        message: "Account is inactive",
        accountInactive: true
      });
    }

    res.json({ 
      valid: true, 
      farmer: {
        farmerId: farmer.FARMER_ID,
        name: farmer.NAME,
        phone: farmer.PHONE,
        status: farmer.STATUS
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
