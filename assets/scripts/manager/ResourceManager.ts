export default class ResourceManager {
  private static cache: { [key: string]: any } = {};

  public static loadJson(path: string, callback: (data: any | null) => void): void {
    if (ResourceManager.cache[path]) {
      callback(ResourceManager.cache[path]);
      return;
    }

    cc.resources.load(path, cc.JsonAsset, function (err: Error | null, asset: cc.JsonAsset) {
      if (err || !asset) {
        cc.warn("[ResourceManager] load json failed: " + path, err);
        callback(null);
        return;
      }
      ResourceManager.cache[path] = asset.json;
      callback(asset.json);
    });
  }

  public static loadSpriteFrame(path: string, callback: (frame: cc.SpriteFrame | null) => void): void {
    if (ResourceManager.cache[path]) {
      callback(ResourceManager.cache[path]);
      return;
    }

    cc.resources.load(path, cc.SpriteFrame, function (err: Error | null, frame: cc.SpriteFrame) {
      if (err || !frame) {
        callback(null);
        return;
      }
      ResourceManager.cache[path] = frame;
      callback(frame);
    });
  }

  public static loadAudio(path: string, callback: (clip: cc.AudioClip | null) => void): void {
    if (ResourceManager.cache[path]) {
      callback(ResourceManager.cache[path]);
      return;
    }

    cc.resources.load(path, cc.AudioClip, function (err: Error | null, clip: cc.AudioClip) {
      if (err || !clip) {
        callback(null);
        return;
      }
      ResourceManager.cache[path] = clip;
      callback(clip);
    });
  }

  public static release(path: string): void {
    var asset = ResourceManager.cache[path];
    if (!asset) {
      return;
    }
    cc.resources.release(path);
    delete ResourceManager.cache[path];
  }

  public static releaseAll(): void {
    for (var key in ResourceManager.cache) {
      if (ResourceManager.cache.hasOwnProperty(key)) {
        cc.resources.release(key);
      }
    }
    ResourceManager.cache = {};
  }
}
