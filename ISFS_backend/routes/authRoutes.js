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

    if (existingFarmer.rows && existingFarmer.rows.length > 0) {
      await connection.close();
      console.log("⚠️  Phone number already registered:", phone);
      return res.status(400).json({ 
        message: "Phone number already registered" 
      });
    }

    // CRITICAL: AUTO-RESET FARMER_SEQ BASED ON ACTUAL FARMER COUNT
    // This ensures new farmers always get correct sequential IDs
    try {
      // Step 1: Count actual farmers in database
      const countResult = await connection.execute(
        `SELECT COUNT(*) AS farmer_count, NVL(MAX(farmer_id), 0) AS max_id FROM FARMER`
      );
      const farmerCount = countResult.rows[0][0];
      const maxFarmerId = countResult.rows[0][1];
      
      console.log(`📊 Farmer database status:`, {
        total_farmers: farmerCount,
        max_farmer_id: maxFarmerId,
        next_should_be: maxFarmerId + 1
      });
      
      // Step 2: Check if sequence exists
      const seqCheckResult = await connection.execute(`
        SELECT COUNT(*) as seq_count 
        FROM user_sequences 
        WHERE sequence_name = 'FARMER_SEQ'
      `);
      const sequenceExists = seqCheckResult.rows[0][0] > 0;
      
      // Step 3: Always reset/create sequence to match actual data
      if (sequenceExists) {
        // Sequence exists - ALWAYS reset it to ensure correctness
        console.log(`🔄 Resetting FARMER_SEQ to match actual data...`);
        try {
          // Try stored procedure first
          await connection.execute(`BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;`);
          console.log(`✅ FARMER_SEQ reset via procedure to start from ${maxFarmerId + 1}`);
        } catch (procError) {
          // Procedure doesn't exist, manually reset
          console.log("⚠️  RESET_SEQUENCE procedure not found, using manual reset");
          await connection.execute(`DROP SEQUENCE FARMER_SEQ`);
          await connection.execute(
            `CREATE SEQUENCE FARMER_SEQ START WITH ${maxFarmerId + 1} INCREMENT BY 1 NOCACHE`
          );
          console.log(`✅ FARMER_SEQ manually recreated to start from ${maxFarmerId + 1}`);
        }
      } else {
        // Sequence doesn't exist - create it
        console.log(`⚠️  FARMER_SEQ doesn't exist, creating it...`);
        await connection.execute(
          `CREATE SEQUENCE FARMER_SEQ START WITH ${maxFarmerId + 1} INCREMENT BY 1 NOCACHE`
        );
        console.log(`✅ FARMER_SEQ created to start from ${maxFarmerId + 1}`);
      }
      
      // Step 4: DON'T verify with NEXTVAL as it consumes a value!
      // The sequence is set correctly to (maxFarmerId + 1)
      console.log(`✅ FARMER_SEQ is ready - Next farmer will get ID: ${maxFarmerId + 1}`);
      console.log(`   Total farmers in DB: ${farmerCount}, Max ID: ${maxFarmerId}`);
      
      // Important: We don't call NEXTVAL here to verify because that would consume
      // a sequence value and cause the new farmer to get (maxFarmerId + 2) instead!
      
    } catch (seqError) {
      console.log("⚠️  Sequence management failed:", seqError.message);
      console.log("ℹ️  Continuing with registration (sequence might have gaps)");
      // Continue anyway - sequence will just continue from current value
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
    
    // Handle both array and object format
    let farmerId, farmerName;
    if (Array.isArray(newFarmer)) {
      farmerId = newFarmer[0];
      farmerName = newFarmer[1];
    } else {
      farmerId = newFarmer.FARMER_ID;
      farmerName = newFarmer.NAME;
    }

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

  console.log("🔐 Login attempt:", {
    phone: phone,
    phone_length: phone?.length,
    phone_type: typeof phone,
    password_provided: !!password
  });

  let connection;
  try {
    connection = await getConnection();
    
    // First, let's see ALL farmers to debug
    const allFarmers = await connection.execute(
      `SELECT FARMER_ID, NAME, PHONE, STATUS FROM FARMER`
    );
    console.log("📊 All farmers in database:", allFarmers.rows.map(f => ({
      id: f[0],
      name: f[1],
      phone: f[2],
      phone_trimmed: f[2]?.trim(),
      status: f[3]
    })));
    
    // Try with exact match
    const result = await connection.execute(
      `SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    console.log("🔍 Query result (exact match):", {
      phone_searched: phone,
      rowCount: result.rows.length,
      metaData: result.metaData?.map(col => col.name),
      firstRow: result.rows[0]
    });
    
    // If exact match fails, try with TRIM
    if (result.rows.length === 0) {
      console.log("⚠️  Exact match failed, trying with TRIM...");
      const trimResult = await connection.execute(
        `SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE TRIM(PHONE) = TRIM(:phone)`,
        { phone }
      );
      console.log("🔍 Query result (with TRIM):", {
        rowCount: trimResult.rows.length,
        firstRow: trimResult.rows[0]
      });
      
      if (trimResult.rows.length > 0) {
        console.log("✅ Found farmer with TRIM! Using trimmed result.");
        result.rows = trimResult.rows;
        result.metaData = trimResult.metaData;
      }
    }

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmer = result.rows[0];
    
    // Handle both array and object format
    let farmerId, farmerName, hashedPassword, status;
    
    if (Array.isArray(farmer)) {
      // Array format
      farmerId = farmer[0];
      farmerName = farmer[1];
      hashedPassword = farmer[2];
      status = farmer[3];
    } else {
      // Object format
      farmerId = farmer.FARMER_ID;
      farmerName = farmer.NAME;
      hashedPassword = farmer.PASSWORD;
      status = farmer.STATUS;
    }

    console.log("👤 Login attempt for:", { farmerId, farmerName, hasPasswordSet: !!hashedPassword });

    // Check if password is set
    if (!hashedPassword) {
      await connection.close();
      console.error("❌ No password set for farmer:", farmerId);
      return res.status(500).json({ 
        message: "Account has no password set. Please contact administrator or register again." 
      });
    }

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

    // Ensure farmer_id is a number for JWT token
    const farmerIdNum = typeof farmerId === 'number' ? farmerId : parseInt(farmerId);

    const token = jwt.sign(
      { farmer_id: farmerIdNum, name: farmerName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    console.log(`✅ Login successful for farmer ${farmerIdNum} (${farmerName})`);
    console.log(`   farmer_id type in JWT: ${typeof farmerIdNum}`);

    await connection.close();

    res.json({
      message: "Login successful",
      token,
      farmerId: farmerIdNum,
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
    
    // Handle both array and object format
    let farmerStatus;
    if (Array.isArray(farmer)) {
      farmerStatus = farmer[3];
    } else {
      farmerStatus = farmer.STATUS;
    }
    
    if (farmerStatus === 'INACTIVE') {
      return res.status(403).json({ 
        valid: false, 
        message: "Account is inactive",
        accountInactive: true
      });
    }

    // Handle both array and object format
    let farmerData;
    if (Array.isArray(farmer)) {
      farmerData = {
        farmerId: farmer[0],
        name: farmer[1],
        phone: farmer[2],
        status: farmer[3]
      };
    } else {
      farmerData = {
        farmerId: farmer.FARMER_ID,
        name: farmer.NAME,
        phone: farmer.PHONE,
        status: farmer.STATUS
      };
    }

    res.json({ 
      valid: true, 
      farmer: farmerData
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

