import { RESOURCE_PATHS } from "../core/Constants";
import ResourceManager from "./ResourceManager";

export default class AudioManager {
  private static musicId: number = -1;
  private static clips: { [name: string]: cc.AudioClip | null } = {};
  private static enabled: boolean = true;

  public static preload(): void {
    var names = ["click", "swap", "match", "special", "shuffle", "fail", "win", "lose"];
    for (var i = 0; i < names.length; i++) {
      AudioManager.loadEffect(names[i]);
    }
  }

  public static setEnabled(enabled: boolean): void {
    AudioManager.enabled = enabled;
  }

  public static loadEffect(name: string): void {
    var path = RESOURCE_PATHS.AUDIO_PREFIX + name;
    ResourceManager.loadAudio(path, function (clip: cc.AudioClip | null) {
      AudioManager.clips[name] = clip;
    });
  }

  public static playNamed(name: string): void {
    if (!AudioManager.enabled) {
      return;
    }

    var clip = AudioManager.clips[name];
    if (clip) {
      cc.audioEngine.playEffect(clip, false);
      return;
    }

    AudioManager.playToneByName(name);
  }

  public static playClick(): void {
    AudioManager.playNamed("click");
  }

  public static playSwap(): void {
    AudioManager.playNamed("swap");
  }

  public static playMatch(): void {
    AudioManager.playNamed("match");
  }

  public static playSpecial(): void {
    AudioManager.playNamed("special");
  }

  public static playShuffle(): void {
    AudioManager.playNamed("shuffle");
  }

  public static playFail(): void {
    AudioManager.playNamed("fail");
  }

  public static playWin(): void {
    AudioManager.playNamed("win");
  }

  public static playLose(): void {
    AudioManager.playNamed("lose");
  }

  public static playEffect(clip: cc.AudioClip | null): void {
    if (!AudioManager.enabled || !clip) {
      return;
    }
    cc.audioEngine.playEffect(clip, false);
  }

  public static playMusic(clip: cc.AudioClip | null): void {
    if (!AudioManager.enabled || !clip) {
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

  private static playToneByName(name: string): void {
    var map: { [name: string]: number[] } = {
      click: [520, 0.04],
      swap: [620, 0.06],
      match: [760, 0.08],
      special: [980, 0.12],
      shuffle: [360, 0.12],
      fail: [220, 0.1],
      win: [880, 0.18],
      lose: [180, 0.18]
    };
    var item = map[name] || [440, 0.05];
    AudioManager.playTone(item[0], item[1]);
  }

  private static playTone(frequency: number, duration: number): void {
    var globalObj: any = typeof window !== "undefined" ? window : null;
    if (!globalObj) {
      return;
    }

    var AudioContextClass = globalObj.AudioContext || globalObj.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    var context = new AudioContextClass();
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}
