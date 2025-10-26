import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getConnection } from "../database/connection.js";
import { protectAdmin, requireRole } from "../middleware/adminAuthMiddleware.js";

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

// Get Admin Statistics (protected)
router.get("/stats", protectAdmin, async (req, res) => {
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

// ==================== FARMER MANAGEMENT ENDPOINTS ====================

// Get all farmers with pagination and search (protected)
router.get("/farmers", protectAdmin, async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    const connection = await getConnection();
    
    // Build search condition
    const searchCondition = search 
      ? `WHERE LOWER(f.NAME) LIKE :search OR f.PHONE LIKE :search`
      : '';
    
    const searchParam = search ? { search: `%${search.toLowerCase()}%` } : {};

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM FARMER f ${searchCondition}`;
    const countResult = await connection.execute(countQuery, searchParam);
    const total = countResult.rows[0].TOTAL;

    // Get farmers with their stats
    const query = `
      SELECT 
        f.FARMER_ID,
        f.NAME,
        f.PHONE,
        f.ADDRESS,
        f.REG_DATE,
        f.STATUS,
        COUNT(DISTINCT farm.FARM_ID) as total_farms,
        COUNT(DISTINCT c.CROP_ID) as total_crops,
        NVL(SUM(s.TOTAL_AMOUNT), 0) as total_revenue
      FROM FARMER f
      LEFT JOIN FARM farm ON f.FARMER_ID = farm.FARMER_ID
      LEFT JOIN CROP c ON farm.FARM_ID = c.FARM_ID
      LEFT JOIN SALES s ON farm.FARM_ID = s.FARM_ID
      ${searchCondition}
      GROUP BY f.FARMER_ID, f.NAME, f.PHONE, f.ADDRESS, f.REG_DATE, f.STATUS
      ORDER BY f.REG_DATE DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const result = await connection.execute(query, { 
      ...searchParam, 
      offset: parseInt(offset), 
      limit: parseInt(limit) 
    });

    await connection.close();

    res.json({
      farmers: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get farmers error:", err);
    res.status(500).json({ message: "Error fetching farmers", error: err.message });
  }
});

// Get specific farmer details with all farms and crops (protected)
router.get("/farmers/:id", protectAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();

    // Get farmer details
    const farmerResult = await connection.execute(
      `SELECT FARMER_ID, NAME, PHONE, ADDRESS, REG_DATE, STATUS FROM FARMER WHERE FARMER_ID = :id`,
      { id }
    );

    if (farmerResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Farmer not found" });
    }

    const farmer = farmerResult.rows[0];

    // Get farmer's farms
    const farmsResult = await connection.execute(
      `SELECT FARM_ID, FARM_NAME, LOCATION, AREA, SOIL_TYPE, STATUS FROM FARM WHERE FARMER_ID = :id`,
      { id }
    );

    // Get farmer's crops
    const cropsResult = await connection.execute(
      `SELECT c.CROP_ID, c.CROP_NAME, c.VARIETY, c.SOWING_DATE, 
              c.EXPECTED_HARVEST_DATE, c.ACTUAL_HARVEST_DATE, c.CROP_STATUS,
              c.EXPECTED_YIELD, c.ACTUAL_YIELD, f.FARM_NAME
       FROM CROP c
       JOIN FARM f ON c.FARM_ID = f.FARM_ID
       WHERE f.FARMER_ID = :id
       ORDER BY c.SOWING_DATE DESC`,
      { id }
    );

    // Get farmer's total revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.TOTAL_AMOUNT), 0) as total_revenue
       FROM SALES s
       JOIN FARM f ON s.FARM_ID = f.FARM_ID
       WHERE f.FARMER_ID = :id`,
      { id }
    );

    await connection.close();

    res.json({
      farmer,
      farms: farmsResult.rows,
      crops: cropsResult.rows,
      total_revenue: revenueResult.rows[0].TOTAL_REVENUE
    });
  } catch (err) {
    console.error("Get farmer details error:", err);
    res.status(500).json({ message: "Error fetching farmer details" });
  }
});

// Update farmer status (Activate/Deactivate) (protected)
router.put("/farmers/:id/status", protectAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE FARMER SET STATUS = :status WHERE FARMER_ID = :id`,
      { status, id },
      { autoCommit: true }
    );

    await connection.close();
    res.json({ message: `Farmer ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error("Update farmer status error:", err);
    res.status(500).json({ message: "Error updating farmer status" });
  }
});

// Get farmer-specific analytics (protected)
router.get("/farmers/:id/analytics", protectAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();

    // Monthly revenue trend
    const revenueResult = await connection.execute(
      `SELECT 
        TO_CHAR(s.SALE_DATE, 'Mon YYYY') as month,
        NVL(SUM(s.TOTAL_AMOUNT), 0) as revenue
       FROM SALES s
       JOIN FARM f ON s.FARM_ID = f.FARM_ID
       WHERE f.FARMER_ID = :id
       GROUP BY TO_CHAR(s.SALE_DATE, 'Mon YYYY'), TO_CHAR(s.SALE_DATE, 'YYYY-MM')
       ORDER BY TO_CHAR(s.SALE_DATE, 'YYYY-MM') DESC
       FETCH FIRST 12 ROWS ONLY`,
      { id }
    );

    // Crop performance
    const cropsResult = await connection.execute(
      `SELECT 
        c.CROP_NAME,
        COUNT(*) as count,
        NVL(AVG(c.EXPECTED_YIELD), 0) as avg_expected,
        NVL(AVG(c.ACTUAL_YIELD), 0) as avg_actual
       FROM CROP c
       JOIN FARM f ON c.FARM_ID = f.FARM_ID
       WHERE f.FARMER_ID = :id
       GROUP BY c.CROP_NAME`,
      { id }
    );

    // Farm distribution
    const farmsResult = await connection.execute(
      `SELECT FARM_NAME, AREA, SOIL_TYPE FROM FARM WHERE FARMER_ID = :id`,
      { id }
    );

    await connection.close();

    res.json({
      revenue_trend: revenueResult.rows,
      crop_performance: cropsResult.rows,
      farms: farmsResult.rows
    });
  } catch (err) {
    console.error("Get farmer analytics error:", err);
    res.status(500).json({ message: "Error fetching farmer analytics" });
  }
});

// ==================== SYSTEM ANALYTICS ENDPOINTS ====================

// Get system-wide analytics overview (protected)
router.get("/analytics/overview", protectAdmin, async (req, res) => {
  try {
    const connection = await getConnection();

    // Total stats
    const statsResult = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM FARMER) as total_farmers,
        (SELECT COUNT(*) FROM FARM) as total_farms,
        (SELECT COUNT(*) FROM CROP) as total_crops,
        (SELECT NVL(SUM(TOTAL_AMOUNT), 0) FROM SALES) as total_revenue,
        (SELECT COUNT(*) FROM LABOUR) as total_labours,
        (SELECT NVL(SUM(TOTAL_COST), 0) FROM FERTILIZER) as total_fertilizer_cost
      FROM DUAL
    `);

    await connection.close();

    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error("Get analytics overview error:", err);
    res.status(500).json({ message: "Error fetching analytics overview" });
  }
});

// Get revenue trends by month and crop (protected)
router.get("/analytics/revenue", protectAdmin, async (req, res) => {
  const { months = 12 } = req.query;

  try {
    const connection = await getConnection();

    // Monthly revenue trend
    const monthlyResult = await connection.execute(
      `SELECT 
        TO_CHAR(SALE_DATE, 'Mon YYYY') as month,
        NVL(SUM(TOTAL_AMOUNT), 0) as revenue,
        COUNT(*) as sales_count
       FROM SALES
       WHERE SALE_DATE >= ADD_MONTHS(SYSDATE, -:months)
       GROUP BY TO_CHAR(SALE_DATE, 'Mon YYYY'), TO_CHAR(SALE_DATE, 'YYYY-MM')
       ORDER BY TO_CHAR(SALE_DATE, 'YYYY-MM')`,
      { months: parseInt(months) }
    );

    // Revenue by crop type
    const cropRevenueResult = await connection.execute(
      `SELECT 
        c.CROP_NAME,
        NVL(SUM(s.TOTAL_AMOUNT), 0) as total_revenue,
        COUNT(DISTINCT s.SALE_ID) as sales_count
       FROM SALES s
       JOIN CROP c ON s.CROP_ID = c.CROP_ID
       GROUP BY c.CROP_NAME
       ORDER BY total_revenue DESC
       FETCH FIRST 10 ROWS ONLY`
    );

    await connection.close();

    res.json({
      monthly_trend: monthlyResult.rows,
      crop_revenue: cropRevenueResult.rows
    });
  } catch (err) {
    console.error("Get revenue analytics error:", err);
    res.status(500).json({ message: "Error fetching revenue analytics" });
  }
});

// Get crop distribution and performance (protected)
router.get("/analytics/crops", protectAdmin, async (req, res) => {
  try {
    const connection = await getConnection();

    // Crop distribution
    const distributionResult = await connection.execute(
      `SELECT 
        CROP_NAME,
        COUNT(*) as count,
        NVL(SUM(EXPECTED_YIELD), 0) as total_expected_yield,
        NVL(SUM(ACTUAL_YIELD), 0) as total_actual_yield
       FROM CROP
       GROUP BY CROP_NAME
       ORDER BY count DESC`
    );

    // Crop performance (yield efficiency)
    const performanceResult = await connection.execute(
      `SELECT 
        CROP_NAME,
        NVL(AVG(EXPECTED_YIELD), 0) as avg_expected,
        NVL(AVG(ACTUAL_YIELD), 0) as avg_actual,
        CASE 
          WHEN AVG(EXPECTED_YIELD) > 0 
          THEN ROUND((AVG(ACTUAL_YIELD) / AVG(EXPECTED_YIELD)) * 100, 2)
          ELSE 0
        END as efficiency_percentage
       FROM CROP
       WHERE EXPECTED_YIELD > 0
       GROUP BY CROP_NAME
       ORDER BY efficiency_percentage DESC`
    );

    await connection.close();

    res.json({
      distribution: distributionResult.rows,
      performance: performanceResult.rows
    });
  } catch (err) {
    console.error("Get crop analytics error:", err);
    res.status(500).json({ message: "Error fetching crop analytics" });
  }
});

// Get top farmers leaderboard (protected)
router.get("/analytics/top-farmers", protectAdmin, async (req, res) => {
  const { limit = 10, sortBy = 'revenue' } = req.query;

  try {
    const connection = await getConnection();

    let orderBy = 'total_revenue DESC';
    if (sortBy === 'farms') orderBy = 'total_farms DESC';
    if (sortBy === 'crops') orderBy = 'total_crops DESC';
    if (sortBy === 'yield') orderBy = 'total_yield DESC';

    const query = `
      SELECT 
        f.FARMER_ID,
        f.NAME,
        COUNT(DISTINCT farm.FARM_ID) as total_farms,
        COUNT(DISTINCT c.CROP_ID) as total_crops,
        NVL(SUM(s.TOTAL_AMOUNT), 0) as total_revenue,
        NVL(SUM(c.ACTUAL_YIELD), 0) as total_yield
      FROM FARMER f
      LEFT JOIN FARM farm ON f.FARMER_ID = farm.FARMER_ID
      LEFT JOIN CROP c ON farm.FARM_ID = c.FARM_ID
      LEFT JOIN SALES s ON farm.FARM_ID = s.FARM_ID
      GROUP BY f.FARMER_ID, f.NAME
      ORDER BY ${orderBy}
      FETCH FIRST :limit ROWS ONLY
    `;

    const result = await connection.execute(query, { limit: parseInt(limit) });

    await connection.close();

    res.json(result.rows);
  } catch (err) {
    console.error("Get top farmers error:", err);
    res.status(500).json({ message: "Error fetching top farmers" });
  }
});

// ==================== DATABASE MANAGEMENT ENDPOINTS ====================

// Execute custom SQL query (SELECT only for security) (protected)
router.post("/query/execute", protectAdmin, async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: "Query is required" });
  }

  // Security: Only allow SELECT queries
  const trimmedQuery = query.trim().toUpperCase();
  if (!trimmedQuery.startsWith('SELECT')) {
    return res.status(403).json({ 
      message: "Only SELECT queries are allowed for security reasons" 
    });
  }

  // Prevent potentially dangerous queries
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE'];
  if (dangerousKeywords.some(keyword => trimmedQuery.includes(keyword))) {
    return res.status(403).json({ 
      message: "Query contains restricted keywords" 
    });
  }

  try {
    const connection = await getConnection();
    const result = await connection.execute(query);
    await connection.close();

    res.json({
      columns: result.metaData?.map(col => col.name) || [],
      rows: result.rows || [],
      rowCount: result.rows?.length || 0
    });
  } catch (err) {
    console.error("Query execution error:", err);
    res.status(400).json({ 
      message: "Query execution failed", 
      error: err.message 
    });
  }
});

// Get list of database views (protected)
router.get("/views/list", protectAdmin, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT VIEW_NAME, TEXT FROM USER_VIEWS ORDER BY VIEW_NAME`
    );
    await connection.close();

    res.json(result.rows);
  } catch (err) {
    console.error("Get views error:", err);
    res.status(500).json({ message: "Error fetching database views" });
  }
});

// Query specific database view (protected)
router.get("/views/:viewName", protectAdmin, async (req, res) => {
  const { viewName } = req.params;
  const { limit = 100 } = req.query;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM ${viewName} FETCH FIRST :limit ROWS ONLY`,
      { limit: parseInt(limit) }
    );
    await connection.close();

    res.json({
      viewName,
      columns: result.metaData?.map(col => col.name) || [],
      rows: result.rows || [],
      rowCount: result.rows?.length || 0
    });
  } catch (err) {
    console.error("Query view error:", err);
    res.status(400).json({ 
      message: "Failed to query view", 
      error: err.message 
    });
  }
});

// ==================== ADMIN USER MANAGEMENT ENDPOINTS ====================

// Get all admin users (protected - SUPER_ADMIN or ADMIN)
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT ADMIN_ID, USERNAME, EMAIL, FULL_NAME, ROLE, STATUS, CREATED_DATE, LAST_LOGIN 
       FROM ADMIN 
       ORDER BY CREATED_DATE DESC`
    );

    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error("Get admin users error:", err);
    res.status(500).json({ message: "Error fetching admin users" });
  }
});

// Create new admin (SUPER_ADMIN only)
router.post("/users", protectAdmin, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { username, email, password, full_name, role } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    await connection.execute(
      `INSERT INTO ADMIN (ADMIN_ID, USERNAME, EMAIL, PASSWORD, FULL_NAME, ROLE)
       VALUES (ADMIN_SEQ.NEXTVAL, :username, :email, :password, :full_name, :role)`,
      { 
        username, 
        email, 
        password: hashedPassword, 
        full_name, 
        role: role || 'ADMIN' 
      },
      { autoCommit: true }
    );

    await connection.close();
    res.status(201).json({ message: "Admin user created successfully" });
  } catch (err) {
    console.error("Create admin user error:", err);
    if (err.message.includes('unique constraint')) {
      res.status(400).json({ message: "Username or email already exists" });
    } else {
      res.status(500).json({ message: "Error creating admin user" });
    }
  }
});

// Update admin role (SUPER_ADMIN only)
router.put("/users/:id/role", protectAdmin, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE ADMIN SET ROLE = :role WHERE ADMIN_ID = :id`,
      { role, id },
      { autoCommit: true }
    );

    await connection.close();
    res.json({ message: "Admin role updated successfully" });
  } catch (err) {
    console.error("Update admin role error:", err);
    res.status(500).json({ message: "Error updating admin role" });
  }
});

// Deactivate admin user (SUPER_ADMIN only)
router.delete("/users/:id", protectAdmin, requireRole(['SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE ADMIN SET STATUS = 'INACTIVE' WHERE ADMIN_ID = :id`,
      { id },
      { autoCommit: true }
    );

    await connection.close();
    res.json({ message: "Admin user deactivated successfully" });
  } catch (err) {
    console.error("Deactivate admin error:", err);
    res.status(500).json({ message: "Error deactivating admin user" });
  }
});

export default router;
