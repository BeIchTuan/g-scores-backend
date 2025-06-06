import { IStudentRepository } from '../interfaces/IStudentRepository';
import { GetStudentScoreOutputModel } from './get-student-score.output';

export class GetStudentScore {
  constructor(private studentRepo: IStudentRepository) { }

  async execute(registrationNumber: string): Promise<GetStudentScoreOutputModel | null> {
    const student = await this.studentRepo.findById(registrationNumber);
    if (!student) return null;

    return {
      sbd: student.sbd,
      toan: student.toan,
      ngu_van: student.ngu_van,
      ngoai_ngu: student.ngoai_ngu,
      ma_ngoai_ngu: student.ma_ngoai_ngu,
      vat_li: student.vat_li,
      hoa_hoc: student.hoa_hoc,
      sinh_hoc: student.sinh_hoc,
      lich_su: student.lich_su,
      dia_li: student.dia_li,
      gdcd: student.gdcd
    };
  }
}