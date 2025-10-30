import express from "express";
import { getConnection } from "../database/connection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET all sales for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  console.log('=== GET /api/sales ===');
  console.log('Farmer ID from token:', farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();
    console.log('Database connected successfully');
    
    // Query with explicit columns to handle LOB fields properly
    const result = await connection.execute(
      `SELECT 
        s.sale_id,
        s.farm_id,
        s.crop_id,
        s.buyer_name,
        s.buyer_contact,
        s.quantity_sold,
        s.unit,
        s.price_per_unit,
        s.total_amount,
        s.sale_date,
        s.payment_method,
        s.payment_status,
        s.invoice_number,
        DBMS_LOB.SUBSTR(s.notes, 4000, 1) as notes,
        f.farm_name,
        c.crop_name
      FROM SALES s
      JOIN FARM f ON s.farm_id = f.farm_id
      LEFT JOIN CROP c ON s.crop_id = c.crop_id
      WHERE f.farmer_id = :farmer_id
      ORDER BY s.sale_id DESC`,
      { farmer_id }
    );
    
    console.log('✅ Query executed. Rows returned:', result.rows?.length || 0);
    
    if (result.rows && result.rows.length > 0) {
      console.log('Sample row:', result.rows[0]);
    }
    
    res.status(200).json(result.rows || []);
  } catch (err) {
    console.error("❌ Get sales error:", err.message);
    console.error("Error code:", err.errorNum);
    console.error("Full error:", err);
    res.status(500).json({ 
      error: err.message,
      errorCode: err.errorNum,
      details: "Failed to fetch sales data"
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
});

// POST a new sale
router.post("/", async (req, res) => {
  console.log('=== Sales POST Request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { 
    farm_id, 
    crop_id, 
    buyer_name, 
    buyer_contact,
    quantity_sold, 
    unit,
    price_per_unit, 
    total_amount,
    sale_date,
    payment_method,
    payment_status,
    invoice_number,
    notes
  } = req.body;

  const farmer_id = parseInt(req.farmer?.farmer_id);

  console.log('Farmer ID:', farmer_id);
  console.log('Extracted values:', {
    farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, 
    unit, price_per_unit, total_amount, sale_date, 
    payment_method, payment_status, invoice_number, notes
  });

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!farm_id || !buyer_name || !buyer_contact || !quantity_sold || !price_per_unit || !sale_date) {
    console.log('Missing required fields!');
    return res.status(400).json({ message: "Missing required fields: farm, buyer name, buyer contact, quantity, price, and sale date are required" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Validate farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid farm_id or does not belong to the farmer" });
    }

    const insertQuery = `
      INSERT INTO SALES(
        sale_id, farm_id, crop_id, buyer_name, buyer_contact,
        quantity_sold, unit, price_per_unit, total_amount, sale_date,
        payment_method, payment_status, invoice_number, notes
      ) VALUES(
        SALES_SEQ.NEXTVAL, :farm_id, :crop_id, :buyer_name, :buyer_contact,
        :quantity_sold, :unit, :price_per_unit, :total_amount, TO_DATE(:sale_date, 'YYYY-MM-DD'),
        :payment_method, :payment_status, :invoice_number, :notes
      )
    `;

    const binds = {
      farm_id: parseInt(farm_id),
      crop_id: crop_id ? parseInt(crop_id) : null,
      buyer_name: buyer_name && buyer_name.trim() !== '' ? buyer_name.trim() : null,
      buyer_contact: buyer_contact && buyer_contact.trim() !== '' ? buyer_contact.trim() : null,
      quantity_sold: parseFloat(quantity_sold),
      unit: unit && unit.trim() !== '' ? unit.trim() : 'KG',
      price_per_unit: parseFloat(price_per_unit),
      total_amount: total_amount ? parseFloat(total_amount) : (parseFloat(quantity_sold) * parseFloat(price_per_unit)),
      sale_date,
      payment_method: payment_method && payment_method.trim() !== '' ? payment_method.trim() : 'CASH',
      payment_status: payment_status && payment_status.trim() !== '' ? payment_status.trim() : 'PENDING',
      invoice_number: invoice_number && invoice_number.trim() !== '' ? invoice_number.trim() : null,
      notes: notes && notes.trim() !== '' ? notes.trim() : null
    };

    console.log('Final binds for Oracle:', JSON.stringify(binds, null, 2));
    console.log('Insert Query:', insertQuery);

    const result = await connection.execute(insertQuery, binds, { autoCommit: true });
    console.log('Insert result:', result);

    res.json({ message: "Sale recorded successfully" });
  } catch (err) {
    console.error("Add sale error:", err);
    res.status(500).json({ 
      message: "Failed to record sale",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// UPDATE payment status for a sale
router.put("/:sale_id/payment-status", async (req, res) => {
  const { sale_id } = req.params;
  const { payment_status } = req.body;
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!payment_status) {
    return res.status(400).json({ message: "payment_status is required" });
  }

  const validStatuses = ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'];
  if (!validStatuses.includes(payment_status)) {
    return res.status(400).json({ message: "Invalid payment status. Must be: PENDING, PAID, PARTIAL, or OVERDUE" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify sale belongs to farmer
    const saleCheck = await connection.execute(
      `SELECT s.sale_id, s.payment_status as old_status, s.buyer_name
       FROM SALES s
       JOIN FARM f ON s.farm_id = f.farm_id
       WHERE s.sale_id = :sale_id AND f.farmer_id = :farmer_id`,
      { sale_id: parseInt(sale_id), farmer_id }
    );

    if (saleCheck.rows.length === 0) {
      return res.status(404).json({ message: "Sale not found or does not belong to you" });
    }

    const oldStatus = saleCheck.rows[0].OLD_STATUS;
    const buyerName = saleCheck.rows[0].BUYER_NAME;

    // Update payment status
    await connection.execute(
      `UPDATE SALES 
       SET payment_status = :payment_status
       WHERE sale_id = :sale_id`,
      { payment_status, sale_id: parseInt(sale_id) },
      { autoCommit: true }
    );

    res.json({
      message: "Payment status updated successfully",
      sale_id: parseInt(sale_id),
      buyer_name: buyerName,
      old_status: oldStatus,
      new_status: payment_status
    });

  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ message: "Failed to update payment status", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;
