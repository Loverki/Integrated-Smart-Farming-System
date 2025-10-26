import jwt from 'jsonwebtoken';
import { getConnection } from '../database/connection.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header or invalid format');
      return res.status(401).json({ message: 'No token, unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('Token is empty');
      return res.status(401).json({ message: 'No token, unauthorized' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { farmer_id: decoded.farmer_id, name: decoded.name });
    
    // Check if farmer account is still active in database
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT STATUS FROM FARMER WHERE FARMER_ID = :farmer_id`,
      { farmer_id: decoded.farmer_id }
    );
    await connection.close();

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Farmer account not found' });
    }

    const farmer = result.rows[0];
    if (farmer.STATUS === 'INACTIVE') {
      console.log(`Farmer ${decoded.farmer_id} is INACTIVE - blocking access`);
      return res.status(403).json({ message: 'Admin has deactivated your account. Please contact support.' });
    }
    
    req.farmer = decoded; // attach farmer info to request
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
