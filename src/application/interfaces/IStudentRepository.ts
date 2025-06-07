import { Student } from '../../domain/entities/student';
import { ScoreLevel, ScoreLevelStats } from '../../domain/value-objects/score-level';

export interface IStudentRepository {
  findById(sbd: string): Promise<Student | null>;
  findAll(page?: number, limit?: number): Promise<Student[]>;

  findByScoreRange(subject: keyof Student, min: number, max: number): Promise<Student[]>;
  findTopStudents(limit: number, subjects: (keyof Student)[]): Promise<Student[]>;
    
  getAverageScores(): Promise<{ [key: string]: number }>;
  getStudentCount(): Promise<number>;
  
  searchByFilters(filters: {
    sbd?: string;
    ma_ngoai_ngu?: string;
    minScore?: { [key: string]: number };
    maxScore?: { [key: string]: number };
  }): Promise<Student[]>;

  getScoreLevelStatistics(): Promise<ScoreLevelStats[]>;
}