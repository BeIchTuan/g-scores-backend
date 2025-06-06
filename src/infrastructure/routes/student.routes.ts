import { Router, Request, Response, NextFunction } from 'express';
import { StudentController } from '../controllers/student.controller';
import { validateRequest } from '../../presentation/middleware/validate-request';

const router = Router();
const controller = new StudentController();

router.get(
  '/score/:registrationNumber',
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller.getScore(req, res)).catch(next);
  }
);

export default router;