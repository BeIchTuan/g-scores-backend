import { IStudentRepository } from '../../application/interfaces/IStudentRepository';
import { Student } from '../../domain/entities/student';
import { StudentModel } from '../database/mongoose/models/student.model';
import { PipelineStage } from 'mongoose';
import { ScoreLevel, ScoreLevelStats } from '../../domain/value-objects/score-level';

export class StudentRepository implements IStudentRepository {
  async findById(sbd: string): Promise<Student | null> {
    if (!sbd || typeof sbd !== 'string') {
      return null;
    }

    const student = await StudentModel.findOne({ sbd })
      .lean()
      .exec();

    return student ? this.toEntity(student) : null;
  }

  async findAll(page = 1, limit = 10): Promise<Student[]> {
    const skip = (page - 1) * limit;
    const students = await StudentModel.find()
      .skip(skip)
      .limit(limit)
      .lean();
    return students.map(this.toEntity);
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
    const projection = Object.fromEntries(subjects.map(subject => [subject, 1]));
    projection['sbd'] = 1;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          $and: subjects.map(subject => ({ [subject]: { $ne: null } }))
        }
      },
      {
        $project: {
          sbd: 1,
          ...Object.fromEntries(subjects.map(subject => [subject, 1]))
        }
      },
      {
        $addFields: {
          averageScore: {
            $avg: subjects.map(subject => ({
              $cond: [{ $ne: [`$${subject}`, null] }, `$${subject}`, "$$REMOVE"]
            }))
          }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: limit }
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

    const pipelines = subjects.map(subject => [
      {
        $match: { [subject]: { $ne: null } }
      },
      {
        $bucket: {
          groupBy: `$${subject}`,
          boundaries: [0, 4, 6, 8, 10.1],
          default: 'invalid',
          output: {
            count: { $sum: 1 }
          }
        }
      },
      {
        $project: {
          _id: 0,
          subject: { $literal: subject },
          level: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: ScoreLevel.BELOW_AVERAGE },
                { case: { $eq: ['$_id', 4] }, then: ScoreLevel.AVERAGE },
                { case: { $eq: ['$_id', 6] }, then: ScoreLevel.GOOD },
                { case: { $eq: ['$_id', 8] }, then: ScoreLevel.EXCELLENT }
              ],
              default: 'invalid'
            }
          },
          count: '$count'
        }
      },
      { $match: { level: { $ne: 'invalid' } } }
    ]);

    const results = await Promise.all(
      pipelines.map(pipeline => StudentModel.aggregate<{
        subject: string;
        level: ScoreLevel;
        count: number;
      }>(pipeline).exec())
    );

    const stats: ScoreLevelStats[] = subjects.map(subject => {
      const subjectResults = results.find(r => r[0]?.subject === subject) || [];
      const levels = {
        [ScoreLevel.EXCELLENT]: 0,
        [ScoreLevel.GOOD]: 0,
        [ScoreLevel.AVERAGE]: 0,
        [ScoreLevel.BELOW_AVERAGE]: 0
      };
      let total = 0;

      subjectResults.forEach(result => {
        levels[result.level] = result.count;
        total += result.count;
      });

      return { subject, levels, total };
    });

    return stats;
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