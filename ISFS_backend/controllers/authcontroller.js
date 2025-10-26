import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../database/connection.js';

export const registerFarmer = async (req, res) => {
  const { name, phone, address, password } = req.body;
  if (!name || !phone || !password)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO FARMER (FARMER_ID, NAME, PHONE, ADDRESS, PASSWORD)
       VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :address, :password)`,
      { name, phone, address, password: hashedPassword },
      { autoCommit: true }
    );

    await connection.close();
    res.status(201).json({ message: "Farmer registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering farmer" });
  }
};

export const loginFarmer = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE PHONE = :phone`,
      { phone }
    );

    const farmer = result.rows[0];
    await connection.close();

    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    // Check if farmer account is active
    if (farmer.STATUS === 'INACTIVE') {
      return res.status(403).json({ message: "Admin has deactivated your account. Please contact support." });
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
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
};
