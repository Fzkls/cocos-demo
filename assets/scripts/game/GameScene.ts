import EventBus from "../core/EventBus";
import { GAME_EVENTS } from "../core/Constants";
import StorageManager from "../manager/StorageManager";
import Match3Board from "./Match3Board";

const { ccclass } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
  private scoreLabel: cc.Label | null = null;
  private highScoreLabel: cc.Label | null = null;
  private movesLabel: cc.Label | null = null;
  private toastLabel: cc.Label | null = null;
  private board: Match3Board | null = null;
  private score: number = 0;
  private highScore: number = 0;

  protected onLoad(): void {
    this.highScore = StorageManager.getHighScore();
    this.createBackground();
    this.createHeader();
    this.createBoard();
    this.createRestartButton();
    this.createToast();
    this.bindEvents();
    this.refreshScore(0);
    this.refreshMoves(0);
  }

  protected onDestroy(): void {
    EventBus.off(GAME_EVENTS.SCORE_CHANGED, this.onScoreChanged);
    EventBus.off(GAME_EVENTS.MOVES_CHANGED, this.onMovesChanged);
    EventBus.off(GAME_EVENTS.TOAST, this.onToast);
  }

  private bindEvents(): void {
    EventBus.on(GAME_EVENTS.SCORE_CHANGED, this.onScoreChanged);
    EventBus.on(GAME_EVENTS.MOVES_CHANGED, this.onMovesChanged);
    EventBus.on(GAME_EVENTS.TOAST, this.onToast);
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
    var title = this.createLabel("消消乐 Demo", 42, cc.v2(0, 560));
    title.node.color = new cc.Color(255, 255, 255, 255);

    this.scoreLabel = this.createLabel("Score: 0", 28, cc.v2(-210, 500));
    this.highScoreLabel = this.createLabel("Best: " + this.highScore, 28, cc.v2(210, 500));
    this.movesLabel = this.createLabel("Moves: 0", 26, cc.v2(0, 455));
  }

  private createBoard(): void {
    var boardNode = new cc.Node("Board");
    boardNode.parent = this.node;
    boardNode.setPosition(0, 10);
    this.board = boardNode.addComponent(Match3Board);
  }

  private createRestartButton(): void {
    var button = new cc.Node("RestartButton");
    button.parent = this.node;
    button.width = 220;
    button.height = 70;
    button.setPosition(0, -560);

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

    button.on(cc.Node.EventType.TOUCH_END, () => {
      if (this.board) {
        this.board.restart();
      }
    }, this);
  }

  private createToast(): void {
    this.toastLabel = this.createLabel("", 24, cc.v2(0, -485));
    this.toastLabel.node.opacity = 0;
    this.toastLabel.node.color = new cc.Color(255, 230, 120, 255);
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

  private onScoreChanged = (payload?: any): void => {
    var nextScore = payload && typeof payload.score === "number" ? payload.score : 0;
    this.refreshScore(nextScore);
  };

  private onMovesChanged = (payload?: any): void => {
    var moves = payload && typeof payload.moves === "number" ? payload.moves : 0;
    this.refreshMoves(moves);
  };

  private onToast = (message?: any): void => {
    if (!this.toastLabel) {
      return;
    }
    this.toastLabel.string = String(message || "");
    this.toastLabel.node.stopAllActions();
    this.toastLabel.node.opacity = 255;
    this.toastLabel.node.runAction(cc.sequence(cc.delayTime(0.8), cc.fadeOut(0.3)));
  };

  private refreshScore(score: number): void {
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
  }

  private refreshMoves(moves: number): void {
    if (this.movesLabel) {
      this.movesLabel.string = "Moves: " + moves;
    }
  }
}
