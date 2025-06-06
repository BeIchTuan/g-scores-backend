export enum ScoreLevel {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  BELOW_AVERAGE = 'BELOW_AVERAGE'
}

export interface ScoreLevelStatsOutputModel {
  subject: string;
  levels: {
    [ScoreLevel.EXCELLENT]: number;
    [ScoreLevel.GOOD]: number;
    [ScoreLevel.AVERAGE]: number;
    [ScoreLevel.BELOW_AVERAGE]: number;
  };
  total: number;
}
