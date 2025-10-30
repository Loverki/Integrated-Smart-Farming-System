import express from "express";
import { getConnection } from "../database/connection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET all labour work records with optional filters (filtered by farmer)
router.get("/", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const { status, farm_id, labour_id, work_date } = req.query;
    
    let query = `
      SELECT 
        lw.work_id,
        lw.labour_id,
        l.name as labour_name,
        lw.farm_id,
        f.farm_name,
        lw.work_type,
        lw.work_date,
        lw.start_time,
        lw.end_time,
        lw.hours_worked,
        lw.hourly_rate,
        lw.total_cost,
        lw.work_description,
        lw.status,
        lw.created_date
      FROM LABOURWORK lw
      LEFT JOIN LABOUR l ON lw.labour_id = l.labour_id
      LEFT JOIN FARM f ON lw.farm_id = f.farm_id
      WHERE f.farmer_id = :farmer_id
    `;
    
    const binds = { farmer_id };
    
    if (status) {
      query += ` AND lw.status = :status`;
      binds.status = status;
    }
    
    if (farm_id) {
      query += ` AND lw.farm_id = :farm_id`;
      binds.farm_id = parseInt(farm_id);
    }
    
    if (labour_id) {
      query += ` AND lw.labour_id = :labour_id`;
      binds.labour_id = parseInt(labour_id);
    }
    
    if (work_date) {
      query += ` AND TRUNC(lw.work_date) = TO_DATE(:work_date, 'YYYY-MM-DD')`;
      binds.work_date = work_date;
    }
    
    query += ` ORDER BY lw.work_date DESC, lw.created_date DESC`;
    
    const result = await connection.execute(query, binds);
    console.log(`✅ Retrieved ${result.rows?.length || 0} labour work records for farmer ${farmer_id}`);
    res.json(result.rows || []);
  } catch (err) {
    console.error("Get labour work records error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET labour work summary statistics (filtered by farmer)
router.get("/summary", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN lw.status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN lw.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
        SUM(lw.hours_worked) as total_hours,
        SUM(CASE WHEN lw.status = 'PENDING' THEN lw.total_cost ELSE 0 END) as pending_payment,
        SUM(CASE WHEN lw.status = 'COMPLETED' THEN lw.total_cost ELSE 0 END) as total_paid,
        COUNT(DISTINCT lw.labour_id) as active_labours
      FROM LABOURWORK lw
      JOIN FARM f ON lw.farm_id = f.farm_id
      WHERE f.farmer_id = :farmer_id
    `;
    
    const result = await connection.execute(summaryQuery, { farmer_id });
    const summary = result.rows && result.rows.length > 0 ? result.rows[0] : {};
    console.log(`✅ Retrieved labour work summary for farmer ${farmer_id}`);
    res.json(summary);
  } catch (err) {
    console.error("Get labour work summary error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST create a new labour work record
router.post("/", async (req, res) => {
  const {
    labour_id,
    farm_id,
    work_type,
    work_date,
    start_time,
    end_time,
    hours_worked,
    hourly_rate,
    work_description,
    status
  } = req.body;

  if (!labour_id || !farm_id || !work_date || !hours_worked || !hourly_rate) {
    return res.status(400).json({ 
      message: "Labour ID, Farm ID, work date, hours worked, and hourly rate are required" 
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Calculate total cost
    const totalCost = parseFloat(hours_worked) * parseFloat(hourly_rate);

    // Check if WORK_SEQ exists, if not create it
    try {
      await connection.execute(`SELECT WORK_SEQ.NEXTVAL FROM DUAL`);
    } catch (seqErr) {
      // Sequence doesn't exist, create it
      await connection.execute(`CREATE SEQUENCE WORK_SEQ START WITH 1 INCREMENT BY 1`);
    }

    let insertQuery;
    const binds = {
      labour_id: parseInt(labour_id),
      farm_id: parseInt(farm_id),
      work_type: work_type || 'General Work',
      work_date: work_date,
      hours_worked: parseFloat(hours_worked),
      hourly_rate: parseFloat(hourly_rate),
      total_cost: totalCost,
      work_description: work_description || null,
      status: status || 'PENDING'
    };

    if (start_time && end_time) {
      insertQuery = `
        INSERT INTO LABOURWORK(
          work_id, labour_id, farm_id, work_type, work_date, 
          start_time, end_time, hours_worked, hourly_rate, 
          total_cost, work_description, status, created_date
        ) VALUES(
          WORK_SEQ.NEXTVAL, :labour_id, :farm_id, :work_type, 
          TO_DATE(:work_date, 'YYYY-MM-DD'),
          TO_TIMESTAMP(:start_time, 'YYYY-MM-DD HH24:MI:SS'),
          TO_TIMESTAMP(:end_time, 'YYYY-MM-DD HH24:MI:SS'),
          :hours_worked, :hourly_rate, :total_cost, :work_description, 
          :status, SYSDATE
        )
      `;
      binds.start_time = start_time;
      binds.end_time = end_time;
    } else if (start_time) {
      insertQuery = `
        INSERT INTO LABOURWORK(
          work_id, labour_id, farm_id, work_type, work_date, 
          start_time, hours_worked, hourly_rate, 
          total_cost, work_description, status, created_date
        ) VALUES(
          WORK_SEQ.NEXTVAL, :labour_id, :farm_id, :work_type, 
          TO_DATE(:work_date, 'YYYY-MM-DD'),
          TO_TIMESTAMP(:start_time, 'YYYY-MM-DD HH24:MI:SS'),
          :hours_worked, :hourly_rate, :total_cost, :work_description, 
          :status, SYSDATE
        )
      `;
      binds.start_time = start_time;
    } else if (end_time) {
      insertQuery = `
        INSERT INTO LABOURWORK(
          work_id, labour_id, farm_id, work_type, work_date, 
          end_time, hours_worked, hourly_rate, 
          total_cost, work_description, status, created_date
        ) VALUES(
          WORK_SEQ.NEXTVAL, :labour_id, :farm_id, :work_type, 
          TO_DATE(:work_date, 'YYYY-MM-DD'),
          TO_TIMESTAMP(:end_time, 'YYYY-MM-DD HH24:MI:SS'),
          :hours_worked, :hourly_rate, :total_cost, :work_description, 
          :status, SYSDATE
        )
      `;
      binds.end_time = end_time;
    } else {
      insertQuery = `
        INSERT INTO LABOURWORK(
          work_id, labour_id, farm_id, work_type, work_date, 
          hours_worked, hourly_rate, 
          total_cost, work_description, status, created_date
        ) VALUES(
          WORK_SEQ.NEXTVAL, :labour_id, :farm_id, :work_type, 
          TO_DATE(:work_date, 'YYYY-MM-DD'),
          :hours_worked, :hourly_rate, :total_cost, :work_description, 
          :status, SYSDATE
        )
      `;
    }

    await connection.execute(insertQuery, binds, { autoCommit: true });

    res.json({ 
      message: "Labour work record created successfully",
      total_cost: totalCost
    });
  } catch (err) {
    console.error("Create labour work record error:", err);
    res.status(500).json({ 
      message: "Failed to create labour work record",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT update labour work record (mainly for status updates)
router.put("/:work_id", async (req, res) => {
  const { work_id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Check if work record exists
    const checkResult = await connection.execute(
      `SELECT work_id FROM LABOURWORK WHERE work_id = :work_id`,
      { work_id: parseInt(work_id) }
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Work record not found" });
    }

    // Update the status
    await connection.execute(
      `UPDATE LABOURWORK SET status = :status WHERE work_id = :work_id`,
      { 
        status: status,
        work_id: parseInt(work_id) 
      },
      { autoCommit: true }
    );

    res.json({ 
      message: "Work record updated successfully",
      work_id: parseInt(work_id),
      status: status
    });
  } catch (err) {
    console.error("Update labour work record error:", err);
    res.status(500).json({ 
      message: "Failed to update work record",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE a labour work record
router.delete("/:work_id", async (req, res) => {
  const { work_id } = req.params;

  let connection;
  try {
    connection = await getConnection();

    // Check if work record exists
    const checkResult = await connection.execute(
      `SELECT work_id, work_type FROM LABOURWORK WHERE work_id = :work_id`,
      { work_id: parseInt(work_id) }
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Work record not found" });
    }

    const workType = checkResult.rows[0].WORK_TYPE || checkResult.rows[0].work_type;

    // Delete the work record
    await connection.execute(
      `DELETE FROM LABOURWORK WHERE work_id = :work_id`,
      { work_id: parseInt(work_id) },
      { autoCommit: true }
    );

    res.json({
      message: "Work record deleted successfully",
      work_id: parseInt(work_id),
      work_type: workType
    });
  } catch (err) {
    console.error("Delete labour work record error:", err);
    res.status(500).json({ 
      message: "Failed to delete work record",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

