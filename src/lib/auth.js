// src/lib/auth.js
import jwt from 'jsonwebtoken';

export async function verifyToken(req) {
  try {
    // Headers se token nikalna
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    
    // JWT verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}