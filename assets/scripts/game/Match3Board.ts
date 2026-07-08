import EventBus from "../core/EventBus";
import { GAME_CONFIG, GAME_EVENTS } from "../core/Constants";
import Match3Model from "./Match3Model";
import Tile from "./Tile";
import { MatchPosition, TileCell } from "./GameTypes";

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

  protected onLoad(): void {
    this.node.name = "Match3Board";
    this.initBoard();
  }

  public restart(): void {
    this.clearTiles();
    this.score = 0;
    this.moves = 0;
    this.selectedTile = null;
    this.inputLocked = false;
    this.initBoard();
    EventBus.emit(GAME_EVENTS.GAME_RESET);
    EventBus.emit(GAME_EVENTS.SCORE_CHANGED, { score: this.score });
    EventBus.emit(GAME_EVENTS.MOVES_CHANGED, { moves: this.moves });
  }

  private initBoard(): void {
    if (!this.boardRoot) {
      this.boardRoot = new cc.Node("BoardRoot");
      this.boardRoot.parent = this.node;
    }

    this.model = new Match3Model(this.rows, this.cols, this.tileTypes);
    this.createAllTiles();
    EventBus.emit(GAME_EVENTS.SCORE_CHANGED, { score: this.score });
    EventBus.emit(GAME_EVENTS.MOVES_CHANGED, { moves: this.moves });
  }

  private createAllTiles(): void {
    if (!this.model || !this.boardRoot) {
      return;
    }

    var cells = this.model.getCells();
    for (var i = 0; i < cells.length; i++) {
      this.createOrRefreshTile(cells[i], false);
    }
  }

  private createOrRefreshTile(cell: TileCell, animate: boolean): Tile {
    var view = this.tileViews[cell.id];
    if (!view) {
      var tileNode = new cc.Node(cell.id);
      tileNode.parent = this.boardRoot!;
      tileNode.scale = animate ? 0.2 : 1;
      view = tileNode.addComponent(Tile);
      this.tileViews[cell.id] = view;
    }

    view.init(cell, this.tileSize, this.handleTileTap.bind(this));
    var target = this.getTilePosition(cell.row, cell.col);
    if (animate) {
      view.node.stopAllActions();
      view.node.runAction(cc.spawn(cc.moveTo(GAME_CONFIG.SWAP_DURATION, target), cc.scaleTo(0.12, 1)));
    } else {
      view.node.setPosition(target);
      view.node.scale = 1;
    }
    return view;
  }

  private handleTileTap(tile: Tile): void {
    if (this.inputLocked || !tile.cell || !this.model) {
      return;
    }

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

  private trySwap(first: MatchPosition, second: MatchPosition): void {
    if (!this.model) {
      return;
    }

    this.inputLocked = true;
    this.clearSelection();
    this.model.swap(first, second);
    this.syncAllTiles(true, () => {
      if (!this.model) {
        return;
      }
      var matches = this.model.findMatches();
      if (matches.length === 0) {
        this.model.swap(first, second);
        this.syncAllTiles(true, () => {
          this.inputLocked = false;
          EventBus.emit(GAME_EVENTS.TOAST, "没有可消除的组合");
        });
        return;
      }

      this.moves += 1;
      EventBus.emit(GAME_EVENTS.MOVES_CHANGED, { moves: this.moves });
      this.processMatches();
    });
  }

  private processMatches(): void {
    if (!this.model) {
      this.inputLocked = false;
      return;
    }

    var matches = this.model.findMatches();
    if (matches.length === 0) {
      this.inputLocked = false;
      return;
    }

    var removed = this.model.removePositions(matches);
    this.score += removed.length * GAME_CONFIG.BASE_SCORE;
    EventBus.emit(GAME_EVENTS.SCORE_CHANGED, { score: this.score });
    this.playRemoveTiles(removed, () => {
      if (!this.model) {
        return;
      }
      this.model.collapseAndRefill();
      this.syncAllTiles(true, () => {
        this.scheduleOnce(() => {
          this.processMatches();
        }, GAME_CONFIG.REMOVE_DELAY);
      });
    });
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
      view.playRemove(() => {
        if (view && view.node && cc.isValid(view.node)) {
          view.node.destroy();
        }
        done();
      });
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
      var view = this.createOrRefreshTile(cell, false);
      var target = this.getTilePosition(cell.row, cell.col);
      view.node.stopAllActions();
      if (animate) {
        view.node.runAction(
          cc.sequence(
            cc.moveTo(GAME_CONFIG.SWAP_DURATION, target),
            cc.callFunc(function () {
              done();
            })
          )
        );
      } else {
        view.node.setPosition(target);
        done();
      }
    }
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
    for (var id in this.tileViews) {
      if (this.tileViews.hasOwnProperty(id)) {
        var view = this.tileViews[id];
        if (view && view.node && cc.isValid(view.node)) {
          view.node.destroy();
        }
      }
    }
    this.tileViews = {};
  }
}
