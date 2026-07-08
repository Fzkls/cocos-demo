import { TileCell } from "./GameTypes";

const { ccclass } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  public cell: TileCell | null = null;

  private tileSize: number = 72;
  private selected: boolean = false;
  private tapHandler: ((tile: Tile) => void) | null = null;
  private label: cc.Label | null = null;

  public init(cell: TileCell, tileSize: number, tapHandler: (tile: Tile) => void): void {
    this.cell = cell;
    this.tileSize = tileSize;
    this.tapHandler = tapHandler;
    this.node.width = tileSize;
    this.node.height = tileSize;
    this.node.off(cc.Node.EventType.TOUCH_END, this.handleTouch, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.handleTouch, this);
    this.draw();
  }

  public refresh(cell: TileCell): void {
    this.cell = cell;
    this.draw();
  }

  public setSelected(selected: boolean): void {
    this.selected = selected;
    this.draw();
  }

  public playRemove(callback: Function): void {
    this.node.stopAllActions();
    this.node.runAction(
      cc.sequence(
        cc.scaleTo(0.12, 0.1),
        cc.callFunc(function () {
          callback();
        })
      )
    );
  }

  protected onDestroy(): void {
    this.node.off(cc.Node.EventType.TOUCH_END, this.handleTouch, this);
  }

  private handleTouch(): void {
    if (this.tapHandler) {
      this.tapHandler(this);
    }
  }

  private draw(): void {
    var graphics = this.node.getComponent(cc.Graphics);
    if (!graphics) {
      graphics = this.node.addComponent(cc.Graphics);
    }
    graphics.clear();

    var type = this.cell ? this.cell.type : 0;
    graphics.fillColor = this.getColor(type);
    graphics.strokeColor = this.selected ? cc.Color.WHITE : new cc.Color(40, 40, 40, 255);
    graphics.lineWidth = this.selected ? 6 : 2;
    graphics.rect(-this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize);
    graphics.fill();
    graphics.stroke();

    if (!this.label) {
      var labelNode = new cc.Node("TileLabel");
      labelNode.parent = this.node;
      this.label = labelNode.addComponent(cc.Label);
      this.label.fontSize = 28;
      this.label.lineHeight = 32;
      this.label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
      this.label.verticalAlign = cc.Label.VerticalAlign.CENTER;
      labelNode.color = cc.Color.WHITE;
    }

    this.label.node.width = this.tileSize;
    this.label.node.height = this.tileSize;
    this.label.string = this.getSymbol(type);
  }

  private getColor(type: number): cc.Color {
    var colors = [
      new cc.Color(239, 83, 80, 255),
      new cc.Color(66, 165, 245, 255),
      new cc.Color(102, 187, 106, 255),
      new cc.Color(255, 202, 40, 255),
      new cc.Color(171, 71, 188, 255),
      new cc.Color(255, 112, 67, 255)
    ];
    return colors[type % colors.length];
  }

  private getSymbol(type: number): string {
    var symbols = ["★", "◆", "●", "▲", "■", "✚"];
    return symbols[type % symbols.length];
  }
}
