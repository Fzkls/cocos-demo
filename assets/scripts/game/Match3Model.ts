import { MatchGroup, MatchPosition, TileCell, TileKind } from "./GameTypes";

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
        this.grid[row][col] = this.createCell(row, col, this.pickSafeType(row, col), "normal");
      }
    }

    var guard = 0;
    while (!this.hasAvailableMove() && guard < 20) {
      this.randomizeNormalTiles();
      guard++;
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
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
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

  public hasSpecialAt(pos: MatchPosition): boolean {
    var cell = this.getCell(pos.row, pos.col);
    return !!cell && cell.kind !== "normal";
  }

  public collectSpecialRemoval(a: MatchPosition, b: MatchPosition): MatchPosition[] {
    var marks: { [key: string]: MatchPosition } = {};
    var first = this.getCell(a.row, a.col);
    var second = this.getCell(b.row, b.col);

    if (first && first.kind !== "normal") {
      this.markSpecial(first, second, marks);
    }
    if (second && second.kind !== "normal") {
      this.markSpecial(second, first, marks);
    }

    return this.mapToPositions(marks);
  }

  public findMatchGroups(): MatchGroup[] {
    var groups: MatchGroup[] = [];

    for (var row = 0; row < this.rows; row++) {
      var startCol = 0;
      while (startCol < this.cols) {
        var baseCell = this.grid[row][startCol];
        var endCol = startCol + 1;
        while (endCol < this.cols && this.canMatch(baseCell, this.grid[row][endCol])) {
          endCol++;
        }
        if (baseCell && endCol - startCol >= 3 && baseCell.kind !== "rainbow") {
          var hPositions: MatchPosition[] = [];
          for (var c = startCol; c < endCol; c++) {
            hPositions.push({ row: row, col: c });
          }
          groups.push({ orientation: "horizontal", positions: hPositions, type: baseCell.type });
        }
        startCol = endCol;
      }
    }

    for (var col = 0; col < this.cols; col++) {
      var startRow = 0;
      while (startRow < this.rows) {
        var base = this.grid[startRow][col];
        var endRow = startRow + 1;
        while (endRow < this.rows && this.canMatch(base, this.grid[endRow][col])) {
          endRow++;
        }
        if (base && endRow - startRow >= 3 && base.kind !== "rainbow") {
          var vPositions: MatchPosition[] = [];
          for (var r = startRow; r < endRow; r++) {
            vPositions.push({ row: r, col: col });
          }
          groups.push({ orientation: "vertical", positions: vPositions, type: base.type });
        }
        startRow = endRow;
      }
    }

    return groups;
  }

  public findMatches(): MatchPosition[] {
    return this.flattenGroups(this.findMatchGroups());
  }

  public flattenGroups(groups: MatchGroup[]): MatchPosition[] {
    var marks: { [key: string]: MatchPosition } = {};
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      for (var j = 0; j < group.positions.length; j++) {
        var pos = group.positions[j];
        marks[pos.row + ":" + pos.col] = { row: pos.row, col: pos.col };
      }
    }
    return this.mapToPositions(marks);
  }

  public removeMatchGroups(groups: MatchGroup[], preferred: MatchPosition | null, allowSpecial: boolean): TileCell[] {
    var special = allowSpecial ? this.createSpecialPlan(groups, preferred) : null;
    var positions = this.flattenGroups(groups);
    var removed: TileCell[] = [];

    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var isSpecialAnchor = special && pos.row === special.row && pos.col === special.col;
      var cell = this.getCell(pos.row, pos.col);
      if (!cell) {
        continue;
      }

      if (isSpecialAnchor && special) {
        cell.kind = special.kind;
        cell.type = special.type;
        continue;
      }

      removed.push(cell);
      this.grid[pos.row][pos.col] = null;
    }

    return removed;
  }

  public removePositions(positions: MatchPosition[]): TileCell[] {
    var unique: { [key: string]: MatchPosition } = {};
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      if (this.isInside(pos.row, pos.col)) {
        unique[pos.row + ":" + pos.col] = pos;
      }
    }

    var removed: TileCell[] = [];
    for (var key in unique) {
      if (unique.hasOwnProperty(key)) {
        var p = unique[key];
        var cell = this.getCell(p.row, p.col);
        if (cell) {
          removed.push(cell);
          this.grid[p.row][p.col] = null;
        }
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
        var newCell = this.createCell(fillRow, col, this.randomType(), "normal");
        this.grid[fillRow][col] = newCell;
        spawned.push(newCell);
      }
    }

    return spawned;
  }

  public hasAvailableMove(): boolean {
    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.cols; col++) {
        var current = this.getCell(row, col);
        if (current && current.kind !== "normal") {
          return true;
        }
        if (col + 1 < this.cols && this.wouldMatchAfterSwap({ row: row, col: col }, { row: row, col: col + 1 })) {
          return true;
        }
        if (row + 1 < this.rows && this.wouldMatchAfterSwap({ row: row, col: col }, { row: row + 1, col: col })) {
          return true;
        }
      }
    }
    return false;
  }

  public shuffleUntilPlayable(): void {
    for (var attempt = 0; attempt < 30; attempt++) {
      this.randomizeNormalTiles();
      if (this.findMatchGroups().length === 0 && this.hasAvailableMove()) {
        return;
      }
    }
    this.reset();
  }

  private wouldMatchAfterSwap(a: MatchPosition, b: MatchPosition): boolean {
    this.swap(a, b);
    var matched = this.findMatchGroups().length > 0;
    this.swap(a, b);
    return matched;
  }

  private randomizeNormalTiles(): void {
    for (var row = 0; row < this.rows; row++) {
      if (!this.grid[row]) {
        this.grid[row] = [];
      }
      for (var col = 0; col < this.cols; col++) {
        var cell = this.grid[row][col];
        if (!cell) {
          cell = this.createCell(row, col, 0, "normal");
          this.grid[row][col] = cell;
        }
        cell.row = row;
        cell.col = col;
        cell.kind = "normal";
        cell.type = this.pickSafeType(row, col);
      }
    }
  }

  private createSpecialPlan(groups: MatchGroup[], preferred: MatchPosition | null): { row: number; col: number; kind: TileKind; type: number } | null {
    var best: MatchGroup | null = null;
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].positions.length >= 4 && (!best || groups[i].positions.length > best.positions.length)) {
        best = groups[i];
      }
    }

    if (!best) {
      return null;
    }

    var anchor = this.pickSpecialAnchor(best, preferred);
    var kind: TileKind = "row";
    if (best.positions.length >= 5) {
      kind = "rainbow";
    } else if (groups.length >= 2) {
      kind = "bomb";
    } else if (best.orientation === "horizontal") {
      kind = "row";
    } else {
      kind = "col";
    }

    return {
      row: anchor.row,
      col: anchor.col,
      kind: kind,
      type: best.type
    };
  }

  private pickSpecialAnchor(group: MatchGroup, preferred: MatchPosition | null): MatchPosition {
    if (preferred) {
      for (var i = 0; i < group.positions.length; i++) {
        var pos = group.positions[i];
        if (pos.row === preferred.row && pos.col === preferred.col) {
          return { row: pos.row, col: pos.col };
        }
      }
    }
    var middle = group.positions[Math.floor(group.positions.length / 2)];
    return { row: middle.row, col: middle.col };
  }

  private markSpecial(cell: TileCell, other: TileCell | null, marks: { [key: string]: MatchPosition }): void {
    if (cell.kind === "row") {
      for (var col = 0; col < this.cols; col++) {
        this.mark(cell.row, col, marks);
      }
      return;
    }

    if (cell.kind === "col") {
      for (var row = 0; row < this.rows; row++) {
        this.mark(row, cell.col, marks);
      }
      return;
    }

    if (cell.kind === "bomb") {
      for (var r = cell.row - 1; r <= cell.row + 1; r++) {
        for (var c = cell.col - 1; c <= cell.col + 1; c++) {
          this.mark(r, c, marks);
        }
      }
      return;
    }

    if (cell.kind === "rainbow") {
      if (other && other.kind === "normal") {
        this.markType(other.type, marks);
      } else {
        this.markAll(marks);
      }
    }
  }

  private markType(type: number, marks: { [key: string]: MatchPosition }): void {
    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.cols; col++) {
        var cell = this.grid[row][col];
        if (cell && cell.type === type) {
          this.mark(row, col, marks);
        }
      }
    }
  }

  private markAll(marks: { [key: string]: MatchPosition }): void {
    for (var row = 0; row < this.rows; row++) {
      for (var col = 0; col < this.cols; col++) {
        this.mark(row, col, marks);
      }
    }
  }

  private mark(row: number, col: number, marks: { [key: string]: MatchPosition }): void {
    if (this.isInside(row, col)) {
      marks[row + ":" + col] = { row: row, col: col };
    }
  }

  private mapToPositions(marks: { [key: string]: MatchPosition }): MatchPosition[] {
    var result: MatchPosition[] = [];
    for (var key in marks) {
      if (marks.hasOwnProperty(key)) {
        result.push(marks[key]);
      }
    }
    return result;
  }

  private canMatch(a: TileCell | null, b: TileCell | null): boolean {
    return !!a && !!b && a.kind !== "rainbow" && b.kind !== "rainbow" && a.type === b.type;
  }

  private createCell(row: number, col: number, type: number, kind: TileKind): TileCell {
    return {
      id: "tile-" + this.nextId++,
      row: row,
      col: col,
      type: type,
      kind: kind
    };
  }

  private pickSafeType(row: number, col: number): number {
    for (var tries = 0; tries < 20; tries++) {
      var type = this.randomType();
      var left1 = col >= 1 ? this.grid[row][col - 1] : null;
      var left2 = col >= 2 ? this.grid[row][col - 2] : null;
      var up1 = row >= 1 ? this.grid[row - 1][col] : null;
      var up2 = row >= 2 ? this.grid[row - 2][col] : null;
      var leftMatch = !!left1 && !!left2 && left1.type === type && left2.type === type;
      var upMatch = !!up1 && !!up2 && up1.type === type && up2.type === type;
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
