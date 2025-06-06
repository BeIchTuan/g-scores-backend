export enum ScoreLevel {
  EXCELLENT = 'EXCELLENT',    // >= 8
  GOOD = 'GOOD',             // >= 6 && < 8
  AVERAGE = 'AVERAGE',       // >= 4 && < 6
  BELOW_AVERAGE = 'BELOW_AVERAGE'  // < 4
}

export interface ScoreLevelStats {
  subject: string;
  levels: {
    [ScoreLevel.EXCELLENT]: number;
    [ScoreLevel.GOOD]: number;
    [ScoreLevel.AVERAGE]: number;
    [ScoreLevel.BELOW_AVERAGE]: number;
  };
  total: number;
}
