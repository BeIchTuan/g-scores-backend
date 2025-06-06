import { Request, Response } from 'express';
import { GenerateReports } from '../../application/use-cases/generate-reports';
import { GetTopStudents } from '../../application/use-cases/get-top-students';
import { StudentRepository } from '../repositories/student.repository';
import CacheService from '../services/cache.service';

export class ReportController {
  private generateReports: GenerateReports;
  private cacheService: CacheService;
  private getTopStudents: GetTopStudents;

  constructor() {
    const studentRepo = new StudentRepository();
    this.generateReports = new GenerateReports(studentRepo);
    this.cacheService = CacheService.getInstance();
    this.getTopStudents = new GetTopStudents(studentRepo);
  }

  async getScoreLevelStats(req: Request, res: Response): Promise<void> {
    try {
      const cachedStats = await this.cacheService.getScoreLevelStats();
      if (cachedStats) {
        res.json({
          success: true,
          data: cachedStats,
          source: 'cache'
        });
        return;
      }

      const stats = await this.generateReports.generateScoreLevelStatistics();
      
      await this.cacheService.setScoreLevelStats(stats);
      
      res.json({
        success: true,
        data: stats,
        source: 'database'
      });
    } catch (error) {
      console.error('Error generating score level statistics:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while generating statistics'
      });
    }
  }

  async getAverageScores(req: Request, res: Response): Promise<void> {
    try {
      const averages = await this.generateReports.generateAverageScores();
      res.json({
        success: true,
        data: averages
      });
    } catch (error) {
      console.error('Error generating average scores:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while generating average scores'
      });
    }
  }

  async getTopGroupA(req: Request, res: Response): Promise<void> {
    try {
      const cachedTopStudents = await this.cacheService.get('top_group_a');
      if (cachedTopStudents) {
        res.json({
          success: true,
          data: cachedTopStudents,
          source: 'cache'
        });
        return;
      }

      const topStudents = await this.getTopStudents.executeGroupA(10);
      
      await this.cacheService.set('top_group_a', topStudents, 300);
      
      res.json({
        success: true,
        data: topStudents,
        source: 'database'
      });
    } catch (error) {
      console.error('Error getting top group A students:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while getting top students'
      });
    }
  }
}