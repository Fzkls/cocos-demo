export default class Logger {
  public static enabled: boolean = true;

  public static log(tag: string, message: string, data?: any): void {
    if (!Logger.enabled) {
      return;
    }
    if (data !== undefined) {
      cc.log("[" + tag + "] " + message, data);
      return;
    }
    cc.log("[" + tag + "] " + message);
  }

  public static warn(tag: string, message: string, data?: any): void {
    if (!Logger.enabled) {
      return;
    }
    if (data !== undefined) {
      cc.warn("[" + tag + "] " + message, data);
      return;
    }
    cc.warn("[" + tag + "] " + message);
  }

  public static error(tag: string, message: string, data?: any): void {
    if (data !== undefined) {
      cc.error("[" + tag + "] " + message, data);
      return;
    }
    cc.error("[" + tag + "] " + message);
  }
}
