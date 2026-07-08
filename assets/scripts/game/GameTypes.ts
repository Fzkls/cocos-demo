export type TileKind = "normal" | "row" | "col" | "bomb" | "rainbow";
export type MatchOrientation = "horizontal" | "vertical";

export interface MatchPosition {
  row: number;
  col: number;
}

export interface TileCell {
  id: string;
  row: number;
  col: number;
  type: number;
  kind: TileKind;
}

export interface MatchGroup {
  orientation: MatchOrientation;
  positions: MatchPosition[];
  type: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  rows: number;
  cols: number;
  tileTypes: number;
  targetScore: number;
  moveLimit: number;
}

export interface ScorePayload {
  score: number;
  highScore: number;
  targetScore?: number;
}

export interface MovesPayload {
  moves: number;
  movesLeft: number;
  moveLimit: number;
}

export interface GoalPayload {
  level: LevelConfig;
}

export interface GameOverPayload {
  win: boolean;
  score: number;
  targetScore: number;
}
