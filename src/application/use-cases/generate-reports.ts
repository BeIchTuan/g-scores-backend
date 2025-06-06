import { IStudentRepository } from '../interfaces/IStudentRepository';
import { ScoreLevelStats } from '../../domain/value-objects/score-level';

export class GenerateReports {
  constructor(private studentRepo: IStudentRepository) {}

  async generateScoreLevelStatistics(): Promise<ScoreLevelStats[]> {
    return this.studentRepo.getScoreLevelStatistics();
  }

  async generateAverageScores(): Promise<{ [subject: string]: number }> {
    return this.studentRepo.getAverageScores();
  }
}