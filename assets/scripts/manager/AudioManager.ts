export default class AudioManager {
  private static musicId: number = -1;

  public static playEffect(clip: cc.AudioClip | null): void {
    if (!clip) {
      return;
    }
    cc.audioEngine.playEffect(clip, false);
  }

  public static playMusic(clip: cc.AudioClip | null): void {
    if (!clip) {
      return;
    }
    AudioManager.stopMusic();
    AudioManager.musicId = cc.audioEngine.playMusic(clip, true);
  }

  public static stopMusic(): void {
    if (AudioManager.musicId >= 0) {
      cc.audioEngine.stop(AudioManager.musicId);
      AudioManager.musicId = -1;
    }
  }
}
