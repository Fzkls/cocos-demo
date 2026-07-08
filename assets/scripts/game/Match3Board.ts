import EventBus from "../core/EventBus";
import { GAME_CONFIG, GAME_EVENTS } from "../core/Constants";
import AudioManager from "../manager/AudioManager";
import Match3Model from "./Match3Model";
import Tile from "./Tile";
import { LevelConfig, MatchGroup, MatchPosition, TileCell } from "./GameTypes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Match3Board extends cc.Component {
  @property
  public rows: number = GAME_CONFIG.ROWS;

  @property
  public cols: number = GAME_CONFIG.COLS;

  @property
  public tileTypes: number = GAME_CONFIG.TILE_TYPES;

  @property
  public tileSize: number = GAME_CONFIG.TILE_SIZE;

  @property
  public tileGap: number = GAME_CONFIG.TILE_GAP;

  private model: Match3Model | null = null;
  private boardRoot: cc.Node | null = null;
  private tileViews: { [id: string]: Tile } = {};
  private selectedTile: Tile | null = null;
  private inputLocked: boolean = false;
  private score: number = 0;
  private moves: number = 0;
  private moveLimit: number = GAME_CONFIG.DEFAULT_MOVE_LIMIT;
  private targetScore: number = GAME_CONFIG.DEFAULT_TARGET_SCORE;
  private level: LevelConfig | null = null;
  private gameOver: boolean = false;

  protected onLoad(): void {
    this.node.name = "Match3Board";
  }

  public configure(level: LevelConfig): void {
    this.level = level;
    this.rows = level.rows;
    this.cols = level.cols;
    this.tileTypes = level.tileTypes;
    this.targetScore = level.targetScore;
    this.moveLimit = level.moveLimit;
    this.restart();
  }

  public restart(): void {
    this.clearTiles();
    this.score = 0;
    this.moves = 0;
    this.selectedTile = null;
    this.inputLocked = false;
    this.gameOver = false;
    this.initBoard();
    EventBus.emit(GAME_EVENTS.GAME_RESET);
    this.emitGoal();
    this.emitScore();
    this.emitMoves();
  }

  private initBoard(): void {
    if (!this.boardRoot) {
      this.boardRoot = new cc.Node("BoardRoot");
      this.boardRoot.parent = this.node;
    }
    this.model = new Match3Model(this.rows, this.cols, this.tileTypes);
    this.createAllTiles();
  }

  private createAllTiles(): void {
    if (!this.model) {
      return;
    }

    var cells = this.model.getCells();
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var view = this.ensureTileView(cell);
      view.node.setPosition(this.getTilePosition(cell.row, cell.col));
      view.node.scale = 1;
      view.node.opacity = 255;
    }
  }

  private ensureTileView(cell: TileCell): Tile {
    var view = this.tileViews[cell.id];
    if (!view) {
      var tileNode = new cc.Node(cell.id);
      tileNode.parent = this.boardRoot;
      var spawnPos = this.getTilePosition(cell.row, cell.col);
      tileNode.setPosition(spawnPos.x, spawnPos.y + 120);
      view = tileNode.addComponent(Tile);
      this.tileViews[cell.id] = view;
      view.init(cell, this.tileSize, this.handleTileTap.bind(this));
      view.playSpawn();
      return view;
    }

    view.init(cell, this.tileSize, this.handleTileTap.bind(this));
    return view;
  }

  private handleTileTap(tile: Tile): void {
    if (this.inputLocked || this.gameOver || !tile.cell || !this.model) {
      return;
    }

    AudioManager.playClick();

    if (!this.selectedTile) {
      this.selectTile(tile);
      return;
    }

    if (this.selectedTile === tile) {
      this.clearSelection();
      return;
    }

    var first = this.selectedTile.cell;
    var second = tile.cell;
    if (!first || !second) {
      this.clearSelection();
      return;
    }

    if (!this.model.isAdjacent(first, second)) {
      this.clearSelection();
      this.selectTile(tile);
      return;
    }

    this.trySwap(first, second);
  }

  private selectTile(tile: Tile): void {
    this.clearSelection();
    this.selectedTile = tile;
    tile.setSelected(true);
  }

  private clearSelection(): void {
    if (this.selectedTile) {
      this.selectedTile.setSelected(false);
    }
    this.selectedTile = null;
  }

  private trySwap(first: TileCell, second: TileCell): void {
    if (!this.model || this.moves >= this.moveLimit) {
      return;
    }

    this.inputLocked = true;
    this.clearSelection();
    var hasSpecial = first.kind !== "normal" || second.kind !== "normal";
    this.model.swap(first, second);
    AudioManager.playSwap();

    this.syncAllTiles(true, () => {
      if (!this.model) {
        return;
      }

      if (hasSpecial) {
        var specialPositions = this.model.collectSpecialRemoval(first, second);
        if (specialPositions.length > 0) {
          this.consumeMove();
          AudioManager.playSpecial();
          this.removePositionsAndContinue(specialPositions);
          return;
        }
      }

      var groups = this.model.findMatchGroups();
      if (groups.length === 0) {
        this.model.swap(first, second);
        this.syncAllTiles(true, () => {
          this.inputLocked = false;
          AudioManager.playFail();
          EventBus.emit(GAME_EVENTS.TOAST, "没有可消除的组合");
        });
        return;
      }

      this.consumeMove();
      this.processMatchGroups(groups, { row: first.row, col: first.col }, true);
    });
  }

  private consumeMove(): void {
    this.moves += 1;
    this.emitMoves();
  }

  private processMatchGroups(groups: MatchGroup[], preferred: MatchPosition | null, allowSpecial: boolean): void {
    if (!this.model) {
      this.inputLocked = false;
      return;
    }

    if (groups.length === 0) {
      this.afterBoardSettled();
      return;
    }

    var removed = this.model.removeMatchGroups(groups, preferred, allowSpecial);
    this.addScore(removed.length * GAME_CONFIG.BASE_SCORE);
    this.playRemoveTiles(removed, () => {
      if (!this.model) {
        return;
      }
      this.model.collapseAndRefill();
      this.syncAllTiles(true, () => {
        this.scheduleOnce(() => {
          this.processMatches(false);
        }, GAME_CONFIG.REMOVE_DELAY);
      });
    });
  }

  private processMatches(allowSpecial: boolean): void {
    if (!this.model) {
      this.inputLocked = false;
      return;
    }

    var groups = this.model.findMatchGroups();
    if (groups.length === 0) {
      this.afterBoardSettled();
      return;
    }

    this.processMatchGroups(groups, null, allowSpecial);
  }

  private removePositionsAndContinue(positions: MatchPosition[]): void {
    if (!this.model) {
      this.inputLocked = false;
      return;
    }

    var removed = this.model.removePositions(positions);
    this.addScore(removed.length * GAME_CONFIG.BASE_SCORE);
    this.playRemoveTiles(removed, () => {
      if (!this.model) {
        return;
      }
      this.model.collapseAndRefill();
      this.syncAllTiles(true, () => {
        this.scheduleOnce(() => {
          this.processMatches(false);
        }, GAME_CONFIG.REMOVE_DELAY);
      });
    });
  }

  private afterBoardSettled(): void {
    if (!this.model) {
      this.inputLocked = false;
      return;
    }

    if (!this.model.hasAvailableMove()) {
      EventBus.emit(GAME_EVENTS.TOAST, "没有可移动组合，已自动洗牌");
      AudioManager.playShuffle();
      this.model.shuffleUntilPlayable();
      this.syncAllTiles(true, () => {
        this.finishTurn();
      });
      return;
    }

    this.finishTurn();
  }

  private finishTurn(): void {
    this.inputLocked = false;
    if (this.score >= this.targetScore) {
      this.gameOver = true;
      AudioManager.playWin();
      EventBus.emit(GAME_EVENTS.GAME_OVER, {
        win: true,
        score: this.score,
        targetScore: this.targetScore
      });
      return;
    }

    if (this.moves >= this.moveLimit) {
      this.gameOver = true;
      AudioManager.playLose();
      EventBus.emit(GAME_EVENTS.GAME_OVER, {
        win: false,
        score: this.score,
        targetScore: this.targetScore
      });
    }
  }

  private addScore(delta: number): void {
    if (delta <= 0) {
      return;
    }
    this.score += delta;
    AudioManager.playMatch();
    this.emitScore();
  }

  private playRemoveTiles(removed: TileCell[], callback: Function): void {
    if (removed.length === 0) {
      callback();
      return;
    }

    var remaining = removed.length;
    var done = () => {
      remaining--;
      if (remaining <= 0) {
        callback();
      }
    };

    for (var i = 0; i < removed.length; i++) {
      var cell = removed[i];
      var view = this.tileViews[cell.id];
      if (!view) {
        done();
        continue;
      }
      delete this.tileViews[cell.id];
      this.playBurstAt(view.node.position);
      this.playRemoveTile(view, done);
    }
  }

  private playRemoveTile(view: Tile, done: Function): void {
    view.playRemove(() => {
      if (view && view.node && cc.isValid(view.node)) {
        view.node.destroy();
      }
      done();
    });
  }

  private playBurstAt(position: cc.Vec2 | cc.Vec3): void {
    if (!this.boardRoot) {
      return;
    }
    for (var i = 0; i < 5; i++) {
      var dot = new cc.Node("BurstDot");
      dot.parent = this.boardRoot;
      dot.width = 8;
      dot.height = 8;
      dot.setPosition(position.x, position.y);
      var g = dot.addComponent(cc.Graphics);
      g.fillColor = new cc.Color(255, 245, 160, 255);
      g.circle(0, 0, 4);
      g.fill();
      var angle = (Math.PI * 2 * i) / 5;
      var target = cc.v2(position.x + Math.cos(angle) * 38, position.y + Math.sin(angle) * 38);
      dot.runAction(cc.sequence(cc.spawn(cc.moveTo(0.22, target), cc.fadeOut(0.22)), cc.removeSelf()));
    }
  }

  private syncAllTiles(animate: boolean, callback?: Function): void {
    if (!this.model) {
      if (callback) {
        callback();
      }
      return;
    }

    var cells = this.model.getCells();
    var remaining = cells.length;
    if (remaining === 0) {
      if (callback) {
        callback();
      }
      return;
    }

    var done = () => {
      remaining--;
      if (remaining <= 0 && callback) {
        callback();
      }
    };

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var view = this.ensureTileView(cell);
      var target = this.getTilePosition(cell.row, cell.col);
      view.node.stopAllActions();
      if (animate) {
        view.node.runAction(
          cc.sequence(
            cc.spawn(
              cc.moveTo(GAME_CONFIG.DROP_DURATION, target).easing(cc.easeSineInOut()),
              cc.scaleTo(0.12, 1)
            ),
            cc.callFunc(function () {
              done();
            })
          )
        );
      } else {
        view.node.setPosition(target);
        view.node.scale = 1;
        view.node.opacity = 255;
        done();
      }
    }
  }

  private emitGoal(): void {
    if (this.level) {
      EventBus.emit(GAME_EVENTS.GOAL_CHANGED, { level: this.level });
    }
  }

  private emitScore(): void {
    EventBus.emit(GAME_EVENTS.SCORE_CHANGED, {
      score: this.score,
      targetScore: this.targetScore
    });
  }

  private emitMoves(): void {
    EventBus.emit(GAME_EVENTS.MOVES_CHANGED, {
      moves: this.moves,
      movesLeft: Math.max(0, this.moveLimit - this.moves),
      moveLimit: this.moveLimit
    });
  }

  private getTilePosition(row: number, col: number): cc.Vec2 {
    var step = this.tileSize + this.tileGap;
    var totalWidth = this.cols * this.tileSize + (this.cols - 1) * this.tileGap;
    var totalHeight = this.rows * this.tileSize + (this.rows - 1) * this.tileGap;
    var x = -totalWidth / 2 + this.tileSize / 2 + col * step;
    var y = totalHeight / 2 - this.tileSize / 2 - row * step;
    return cc.v2(x, y);
  }

  private clearTiles(): void {
    if (this.boardRoot) {
      this.boardRoot.removeAllChildren();
    }
    this.tileViews = {};
  }
}
