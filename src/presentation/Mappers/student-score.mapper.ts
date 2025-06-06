import { GetStudentScoreOutputModel } from '../../application/use-cases/get-student-score.output';
import { StudentScoreViewModel } from '../ViewModels/student-score.viewmodel';

export class StudentScoreViewModelMapper {
  static toViewModel(data: GetStudentScoreOutputModel): StudentScoreViewModel {
    return {
      sbd: data.sbd,
      toan: data.toan,
      ngu_van: data.ngu_van,
      ngoai_ngu: data.ngoai_ngu,
      ma_ngoai_ngu: data.ma_ngoai_ngu,
      vat_li: data.vat_li,
      hoa_hoc: data.hoa_hoc,
      sinh_hoc: data.sinh_hoc,
      lich_su: data.lich_su,
      dia_li: data.dia_li,
      gdcd: data.gdcd
    };
  }
}
