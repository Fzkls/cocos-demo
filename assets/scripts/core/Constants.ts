export const GAME_CONFIG = {
  ROWS: 8,
  COLS: 8,
  TILE_TYPES: 6,
  TILE_SIZE: 72,
  TILE_GAP: 8,
  SWAP_DURATION: 0.16,
  REMOVE_DELAY: 0.12,
  BASE_SCORE: 10
};

export const GAME_EVENTS = {
  SCORE_CHANGED: "score-changed",
  HIGH_SCORE_CHANGED: "high-score-changed",
  MOVES_CHANGED: "moves-changed",
  GAME_RESET: "game-reset",
  TOAST: "toast"
};

export const STORAGE_KEYS = {
  HIGH_SCORE: "cocos_match3_high_score"
};
