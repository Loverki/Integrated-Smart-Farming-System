import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT ADMIN_ID, USERNAME, EMAIL, PASSWORD, FULL_NAME, ROLE, STATUS FROM ADMIN WHERE USERNAME = :username`,
      { username }
    );

    const admin = result.rows[0];
    await connection.close();

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.STATUS !== 'ACTIVE') {
      return res.status(403).json({ message: "Admin account is not active" });
    }

    const match = await bcrypt.compare(password, admin.PASSWORD);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    const updateConnection = await getConnection();
    await updateConnection.execute(
      `UPDATE ADMIN SET LAST_LOGIN = SYSDATE WHERE ADMIN_ID = :admin_id`,
      { admin_id: admin.ADMIN_ID }
    );
    await updateConnection.close();

    const token = jwt.sign(
      { 
        admin_id: admin.ADMIN_ID, 
        username: admin.USERNAME,
        role: admin.ROLE 
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      adminId: admin.ADMIN_ID,
      full_name: admin.FULL_NAME,
      role: admin.ROLE,
      username: admin.USERNAME
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Error logging in admin" });
  }
});

// Create Admin (Super Admin only)
router.post("/create", async (req, res) => {
  const { username, email, password, full_name, role } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO ADMIN (ADMIN_ID, USERNAME, EMAIL, PASSWORD, FULL_NAME, ROLE)
       VALUES (ADMIN_SEQ.NEXTVAL, :username, :email, :password, :full_name, :role)`,
      { username, email, password: hashedPassword, full_name, role: role || 'ADMIN' },
      { autoCommit: true }
    );

    await connection.close();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("Create admin error:", err);
    if (err.message.includes('unique constraint')) {
      res.status(400).json({ message: "Username or email already exists" });
    } else {
      res.status(500).json({ message: "Error creating admin" });
    }
  }
});

// Get All Admins
router.get("/", async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT ADMIN_ID, USERNAME, EMAIL, FULL_NAME, ROLE, STATUS, CREATED_DATE, LAST_LOGIN FROM ADMIN ORDER BY CREATED_DATE DESC`
    );

    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ message: "Error fetching admins" });
  }
});

// Update Admin Status
router.put("/:adminId/status", async (req, res) => {
  const { adminId } = req.params;
  const { status } = req.body;

  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE ADMIN SET STATUS = :status WHERE ADMIN_ID = :admin_id`,
      { status, admin_id: adminId },
      { autoCommit: true }
    );

    await connection.close();
    res.json({ message: "Admin status updated successfully" });
  } catch (err) {
    console.error("Update admin status error:", err);
    res.status(500).json({ message: "Error updating admin status" });
  }
});

// Get Admin Statistics
router.get("/stats", async (req, res) => {
  try {
    const connection = await getConnection();
    
    // Get total farmers
    const farmersResult = await connection.execute(`SELECT COUNT(*) as total_farmers FROM FARMER`);
    
    // Get total farms
    const farmsResult = await connection.execute(`SELECT COUNT(*) as total_farms FROM FARM`);
    
    // Get total crops
    const cropsResult = await connection.execute(`SELECT COUNT(*) as total_crops FROM CROP`);
    
    // Get total revenue
    const revenueResult = await connection.execute(`SELECT NVL(SUM(TOTAL_AMOUNT), 0) as total_revenue FROM SALES`);
    
    // Get active farmers
    const activeFarmersResult = await connection.execute(`SELECT COUNT(*) as active_farmers FROM FARMER WHERE STATUS = 'ACTIVE'`);

    await connection.close();
    
    res.json({
      total_farmers: farmersResult.rows[0].TOTAL_FARMERS,
      total_farms: farmsResult.rows[0].TOTAL_FARMS,
      total_crops: cropsResult.rows[0].TOTAL_CROPS,
      total_revenue: revenueResult.rows[0].TOTAL_REVENUE,
      active_farmers: activeFarmersResult.rows[0].ACTIVE_FARMERS
    });
  } catch (err) {
    console.error("Get admin stats error:", err);
    res.status(500).json({ message: "Error fetching admin statistics" });
  }
});

export default router;
