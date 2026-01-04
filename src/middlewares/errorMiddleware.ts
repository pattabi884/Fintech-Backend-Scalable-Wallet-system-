import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  // Prisma Unique Constraint Violation (e.g., Duplicate Email/VAM)
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Conflict', 
      message: 'Unique constraint failed. Email or ID already exists.' 
    });
  }

  // Handle other known errors
  if (err.message === 'Missing fields') {
    return res.status(400).json({ error: 'Validation Error', message: err.message });
  }

  // Default 500 Error
  return res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message || 'Something went wrong' 
  });
};