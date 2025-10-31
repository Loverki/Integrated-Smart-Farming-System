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

// Recalculate Farmer Totals (ADMIN only)
router.post("/recalculate-farmer-totals", protectAdmin, async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    
    console.log("🔄 Admin initiated farmer totals recalculation...");
    
    // Execute the recalculation procedure
    await connection.execute(`BEGIN RECALC_FARMER_TOTALS; END;`);
    await connection.commit();
    
    console.log("✅ Farmer totals recalculated successfully");
    
    // Get verification results
    const result = await connection.execute(`
      SELECT 
        f.farmer_id,
        f.name,
        f.total_farms,
        f.total_area,
        COUNT(fm.farm_id) AS actual_farms,
        NVL(SUM(fm.area), 0) AS actual_area
      FROM FARMER f
      LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id AND fm.status = 'ACTIVE'
      GROUP BY f.farmer_id, f.name, f.total_farms, f.total_area
      ORDER BY f.farmer_id
    `);
    
    const farmers = result.rows.map(row => ({
      farmer_id: row[0],
      name: row[1],
      total_farms: row[2],
      total_area: row[3],
      actual_farms: row[4],
      actual_area: row[5],
      status: (row[2] === row[4] && row[3] === row[5]) ? 'CORRECT' : 'MISMATCH'
    }));
    
    res.json({
      message: "Farmer totals recalculated successfully",
      farmers: farmers,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("Recalculate farmer totals error:", err);
    res.status(500).json({ 
      message: "Error recalculating farmer totals",
      error: err.message 
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// ==================== NOTIFICATION MANAGEMENT ENDPOINTS ====================

// POST /admin/alerts/send - Send notification to specific farmers
router.post("/alerts/send", protectAdmin, async (req, res) => {
  const { farmerIds, message, title, alertType, severity } = req.body;

  if (!farmerIds || !Array.isArray(farmerIds) || farmerIds.length === 0) {
    return res.status(400).json({ message: "Farmer IDs array is required" });
  }

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: "Message is required" });
  }

  let connection;
  try {
    // Import simple notification service
    const { sendBulkNotification } = await import('../services/simpleNotificationService.js');
    
    const webResults = sendBulkNotification(
      farmerIds, 
      {
        title: title || alertType || 'Important Alert',
        message,
        type: alertType || 'INFO',
        severity: severity || 'INFO'
      }
    );

    // Fetch phones and emails, then send SMS and emails
    const { getConnection } = await import('../database/connection.js');
    connection = await getConnection();
    const phones = [];
    const emails = [];
    
    console.log(`[Admin Alerts] Fetching phone numbers and emails for ${farmerIds.length} farmer(s)`);
    console.log(`[Admin Alerts] Farmer IDs:`, farmerIds);
    
    for (const id of farmerIds) {
      try {
        // Ensure id is a number (in case it comes as string from frontend)
        const farmerId = typeof id === 'string' ? parseInt(id, 10) : id;
        console.log(`[Admin Alerts] Querying phone and email for farmer_id: ${farmerId} (type: ${typeof farmerId})`);
        
        const r = await connection.execute(
          `SELECT PHONE, EMAIL FROM FARMER WHERE FARMER_ID = :id`,
          { id: farmerId }
        );
        
        console.log(`[Admin Alerts] Query result for farmer_id ${farmerId}:`);
        console.log(`[Admin Alerts] - Rows count:`, r.rows?.length || 0);
        console.log(`[Admin Alerts] - MetaData:`, r.metaData?.map(c => ({ name: c.name, dbType: c.dbType })) || 'N/A');
        console.log(`[Admin Alerts] - First row:`, r.rows?.[0]);
        console.log(`[Admin Alerts] - First row type:`, typeof r.rows?.[0], `isArray:`, Array.isArray(r.rows?.[0]));
        
        if (r.rows && r.rows.length > 0) {
          const row = r.rows[0];
          let phone = null;
          let email = null;
          
          // Oracle returns rows as arrays by default
          if (Array.isArray(row)) {
            phone = row[0];
            email = row[1];
            console.log(`[Admin Alerts] Phone from array[0]:`, phone);
            console.log(`[Admin Alerts] Email from array[1]:`, email);
          } else if (row !== null && row !== undefined) {
            // If not array, might be an object with uppercase keys (Oracle outFormat)
            if (typeof row === 'object' && 'PHONE' in row) {
              phone = row.PHONE;
              email = row.EMAIL;
              console.log(`[Admin Alerts] Phone from object.PHONE:`, phone);
              console.log(`[Admin Alerts] Email from object.EMAIL:`, email);
            } else {
              phone = row;
              console.log(`[Admin Alerts] Phone from direct value:`, phone);
            }
          }
          
          // Process phone
          if (phone !== null && phone !== undefined) {
            const phoneStr = String(phone).trim();
            console.log(`[Admin Alerts] Phone after String() and trim:`, phoneStr);
            
            if (phoneStr !== '' && phoneStr !== 'undefined' && phoneStr !== 'null' && phoneStr !== '[object Object]') {
              phones.push(phoneStr);
              console.log(`[Admin Alerts] ✓ Added phone: ${phoneStr}`);
            } else {
              console.warn(`[Admin Alerts] ⚠ Phone is empty/invalid after conversion for farmer_id: ${farmerId}`);
            }
          } else {
            console.warn(`[Admin Alerts] ⚠ Phone is NULL/undefined for farmer_id: ${farmerId}`);
          }

          // Process email
          if (email !== null && email !== undefined) {
            const emailStr = String(email).trim();
            console.log(`[Admin Alerts] Email after String() and trim:`, emailStr);
            
            if (emailStr !== '' && emailStr !== 'undefined' && emailStr !== 'null' && emailStr !== '[object Object]') {
              // Basic email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(emailStr)) {
                emails.push(emailStr);
                console.log(`[Admin Alerts] ✓ Added email: ${emailStr}`);
              } else {
                console.warn(`[Admin Alerts] ⚠ Email is invalid format for farmer_id: ${farmerId} - ${emailStr}`);
              }
            } else {
              console.warn(`[Admin Alerts] ⚠ Email is empty/invalid after conversion for farmer_id: ${farmerId}`);
            }
          } else {
            console.warn(`[Admin Alerts] ⚠ Email is NULL/undefined for farmer_id: ${farmerId}`);
          }
        } else {
          console.warn(`[Admin Alerts] ⚠ No farmer found with farmer_id: ${farmerId}`);
        }
      } catch (err) {
        console.error(`[Admin Alerts] ✗ Error fetching phone/email for farmer_id ${id}:`, err.message);
      }
    }
    
    console.log(`[Admin Alerts] Total phones collected: ${phones.length}`);
    console.log(`[Admin Alerts] Phone numbers:`, phones);
    console.log(`[Admin Alerts] Total emails collected: ${emails.length}`);
    console.log(`[Admin Alerts] Email addresses:`, emails);

    // Track farmers with missing phones for reporting
    const farmersWithoutPhones = [];
    if (phones.length === 0 && farmerIds.length > 0) {
      // Only query if we have no phones but have farmer IDs
      for (const id of farmerIds) {
        const farmerId = typeof id === 'string' ? parseInt(id, 10) : id;
        try {
          const farmerCheck = await connection.execute(
            `SELECT farmer_id, name FROM FARMER WHERE farmer_id = :id`,
            { id: farmerId }
          );
          
          if (farmerCheck.rows && farmerCheck.rows.length > 0) {
            farmersWithoutPhones.push({
              farmer_id: farmerCheck.rows[0][0],
              name: farmerCheck.rows[0][1]
            });
          }
        } catch (err) {
          console.error(`[Admin Alerts] Error checking farmer ${farmerId}:`, err.message);
        }
      }
    }

    // Send SMS
    let smsResults = [];
    if (phones.length > 0) {
      const { sendBulkSms } = await import('../services/smsService.js');
      smsResults = await sendBulkSms(phones, message);
    } else {
      console.warn(`[Admin Alerts] No phone numbers available - SMS skipped`);
    }

    // Send Emails
    let emailResults = [];
    if (emails.length > 0) {
      const { sendBulkEmail } = await import('../services/emailService.js');
      const emailSubject = title || alertType || 'Important Alert from ISFS';
      emailResults = await sendBulkEmail(emails, emailSubject, message);
    } else {
      console.warn(`[Admin Alerts] No email addresses available - Email skipped`);
    }

    const response = {
      message: "Notifications processed",
      web: {
        totalSent: webResults.filter(r => r.success).length,
        totalFailed: webResults.filter(r => !r.success).length
      },
      sms: {
        totalAttempted: phones.length,
        totalSent: smsResults.filter(r => r.success).length,
        totalFailed: smsResults.filter(r => !r.success && !r.disabled).length,
        disabled: smsResults.length > 0 ? smsResults.every(r => r.disabled) : false,
        skipped: phones.length === 0 && farmerIds.length > 0
      },
      email: {
        totalAttempted: emails.length,
        totalSent: emailResults.filter(r => r.success).length,
        totalFailed: emailResults.filter(r => !r.success && !r.disabled).length,
        disabled: emailResults.length > 0 ? emailResults.every(r => r.disabled) : false,
        skipped: emails.length === 0 && farmerIds.length > 0
      }
    };

    // Add warnings if farmers have missing contact info
    if (farmersWithoutPhones.length > 0) {
      response.warning = `${farmersWithoutPhones.length} farmer(s) have no phone number. SMS not sent to these farmers.`;
      response.farmersWithoutPhones = farmersWithoutPhones;
    }

    res.json(response);
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ 
      message: "Failed to send notifications", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /admin/alerts/broadcast - Broadcast notification to all active farmers
router.post("/alerts/broadcast", protectAdmin, async (req, res) => {
  const { message, title, alertType, severity } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: "Message is required" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Get all active farmers
    const result = await connection.execute(
      `SELECT farmer_id FROM FARMER WHERE status = 'ACTIVE'`
    );

    const farmerIds = result.rows.map(row => row[0]);

    if (farmerIds.length === 0) {
      return res.json({ message: "No active farmers found" });
    }

    // Import simple notification service
    const { sendBulkNotification } = await import('../services/simpleNotificationService.js');

    const webResults = sendBulkNotification(
      farmerIds, 
      {
        title: title || 'Broadcast Message',
        message,
        type: alertType || 'BROADCAST',
        severity: severity || 'INFO'
      }
    );

    // Fetch phones and emails, then send SMS and emails
    const phones = [];
    const emails = [];
    
    console.log(`[Admin Alerts Broadcast] Fetching phone numbers and emails for ${farmerIds.length} farmer(s)`);
    console.log(`[Admin Alerts Broadcast] Farmer IDs:`, farmerIds);
    
    for (const id of farmerIds) {
      try {
        // Ensure id is a number (in case it comes as string from frontend)
        const farmerId = typeof id === 'string' ? parseInt(id, 10) : id;
        console.log(`[Admin Alerts Broadcast] Querying phone and email for farmer_id: ${farmerId}`);
        
        const r = await connection.execute(
          `SELECT PHONE, EMAIL FROM FARMER WHERE FARMER_ID = :id`,
          { id: farmerId }
        );
        
        if (r.rows && r.rows.length > 0) {
          const row = r.rows[0];
          let phone = null;
          let email = null;
          
          // Handle Oracle result format
          if (Array.isArray(row)) {
            phone = row[0];
            email = row[1];
          } else if (row && typeof row === 'object') {
            phone = row.PHONE;
            email = row.EMAIL;
          }
          
          // Process phone
          if (phone && String(phone).trim() !== '') {
            phones.push(String(phone).trim());
            console.log(`[Admin Alerts Broadcast] ✓ Added phone: ${phone}`);
          }
          
          // Process email
          if (email && String(email).trim() !== '') {
            const emailStr = String(email).trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailStr)) {
              emails.push(emailStr);
              console.log(`[Admin Alerts Broadcast] ✓ Added email: ${emailStr}`);
            }
          }
        } else {
          console.warn(`[Admin Alerts Broadcast] ⚠ No farmer found with farmer_id: ${farmerId}`);
        }
      } catch (err) {
        console.error(`[Admin Alerts Broadcast] ✗ Error fetching phone/email for farmer_id ${id}:`, err.message);
      }
    }
    
    console.log(`[Admin Alerts Broadcast] Total phones collected: ${phones.length}`);
    console.log(`[Admin Alerts Broadcast] Total emails collected: ${emails.length}`);

    // Send SMS
    const { sendBulkSms } = await import('../services/smsService.js');
    const smsResults = await sendBulkSms(phones, message);

    // Send Emails
    let emailResults = [];
    if (emails.length > 0) {
      const { sendBulkEmail } = await import('../services/emailService.js');
      const emailSubject = title || 'Broadcast Message from ISFS';
      emailResults = await sendBulkEmail(emails, emailSubject, message);
    }

    res.json({
      message: "Broadcast processed",
      totalFarmers: farmerIds.length,
      web: {
        totalSent: webResults.filter(r => r.success).length,
        totalFailed: webResults.filter(r => !r.success).length
      },
      sms: {
        totalAttempted: phones.length,
        totalSent: smsResults.filter(r => r.success).length,
        totalFailed: smsResults.filter(r => !r.success && !r.disabled).length,
        disabled: smsResults.length > 0 ? smsResults.every(r => r.disabled) : false
      },
      email: {
        totalAttempted: emails.length,
        totalSent: emailResults.filter(r => r.success).length,
        totalFailed: emailResults.filter(r => !r.success && !r.disabled).length,
        disabled: emailResults.length > 0 ? emailResults.every(r => r.disabled) : false
      }
    });
  } catch (error) {
    console.error("Error broadcasting notifications:", error);
    res.status(500).json({ 
      message: "Failed to broadcast notifications", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /admin/alerts/history - View all sent notifications
router.get("/alerts/history", protectAdmin, async (req, res) => {
  const { limit = 100 } = req.query;

  let connection;
  try {
    connection = await getConnection();

    // Import simple notification service
    const { getAllNotifications } = await import('../services/simpleNotificationService.js');
    
    const allNotifications = getAllNotifications(parseInt(limit));

    // Get farmer names for each notification
    const notificationsWithNames = await Promise.all(
      allNotifications.map(async (notification) => {
        try {
          // Get farmer name - handle Oracle result format (array or object)
          const farmerResult = await connection.execute(
            `SELECT NAME FROM FARMER WHERE FARMER_ID = :farmer_id`,
            { farmer_id: notification.farmerId }
          );

          let farmerName = 'Unknown';
          if (farmerResult.rows && farmerResult.rows.length > 0) {
            const row = farmerResult.rows[0];
            if (Array.isArray(row)) {
              farmerName = row[0] || 'Unknown';
            } else if (row && row.NAME) {
              farmerName = row.NAME;
            } else if (typeof row === 'string') {
              farmerName = row;
            }
          }

          // Get first active farm name for the farmer (optional - notifications are farmer-level)
          let farmName = null;
          try {
            const farmResult = await connection.execute(
              `SELECT FARM_NAME FROM FARM WHERE FARMER_ID = :farmer_id AND STATUS = 'ACTIVE' AND ROWNUM = 1`,
              { farmer_id: notification.farmerId }
            );
            if (farmResult.rows && farmResult.rows.length > 0) {
              const farmRow = farmResult.rows[0];
              if (Array.isArray(farmRow)) {
                farmName = farmRow[0];
              } else if (farmRow && farmRow.FARM_NAME) {
                farmName = farmRow.FARM_NAME;
              } else if (typeof farmRow === 'string') {
                farmName = farmRow;
              }
            }
          } catch (farmError) {
            // Farm lookup is optional, continue without it
            console.debug(`[Admin Alerts] Could not fetch farm for farmer ${notification.farmerId}:`, farmError.message);
          }

          return {
            ...notification,
            farmerName: farmerName || 'Unknown',
            farmName: farmName || null,
            alertId: notification.id,
            alertType: notification.type,
            createdDate: notification.createdAt, // Add for backward compatibility
            status: 'SENT', // All in-memory notifications are sent
            isRead: notification.read
          };
        } catch (error) {
          console.error(`[Admin Alerts] Error fetching data for notification ${notification.id}:`, error.message);
          return {
            ...notification,
            farmerName: 'Unknown',
            farmName: null,
            alertId: notification.id,
            alertType: notification.type,
            createdDate: notification.createdAt, // Add for backward compatibility
            status: 'SENT',
            isRead: notification.read
          };
        }
      })
    );

    // Get statistics
    const { getStatistics } = await import('../services/simpleNotificationService.js');
    const stats = getStatistics();

    res.json({
      alerts: notificationsWithNames,
      statistics: {
        totalAlerts: stats.totalNotifications,
        sent: stats.totalNotifications,
        failed: 0,
        readCount: stats.totalNotifications - stats.totalUnread
      }
    });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    res.status(500).json({ 
      message: "Failed to fetch notification history", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /admin/alerts/stats - Get notification statistics
router.get("/alerts/stats", protectAdmin, async (req, res) => {
  try {
    // Import simple notification service
    const { getStatistics } = await import('../services/simpleNotificationService.js');
    
    const stats = getStatistics();

    // Convert to array format expected by frontend
    const statsArray = [];

    // Add stats by type
    Object.entries(stats.typeCounts || {}).forEach(([type, count]) => {
      statsArray.push({
        alertType: type,
        severity: 'ALL',
        count: count,
        sent: count,
        failed: 0,
        readCount: 0 // We can't easily calculate this per type in memory
      });
    });

    // If no stats, add a default entry
    if (statsArray.length === 0) {
      statsArray.push({
        alertType: 'INFO',
        severity: 'INFO',
        count: 0,
        sent: 0,
        failed: 0,
        readCount: 0
      });
    }

    res.json(statsArray);
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch notification statistics", 
      error: error.message 
    });
  }
});

export default router;
