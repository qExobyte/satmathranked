import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!; 
const JWT_EXPIRES_IN = "1h";

function verifyToken (req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.authToken;
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "No token provided" 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: number; 
      email: string;
    };
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

function generateToken (userId: number, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export { verifyToken, generateToken };