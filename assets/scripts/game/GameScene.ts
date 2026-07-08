import EventBus from "../core/EventBus";
import { GAME_EVENTS } from "../core/Constants";
import AudioManager from "../manager/AudioManager";
import LevelManager from "../manager/LevelManager";
import StorageManager from "../manager/StorageManager";
import UIManager from "../ui/UIManager";
import { GameOverPayload, GoalPayload, LevelConfig } from "./GameTypes";
import Match3Board from "./Match3Board";

const { ccclass } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
  private scoreLabel: cc.Label | null = null;
  private highScoreLabel: cc.Label | null = null;
  private movesLabel: cc.Label | null = null;
  private levelLabel: cc.Label | null = null;
  private goalLabel: cc.Label | null = null;
  private boardNode: cc.Node | null = null;
  private board: Match3Board | null = null;
  private score: number = 0;
  private highScore: number = 0;

  protected onLoad(): void {
    this.highScore = StorageManager.getHighScore();
    AudioManager.preload();
    this.createBackground();
    this.createHeader();
    this.createRestartButton();
    this.bindEvents();
    this.refreshScore(0, 0);
    this.refreshMoves(0, 0, 0);
    this.loadLevelAndStart();
  }

  protected onDestroy(): void {
    EventBus.off(GAME_EVENTS.SCORE_CHANGED, this.onScoreChanged, this);
    EventBus.off(GAME_EVENTS.MOVES_CHANGED, this.onMovesChanged, this);
    EventBus.off(GAME_EVENTS.GOAL_CHANGED, this.onGoalChanged, this);
    EventBus.off(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
    EventBus.off(GAME_EVENTS.TOAST, this.onToast, this);
  }

  private bindEvents(): void {
    EventBus.on(GAME_EVENTS.SCORE_CHANGED, this.onScoreChanged, this);
    EventBus.on(GAME_EVENTS.MOVES_CHANGED, this.onMovesChanged, this);
    EventBus.on(GAME_EVENTS.GOAL_CHANGED, this.onGoalChanged, this);
    EventBus.on(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
    EventBus.on(GAME_EVENTS.TOAST, this.onToast, this);
  }

  private loadLevelAndStart(): void {
    UIManager.showLoading(this.node, "加载关卡...");
    LevelManager.load((level: LevelConfig) => {
      UIManager.hideLoading();
      this.createBoard(level);
    });
  }

  private createBackground(): void {
    var bg = new cc.Node("Background");
    bg.parent = this.node;
    bg.width = 750;
    bg.height = 1334;
    var graphics = bg.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(28, 35, 54, 255);
    graphics.rect(-bg.width / 2, -bg.height / 2, bg.width, bg.height);
    graphics.fill();
  }

  private createHeader(): void {
    var title = this.createLabel("消消乐 Demo", 42, cc.v2(0, 585));
    title.node.color = new cc.Color(255, 255, 255, 255);

    this.levelLabel = this.createLabel("Level 1", 24, cc.v2(0, 535));
    this.scoreLabel = this.createLabel("Score: 0", 26, cc.v2(-220, 490));
    this.highScoreLabel = this.createLabel("Best: " + this.highScore, 26, cc.v2(220, 490));
    this.goalLabel = this.createLabel("Goal: 0", 24, cc.v2(-220, 450));
    this.movesLabel = this.createLabel("Moves: 0", 24, cc.v2(220, 450));
  }

  private createBoard(level: LevelConfig): void {
    if (this.boardNode && cc.isValid(this.boardNode)) {
      this.boardNode.destroy();
    }
    this.boardNode = new cc.Node("Board");
    this.boardNode.parent = this.node;
    this.boardNode.setPosition(0, -5);
    this.board = this.boardNode.addComponent(Match3Board);
    this.board.configure(level);
  }

  private createRestartButton(): void {
    var button = new cc.Node("RestartButton");
    button.parent = this.node;
    button.width = 220;
    button.height = 70;
    button.setPosition(0, -585);

    var graphics = button.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(64, 124, 255, 255);
    graphics.rect(-110, -35, 220, 70);
    graphics.fill();

    var labelNode = new cc.Node("Label");
    labelNode.parent = button;
    var label = labelNode.addComponent(cc.Label);
    label.string = "重新开始";
    label.fontSize = 28;
    label.lineHeight = 32;
    labelNode.color = cc.Color.WHITE;

    button.on(cc.Node.EventType.TOUCH_END, this.handleRestart, this);
  }

  private createLabel(text: string, fontSize: number, position: cc.Vec2): cc.Label {
    var node = new cc.Node(text);
    node.parent = this.node;
    node.setPosition(position);
    var label = node.addComponent(cc.Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    node.color = cc.Color.WHITE;
    return label;
  }

  private handleRestart(): void {
    AudioManager.playClick();
    if (this.board) {
      this.board.restart();
    }
  }

  private onGoalChanged(payload?: GoalPayload): void {
    if (!payload || !payload.level) {
      return;
    }
    var level = payload.level;
    if (this.levelLabel) {
      this.levelLabel.string = "Level " + level.id + " - " + level.name;
    }
    if (this.goalLabel) {
      this.goalLabel.string = "Goal: " + level.targetScore;
    }
  }

  private onScoreChanged(payload?: any): void {
    var nextScore = payload && typeof payload.score === "number" ? payload.score : 0;
    var targetScore = payload && typeof payload.targetScore === "number" ? payload.targetScore : 0;
    this.refreshScore(nextScore, targetScore);
  }

  private onMovesChanged(payload?: any): void {
    var moves = payload && typeof payload.moves === "number" ? payload.moves : 0;
    var movesLeft = payload && typeof payload.movesLeft === "number" ? payload.movesLeft : 0;
    var moveLimit = payload && typeof payload.moveLimit === "number" ? payload.moveLimit : 0;
    this.refreshMoves(moves, movesLeft, moveLimit);
  }

  private onToast(message?: any): void {
    UIManager.showToast(this.node, String(message || ""));
  }

  private onGameOver(payload?: GameOverPayload): void {
    var win = !!(payload && payload.win);
    var score = payload ? payload.score : this.score;
    var target = payload ? payload.targetScore : 0;
    var title = win ? "过关成功" : "挑战失败";
    var message = win ? "得分 " + score + " / 目标 " + target : "得分 " + score + " / 目标 " + target;
    var button = win ? "下一关" : "再试一次";

    UIManager.showPopup(this.node, title, message, button, () => {
      AudioManager.playClick();
      if (win) {
        this.createBoard(LevelManager.nextLevel());
      } else if (this.board) {
        this.board.restart();
      }
    });
  }

  private refreshScore(score: number, targetScore: number): void {
    this.score = score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      StorageManager.saveHighScore(this.highScore);
    }
    if (this.scoreLabel) {
      this.scoreLabel.string = "Score: " + this.score;
    }
    if (this.highScoreLabel) {
      this.highScoreLabel.string = "Best: " + this.highScore;
    }
    if (this.goalLabel && targetScore > 0) {
      this.goalLabel.string = "Goal: " + targetScore;
    }
  }

  private refreshMoves(moves: number, movesLeft: number, moveLimit: number): void {
    if (this.movesLabel) {
      if (moveLimit > 0) {
        this.movesLabel.string = "Moves: " + movesLeft + "/" + moveLimit;
      } else {
        this.movesLabel.string = "Moves: " + moves;
      }
    }
  }
}
