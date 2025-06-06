import { Request, Response } from 'express';
import { GetStudentScore } from '../../application/use-cases/get-student-scores';
import { StudentRepository } from '../repositories/student.repository';
import { StudentScoreViewModel } from '../../presentation/ViewModels/student-score.viewmodel';
import { StudentScoreViewModelMapper } from '../../presentation/Mappers/student-score.mapper';

export class StudentController {
  private getStudentScore: GetStudentScore;

  constructor() {
    const studentRepo = new StudentRepository();
    this.getStudentScore = new GetStudentScore(studentRepo);
  }

  async getScore(req: Request, res: Response): Promise<void> {
    const { registrationNumber } = req.params;

    try {
      const outputModel = await this.getStudentScore.execute(registrationNumber);

      if (!outputModel) {
        res.status(404).json({ 
          success: false,
          message: 'No student found with the provided registration number' 
        });
        return;
      }

      const viewModel: StudentScoreViewModel = StudentScoreViewModelMapper.toViewModel(outputModel);

      res.json({
        success: true,
        data: viewModel
      });
    } catch (error) {
      console.error('Error fetching student scores:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching student scores' 
      });
    }
  }
}
