export const GAME_CONFIG = {
  ROWS: 8,
  COLS: 8,
  TILE_TYPES: 6,
  TILE_SIZE: 72,
  TILE_GAP: 8,
  SWAP_DURATION: 0.18,
  DROP_DURATION: 0.22,
  REMOVE_DURATION: 0.18,
  REMOVE_DELAY: 0.1,
  SHUFFLE_DURATION: 0.35,
  BASE_SCORE: 10,
  DEFAULT_TARGET_SCORE: 600,
  DEFAULT_MOVE_LIMIT: 25
};

export const GAME_EVENTS = {
  SCORE_CHANGED: "score-changed",
  HIGH_SCORE_CHANGED: "high-score-changed",
  MOVES_CHANGED: "moves-changed",
  GOAL_CHANGED: "goal-changed",
  GAME_OVER: "game-over",
  GAME_RESET: "game-reset",
  TOAST: "toast",
  SHOW_LOADING: "show-loading",
  HIDE_LOADING: "hide-loading",
  SHOW_POPUP: "show-popup"
};

export const STORAGE_KEYS = {
  HIGH_SCORE: "cocos_match3_high_score",
  CURRENT_LEVEL: "cocos_match3_current_level"
};

export const RESOURCE_PATHS = {
  LEVELS: "config/levels",
  TILE_TEXTURE_PREFIX: "textures/tiles/tile_",
  AUDIO_PREFIX: "audio/"
};
