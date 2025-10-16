import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.farmer = decoded; // attach farmer info to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
