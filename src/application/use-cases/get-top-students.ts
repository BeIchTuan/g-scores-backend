import { IStudentRepository } from '../interfaces/IStudentRepository';
import { Student } from '../../domain/entities/student';

export class GetTopStudents {
  constructor(private studentRepo: IStudentRepository) {}

  async executeGroupA(limit: number = 10): Promise<Student[]> {
    const subjects: (keyof Student)[] = ['toan', 'vat_li', 'hoa_hoc'];
    return this.studentRepo.findTopStudents(limit, subjects);
  }
}