import { Request, Response, NextFunction} from 'express';

//type defination of the controller function

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;
// wrapper it wraps all async function automatically

export const asyncHandler =  (fn: AsyncController) => {
    return (req: Request, res: Response, next: NextFunction) =>{
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};