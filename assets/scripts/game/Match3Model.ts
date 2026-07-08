import { MatchPosition, TileCell } from "./GameTypes";

export default class Match3Model {
  public readonly rows: number;
  public readonly cols: number;
  public readonly tileTypes: number;

  private grid: Array<Array<TileCell | null>> = [];
  private nextId: number = 1;

  constructor(rows: number, cols: number, tileTypes: number) {
    this.rows = rows;
    this.cols = cols;
    this.tileTypes = tileTypes;
    this.reset();
  }

  public reset(): void {
    this.grid = [];
    this.nextId = 1;

    for (var row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (var col = 0; col < this.cols; col++) {
        this.grid[row][col] = this.createCell(row, col, this.pickSafeType(row, col));
      }
    }
  }

  public getCell(row: number, col: number): TileCell | null {
    if (!this.isInside(row, col)) {
      return null;
    }
    return this.grid[row][col];
  }

  public getCells(): TileCell[] {
    var cells: TileCell[] = [];
    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.cols; col++) {
        var cell = this.grid[row][col];
        if (cell) {
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  public isAdjacent(a: MatchPosition, b: MatchPosition): boolean {
    var distance = Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    return distance === 1;
  }

  public swap(a: MatchPosition, b: MatchPosition): boolean {
    if (!this.isInside(a.row, a.col) || !this.isInside(b.row, b.col)) {
      return false;
    }

    var first = this.grid[a.row][a.col];
    var second = this.grid[b.row][b.col];
    this.grid[a.row][a.col] = second;
    this.grid[b.row][b.col] = first;

    if (first) {
      first.row = b.row;
      first.col = b.col;
    }
    if (second) {
      second.row = a.row;
      second.col = a.col;
    }
    return true;
  }

  public findMatches(): MatchPosition[] {
    var marks: { [key: string]: MatchPosition } = {};

    for (var row = 0; row < this.rows; row++) {
      var startCol = 0;
      while (startCol < this.cols) {
        var baseCell = this.grid[row][startCol];
        var endCol = startCol + 1;
        while (
          endCol < this.cols &&
          baseCell &&
          this.grid[row][endCol] &&
          this.grid[row][endCol]!.type === baseCell.type
        ) {
          endCol++;
        }
        if (baseCell && endCol - startCol >= 3) {
          for (var c = startCol; c < endCol; c++) {
            marks[row + ":" + c] = { row: row, col: c };
          }
        }
        startCol = endCol;
      }
    }

    for (var col = 0; col < this.cols; col++) {
      var startRow = 0;
      while (startRow < this.rows) {
        var base = this.grid[startRow][col];
        var endRow = startRow + 1;
        while (
          endRow < this.rows &&
          base &&
          this.grid[endRow][col] &&
          this.grid[endRow][col]!.type === base.type
        ) {
          endRow++;
        }
        if (base && endRow - startRow >= 3) {
          for (var r = startRow; r < endRow; r++) {
            marks[r + ":" + col] = { row: r, col: col };
          }
        }
        startRow = endRow;
      }
    }

    var result: MatchPosition[] = [];
    for (var key in marks) {
      if (marks.hasOwnProperty(key)) {
        result.push(marks[key]);
      }
    }
    return result;
  }

  public removePositions(positions: MatchPosition[]): TileCell[] {
    var removed: TileCell[] = [];
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var cell = this.getCell(pos.row, pos.col);
      if (cell) {
        removed.push(cell);
        this.grid[pos.row][pos.col] = null;
      }
    }
    return removed;
  }

  public collapseAndRefill(): TileCell[] {
    var spawned: TileCell[] = [];

    for (var col = 0; col < this.cols; col++) {
      var writeRow = this.rows - 1;
      for (var row = this.rows - 1; row >= 0; row--) {
        var cell = this.grid[row][col];
        if (cell) {
          this.grid[writeRow][col] = cell;
          cell.row = writeRow;
          cell.col = col;
          if (writeRow !== row) {
            this.grid[row][col] = null;
          }
          writeRow--;
        }
      }

      for (var fillRow = writeRow; fillRow >= 0; fillRow--) {
        var newCell = this.createCell(fillRow, col, this.randomType());
        this.grid[fillRow][col] = newCell;
        spawned.push(newCell);
      }
    }

    return spawned;
  }

  private createCell(row: number, col: number, type: number): TileCell {
    return {
      id: "tile-" + this.nextId++,
      row: row,
      col: col,
      type: type
    };
  }

  private pickSafeType(row: number, col: number): number {
    for (var tries = 0; tries < 20; tries++) {
      var type = this.randomType();
      var leftMatch =
        col >= 2 &&
        this.grid[row][col - 1] &&
        this.grid[row][col - 2] &&
        this.grid[row][col - 1]!.type === type &&
        this.grid[row][col - 2]!.type === type;
      var upMatch =
        row >= 2 &&
        this.grid[row - 1][col] &&
        this.grid[row - 2][col] &&
        this.grid[row - 1][col]!.type === type &&
        this.grid[row - 2][col]!.type === type;
      if (!leftMatch && !upMatch) {
        return type;
      }
    }
    return this.randomType();
  }

  private randomType(): number {
    return Math.floor(Math.random() * this.tileTypes);
  }

  private isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}
