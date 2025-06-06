import { Router, Request, Response, NextFunction } from 'express';
import { ReportController } from '../controllers/report.controller';
import { validateRequest } from '../../presentation/middleware/validate-request';

const router = Router();
const controller = new ReportController();

router.get(
  '/score-levels',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=6000000'); 
      await controller.getScoreLevelStats(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/averages',
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller.getAverageScores(req, res)).catch(next);
  }
);

router.get(
  '/top/group-a',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=300'); 
      await controller.getTopGroupA(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;