import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../database/connection.js';

export const registerFarmer = async (req, res) => {
  const { name, location, phone, password } = req.body;
  try {
    const conn = await getConnection();

    const hashedPassword = await bcrypt.hash(password, 10);

    await conn.execute(
      `INSERT INTO FARMERS (NAME, LOCATION, PHONE, PASSWORD)
       VALUES (:name, :location, :phone, :password)`,
      { name, location, phone, password: hashedPassword },
      { autoCommit: true }
    );

    await conn.close();
    res.status(201).json({ message: 'Farmer registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering farmer' });
  }
};

export const loginFarmer = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT FARMER_ID, NAME, PASSWORD FROM FARMERS WHERE PHONE = :phone`,
      [phone]
    );

    await conn.close();

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Invalid credentials' });

    const farmer = result.rows[0];
    const isMatch = await bcrypt.compare(password, farmer.PASSWORD);

    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { farmerId: farmer.FARMER_ID, name: farmer.NAME },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, farmerId: farmer.FARMER_ID, name: farmer.NAME });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in farmer' });
  }
};
