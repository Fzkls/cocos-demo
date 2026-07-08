import { STORAGE_KEYS } from "../core/Constants";

export default class StorageManager {
  public static getHighScore(): number {
    var value = cc.sys.localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    if (!value) {
      return 0;
    }
    var parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  public static saveHighScore(score: number): void {
    cc.sys.localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(score));
  }
}
