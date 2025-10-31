import jwt from 'jsonwebtoken';
import { getConnection } from '../database/connection.js';

// Protect admin routes - verify adminToken
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Admin auth: No authorization header or invalid format');
      return res.status(401).json({ message: 'No admin token, unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('Admin auth: Token is empty');
      return res.status(401).json({ message: 'No admin token, unauthorized' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Admin auth: JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Admin token decoded successfully:', { 
      admin_id: decoded.admin_id, 
      username: decoded.username, 
      role: decoded.role 
    });
    
    // Check if admin account is still active in database
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT STATUS FROM ADMIN WHERE ADMIN_ID = :admin_id`,
      { admin_id: decoded.admin_id }
    );
    
    if (!result.rows || result.rows.length === 0) {
      await connection.close();
      console.log(`❌ Admin ${decoded.admin_id} NOT FOUND in database (deleted or never existed)`);
      return res.status(401).json({ 
        message: 'Admin account not found.',
        requiresLogin: true,
        userDeleted: true
      });
    }
    
    await connection.close();

    const admin = result.rows[0];
    if (admin.STATUS !== 'ACTIVE') {
      console.log(`❌ Admin ${decoded.admin_id} is not ACTIVE - blocking access`);
      return res.status(403).json({ 
        message: 'Your admin account has been deactivated.',
        requiresLogin: true,
        accountInactive: true
      });
    }
    
    console.log(`✅ Admin ${decoded.admin_id} verified and ACTIVE`);
    
    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('Admin JWT verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Admin token expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid admin token' });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      console.log(`Access denied: User role ${req.admin.role} not in ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    console.log(`Access granted: User role ${req.admin.role} authorized`);
    next();
  };
};

