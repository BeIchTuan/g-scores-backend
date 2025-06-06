import { IStudentRepository } from '../../application/interfaces/IStudentRepository';
import { Student } from '../../domain/entities/student';
import { StudentModel } from '../database/mongoose/models/student.model';
import { PipelineStage } from 'mongoose';
import { ScoreLevel, ScoreLevelStats } from '../../domain/value-objects/score-level';

export class StudentRepository implements IStudentRepository {
  async findById(sbd: string): Promise<Student | null> {
    const student = await StudentModel.findOne({ sbd });
    if (!student) return null;
    return this.toEntity(student);
  }

  async findAll(page = 1, limit = 10): Promise<Student[]> {
    const skip = (page - 1) * limit;
    const students = await StudentModel.find()
      .skip(skip)
      .limit(limit)
      .lean();
    return students.map(this.toEntity);
  }

  async create(student: Student): Promise<Student> {
    const created = await StudentModel.create(student);
    return this.toEntity(created);
  }

  async update(sbd: string, student: Partial<Student>): Promise<Student | null> {
    const updated = await StudentModel.findOneAndUpdate(
      { sbd },
      { $set: student },
      { new: true }
    );
    if (!updated) return null;
    return this.toEntity(updated);
  }

  async delete(sbd: string): Promise<boolean> {
    const result = await StudentModel.deleteOne({ sbd });
    return result.deletedCount > 0;
  }

  async findByScoreRange(subject: keyof Student, min: number, max: number): Promise<Student[]> {
    const students = await StudentModel.find({
      [subject]: { $gte: min, $lte: max }
    }).lean();
    return students.map(this.toEntity);
  }
  async findTopStudents(limit: number, subjects: (keyof Student)[]): Promise<Student[]> {
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          averageScore: {
            $avg: {
              $filter: {
                input: subjects.map(subject => `$${subject}`),
                as: "score",
                cond: { $ne: ["$$score", null] }
              }
            }
          }
        }
      },
      { 
        $sort: { averageScore: -1 } as Record<string, 1 | -1>
      },
      { 
        $limit: limit 
      }
    ];

    const students = await StudentModel.aggregate<Student>(pipeline);
    return students.map(this.toEntity);
  }

  async getAverageScores(): Promise<{ [key: string]: number }> {
    const pipeline = [
      {
        $group: {
          _id: null,
          toan: { $avg: '$toan' },
          ngu_van: { $avg: '$ngu_van' },
          ngoai_ngu: { $avg: '$ngoai_ngu' },
          vat_li: { $avg: '$vat_li' },
          hoa_hoc: { $avg: '$hoa_hoc' },
          sinh_hoc: { $avg: '$sinh_hoc' },
          lich_su: { $avg: '$lich_su' },
          dia_li: { $avg: '$dia_li' },
          gdcd: { $avg: '$gdcd' }
        }
      }
    ];

    const [result] = await StudentModel.aggregate(pipeline);
    delete result._id;
    return result;
  }

  async getStudentCount(): Promise<number> {
    return StudentModel.countDocuments();
  }

  async searchByFilters(filters: {
    sbd?: string;
    ma_ngoai_ngu?: string;
    minScore?: { [key: string]: number };
    maxScore?: { [key: string]: number };
  }): Promise<Student[]> {
    const query: any = {};

    if (filters.sbd) {
      query.sbd = { $regex: filters.sbd, $options: 'i' };
    }

    if (filters.ma_ngoai_ngu) {
      query.ma_ngoai_ngu = filters.ma_ngoai_ngu;
    }

    if (filters.minScore) {
      Object.entries(filters.minScore).forEach(([subject, score]) => {
        query[subject] = query[subject] || {};
        query[subject].$gte = score;
      });
    }

    if (filters.maxScore) {
      Object.entries(filters.maxScore).forEach(([subject, score]) => {
        query[subject] = query[subject] || {};
        query[subject].$lte = score;
      });
    }

    const students = await StudentModel.find(query).lean();
    return students.map(this.toEntity);
  }

  async getScoreLevelStatistics(): Promise<ScoreLevelStats[]> {
    const subjects = ['toan', 'ngu_van', 'ngoai_ngu', 'vat_li', 'hoa_hoc', 'sinh_hoc', 'lich_su', 'dia_li', 'gdcd'];
    
    const pipeline: PipelineStage[] = [
      {
        $project: {
          _id: 0,
          scores: subjects.map(subject => ({
            subject,
            score: `$${subject}`
          }))
        }
      },
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$scores.subject',
          excellent: {
            $sum: {
              $cond: [{ $and: [
                { $gte: ['$scores.score', 8] },
                { $ne: ['$scores.score', null] }
              ]}, 1, 0]
            }
          },
          good: {
            $sum: {
              $cond: [{ $and: [
                { $gte: ['$scores.score', 6] },
                { $lt: ['$scores.score', 8] },
                { $ne: ['$scores.score', null] }
              ]}, 1, 0]
            }
          },
          average: {
            $sum: {
              $cond: [{ $and: [
                { $gte: ['$scores.score', 4] },
                { $lt: ['$scores.score', 6] },
                { $ne: ['$scores.score', null] }
              ]}, 1, 0]
            }
          },
          belowAverage: {
            $sum: {
              $cond: [{ $and: [
                { $lt: ['$scores.score', 4] },
                { $ne: ['$scores.score', null] }
              ]}, 1, 0]
            }
          },
          total: {
            $sum: { $cond: [{ $ne: ['$scores.score', null] }, 1, 0] }
          }
        }
      }
    ];

    const results = await StudentModel.aggregate<{
      _id: string;
      excellent: number;
      good: number;
      average: number;
      belowAverage: number;
      total: number;
    }>(pipeline);

    return results.map(result => ({
      subject: result._id,
      levels: {
        [ScoreLevel.EXCELLENT]: result.excellent,
        [ScoreLevel.GOOD]: result.good,
        [ScoreLevel.AVERAGE]: result.average,
        [ScoreLevel.BELOW_AVERAGE]: result.belowAverage
      },
      total: result.total
    }));
  }

  async getTopGroupAStudents(limit: number): Promise<Student[]> {
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          groupAAverage: {
            $avg: {
              $filter: {
                input: ['$toan', '$vat_li', '$hoa_hoc'],
                as: 'score',
                cond: { $ne: ['$$score', null] }
              }
            }
          }
        }
      },
      {
        $match: {
          groupAAverage: { $ne: null }
        }
      },
      {
        $sort: { groupAAverage: -1 } as Record<string, 1 | -1>
      },
      {
        $limit: limit
      }
    ];

    const students = await StudentModel.aggregate<Student>(pipeline);
    return students.map(this.toEntity);
  }

  private toEntity(doc: any): Student {
    return new Student(
      doc.sbd,
      doc.toan,
      doc.ngu_van,
      doc.ngoai_ngu,
      doc.ma_ngoai_ngu,
      doc.vat_li,
      doc.hoa_hoc,
      doc.sinh_hoc,
      doc.lich_su,
      doc.dia_li,
      doc.gdcd
    );
  }
}