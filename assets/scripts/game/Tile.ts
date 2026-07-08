import { TileCell, TileKind } from "./GameTypes";

const { ccclass } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  public cell: TileCell | null = null;

  private static frameCache: { [key: string]: cc.SpriteFrame } = {};

  private tileSize: number = 72;
  private selected: boolean = false;
  private tapHandler: ((tile: Tile) => void) | null = null;
  private sprite: cc.Sprite | null = null;
  private label: cc.Label | null = null;
  private border: cc.Graphics | null = null;

  public init(cell: TileCell, tileSize: number, tapHandler: (tile: Tile) => void): void {
    this.cell = cell;
    this.tileSize = tileSize;
    this.tapHandler = tapHandler;
    this.node.width = tileSize;
    this.node.height = tileSize;
    this.ensureView();
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
    this.node.stopActionByTag(2001);
    if (selected) {
      var action = cc.repeatForever(cc.sequence(cc.scaleTo(0.18, 1.08), cc.scaleTo(0.18, 1.0)));
      action.setTag(2001);
      this.node.runAction(action);
    } else {
      this.node.stopActionByTag(2001);
      this.node.scale = 1;
    }
  }

  public playSpawn(): void {
    this.node.stopAllActions();
    this.node.scale = 0.25;
    this.node.opacity = 0;
    this.node.runAction(cc.spawn(cc.fadeIn(0.16), cc.scaleTo(0.2, 1).easing(cc.easeBackOut())));
  }

  public playFlash(): void {
    if (!this.sprite) {
      return;
    }
    var target = this.sprite.node;
    target.stopAllActions();
    target.opacity = 255;
    target.runAction(cc.sequence(cc.fadeTo(0.06, 110), cc.fadeTo(0.08, 255)));
  }

  public playRemove(callback: Function): void {
    this.node.stopAllActions();
    this.playFlash();
    this.node.runAction(
      cc.sequence(
        cc.spawn(cc.scaleTo(0.18, 0.08).easing(cc.easeSineIn()), cc.fadeOut(0.18)),
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

  private ensureView(): void {
    if (!this.sprite) {
      this.sprite = this.node.addComponent(cc.Sprite);
      this.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    }

    if (!this.border) {
      var borderNode = new cc.Node("SelectionBorder");
      borderNode.parent = this.node;
      this.border = borderNode.addComponent(cc.Graphics);
    }

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
  }

  private draw(): void {
    if (!this.cell || !this.sprite || !this.label || !this.border) {
      return;
    }

    this.sprite.spriteFrame = Tile.getFrame(this.cell.type, this.cell.kind, this.tileSize);
    this.sprite.node.width = this.tileSize;
    this.sprite.node.height = this.tileSize;

    this.label.node.width = this.tileSize;
    this.label.node.height = this.tileSize;
    this.label.string = this.getSymbol(this.cell.kind);

    this.border.clear();
    this.border.lineWidth = this.selected ? 6 : 0;
    if (this.selected) {
      this.border.strokeColor = cc.Color.WHITE;
      this.border.rect(-this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize);
      this.border.stroke();
    }
  }

  private getSymbol(kind: TileKind): string {
    if (kind === "row") {
      return "↔";
    }
    if (kind === "col") {
      return "↕";
    }
    if (kind === "bomb") {
      return "✹";
    }
    if (kind === "rainbow") {
      return "✦";
    }
    var type = this.cell ? this.cell.type : 0;
    var symbols = ["★", "◆", "●", "▲", "■", "✚"];
    return symbols[type % symbols.length];
  }

  private static getFrame(type: number, kind: TileKind, size: number): cc.SpriteFrame {
    var key = type + "-" + kind + "-" + size;
    if (Tile.frameCache[key]) {
      return Tile.frameCache[key];
    }

    var frame = Tile.createFrame(type, kind, size);
    Tile.frameCache[key] = frame;
    return frame;
  }

  private static createFrame(type: number, kind: TileKind, size: number): cc.SpriteFrame {
    var globalObj: any = typeof document !== "undefined" ? document : null;
    if (!globalObj) {
      var empty = new cc.SpriteFrame();
      return empty;
    }

    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    if (ctx) {
      var color = Tile.getColor(type, kind);
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = color;
      ctx.fillRect(4, 4, size - 8, size - 8);
      ctx.strokeStyle = kind === "normal" ? "rgba(30,30,40,0.65)" : "rgba(255,255,255,0.95)";
      ctx.lineWidth = kind === "normal" ? 3 : 5;
      ctx.strokeRect(5, 5, size - 10, size - 10);

      if (kind !== "normal") {
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(10, 10, size - 20, size - 20);
      }
    }

    var texture = new cc.Texture2D();
    texture.initWithElement(canvas);
    texture.handleLoadedTexture();
    var spriteFrame = new cc.SpriteFrame();
    spriteFrame.setTexture(texture);
    return spriteFrame;
  }

  private static getColor(type: number, kind: TileKind): string {
    if (kind === "rainbow") {
      return "rgba(250, 120, 255, 1)";
    }

    var colors = [
      "rgba(239, 83, 80, 1)",
      "rgba(66, 165, 245, 1)",
      "rgba(102, 187, 106, 1)",
      "rgba(255, 202, 40, 1)",
      "rgba(171, 71, 188, 1)",
      "rgba(255, 112, 67, 1)"
    ];
    return colors[type % colors.length];
  }
}
