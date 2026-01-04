import { Response } from 'express';

export class ApiResponse {

  static success<T>(res: Response, data: T, message = "Success", statusCode: number = 200) {
  return res.status(200).json({
    success: true,
    message,
    data
  });
}

    static error(res: Response, message: string = "Internal Server Error", statusCode: number = 500, errorDetails?: any){
        return res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === "devlopment" ? errorDetails : undefined
        });
    } 
}