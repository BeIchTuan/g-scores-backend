import { Request, Response, NextFunction } from 'express';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { registrationNumber } = req.params;
  if (!registrationNumber) {
    res.status(400).json({ 
      success: false,
      message: 'Registration number is required' 
    });
    return;
  }
  next();
};