import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error Stack:', err); // Log the full stack trace for debugging

  // 1. Set Defaults
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // 2. Handle Prisma Errors (Specific Database Issues)
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'fail',
      message: 'Unique constraint failed. Email or ID already exists.'
    });
  }

  // 3. Send Response
  // This covers AppError AND default 500s
  res.status(statusCode).json({
    status: err.status || 'error',
    message: message
  });
};