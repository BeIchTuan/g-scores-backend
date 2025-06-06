import { ScoreLevelStats } from '../../domain/value-objects/score-level';
import { Student } from '../../domain/entities/student';

export interface IReportService {
    getScoreLevelStatistics(): Promise<ScoreLevelStats[]>;
    getAverageScores(): Promise<{ [subject: string]: number }>;

    getTopGroupAStudents(limit: number): Promise<Student[]>;
}