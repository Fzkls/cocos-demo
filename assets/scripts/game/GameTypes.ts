export interface MatchPosition {
  row: number;
  col: number;
}

export interface TileCell {
  id: string;
  row: number;
  col: number;
  type: number;
}

export interface ScorePayload {
  score: number;
  highScore: number;
}

export interface MovesPayload {
  moves: number;
}
