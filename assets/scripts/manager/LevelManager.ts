import { GAME_CONFIG, RESOURCE_PATHS, STORAGE_KEYS } from "../core/Constants";
import { LevelConfig } from "../game/GameTypes";
import ResourceManager from "./ResourceManager";

export default class LevelManager {
  private static levels: LevelConfig[] = [];
  private static currentIndex: number = 0;

  public static load(callback: (level: LevelConfig) => void): void {
    ResourceManager.loadJson(RESOURCE_PATHS.LEVELS, function (data: any | null) {
      if (data && data.levels && data.levels.length > 0) {
        LevelManager.levels = data.levels;
      } else {
        LevelManager.levels = [LevelManager.getFallbackLevel()];
      }

      var saved = parseInt(cc.sys.localStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL) || "1", 10);
      LevelManager.currentIndex = Math.max(0, Math.min(LevelManager.levels.length - 1, saved - 1));
      callback(LevelManager.getCurrentLevel());
    });
  }

  public static getCurrentLevel(): LevelConfig {
    if (LevelManager.levels.length === 0) {
      return LevelManager.getFallbackLevel();
    }
    return LevelManager.levels[LevelManager.currentIndex];
  }

  public static nextLevel(): LevelConfig {
    if (LevelManager.levels.length === 0) {
      LevelManager.levels = [LevelManager.getFallbackLevel()];
    }
    LevelManager.currentIndex = Math.min(LevelManager.currentIndex + 1, LevelManager.levels.length - 1);
    cc.sys.localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, String(LevelManager.getCurrentLevel().id));
    return LevelManager.getCurrentLevel();
  }

  public static resetProgress(): LevelConfig {
    LevelManager.currentIndex = 0;
    cc.sys.localStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, "1");
    return LevelManager.getCurrentLevel();
  }

  public static getFallbackLevel(): LevelConfig {
    return {
      id: 1,
      name: "默认关卡",
      rows: GAME_CONFIG.ROWS,
      cols: GAME_CONFIG.COLS,
      tileTypes: GAME_CONFIG.TILE_TYPES,
      targetScore: GAME_CONFIG.DEFAULT_TARGET_SCORE,
      moveLimit: GAME_CONFIG.DEFAULT_MOVE_LIMIT
    };
  }
}
