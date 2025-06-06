export class Student {
  constructor(
    public sbd: string,
    public toan: number | null,
    public ngu_van: number | null,
    public ngoai_ngu: number | null,
    public ma_ngoai_ngu: string | null,
    public vat_li: number | null,
    public hoa_hoc: number | null,
    public sinh_hoc: number | null,
    public lich_su: number | null,
    public dia_li: number | null,
    public gdcd: number | null
  ) {}

  calculateAverage(subjects: (keyof Student)[]): number | null {
    const validScores = subjects
      .map(subject => this[subject])
      .filter((score): score is number => score !== null);

    if (validScores.length === 0) return null;
    
    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  }

  getNaturalScienceAverage(): number | null {
    return this.calculateAverage(['vat_li', 'hoa_hoc', 'sinh_hoc']);
  }

  getSocialScienceAverage(): number | null {
    return this.calculateAverage(['lich_su', 'dia_li', 'gdcd']);
  }
}