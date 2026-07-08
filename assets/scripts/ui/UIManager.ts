export default class UIManager {
  private static toastNode: cc.Node | null = null;
  private static loadingNode: cc.Node | null = null;
  private static popupNode: cc.Node | null = null;

  public static showToast(parent: cc.Node, message: string): void {
    if (!UIManager.toastNode || !cc.isValid(UIManager.toastNode)) {
      UIManager.toastNode = UIManager.createToastNode(parent);
    }

    var label = UIManager.toastNode.getComponent(cc.Label);
    if (label) {
      label.string = message;
    }
    UIManager.toastNode.stopAllActions();
    UIManager.toastNode.opacity = 255;
    UIManager.toastNode.active = true;
    UIManager.toastNode.runAction(cc.sequence(cc.delayTime(0.9), cc.fadeOut(0.25)));
  }

  public static showLoading(parent: cc.Node, message?: string): void {
    if (!UIManager.loadingNode || !cc.isValid(UIManager.loadingNode)) {
      UIManager.loadingNode = UIManager.createLoadingNode(parent);
    }
    var label = UIManager.loadingNode.getChildByName("Label").getComponent(cc.Label);
    if (label) {
      label.string = message || "加载中...";
    }
    UIManager.loadingNode.active = true;
  }

  public static hideLoading(): void {
    if (UIManager.loadingNode && cc.isValid(UIManager.loadingNode)) {
      UIManager.loadingNode.active = false;
    }
  }

  public static showPopup(parent: cc.Node, title: string, message: string, buttonText: string, onConfirm: Function): void {
    UIManager.hidePopup();
    UIManager.popupNode = UIManager.createPopupNode(parent, title, message, buttonText, onConfirm);
  }

  public static hidePopup(): void {
    if (UIManager.popupNode && cc.isValid(UIManager.popupNode)) {
      UIManager.popupNode.destroy();
    }
    UIManager.popupNode = null;
  }

  private static createToastNode(parent: cc.Node): cc.Node {
    var node = new cc.Node("Toast");
    node.parent = parent;
    node.setPosition(0, -480);
    node.color = new cc.Color(255, 238, 160, 255);
    var label = node.addComponent(cc.Label);
    label.fontSize = 24;
    label.lineHeight = 30;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    node.opacity = 0;
    return node;
  }

  private static createLoadingNode(parent: cc.Node): cc.Node {
    var root = new cc.Node("LoadingMask");
    root.parent = parent;
    root.width = 750;
    root.height = 1334;
    root.zIndex = 1000;

    var graphics = root.addComponent(cc.Graphics);
    graphics.fillColor = new cc.Color(0, 0, 0, 150);
    graphics.rect(-375, -667, 750, 1334);
    graphics.fill();

    var labelNode = new cc.Node("Label");
    labelNode.parent = root;
    labelNode.color = cc.Color.WHITE;
    var label = labelNode.addComponent(cc.Label);
    label.string = "加载中...";
    label.fontSize = 30;
    label.lineHeight = 36;
    return root;
  }

  private static createPopupNode(parent: cc.Node, title: string, message: string, buttonText: string, onConfirm: Function): cc.Node {
    var mask = new cc.Node("PopupMask");
    mask.parent = parent;
    mask.width = 750;
    mask.height = 1334;
    mask.zIndex = 1001;

    var maskGraphics = mask.addComponent(cc.Graphics);
    maskGraphics.fillColor = new cc.Color(0, 0, 0, 180);
    maskGraphics.rect(-375, -667, 750, 1334);
    maskGraphics.fill();

    var panel = new cc.Node("PopupPanel");
    panel.parent = mask;
    panel.width = 560;
    panel.height = 360;
    panel.scale = 0.6;

    var panelGraphics = panel.addComponent(cc.Graphics);
    panelGraphics.fillColor = new cc.Color(42, 52, 78, 255);
    panelGraphics.rect(-280, -180, 560, 360);
    panelGraphics.fill();

    UIManager.createText(panel, "Title", title, 38, cc.v2(0, 110), cc.Color.WHITE);
    UIManager.createText(panel, "Message", message, 26, cc.v2(0, 35), new cc.Color(220, 230, 255, 255));

    var button = new cc.Node("ConfirmButton");
    button.parent = panel;
    button.width = 260;
    button.height = 70;
    button.setPosition(0, -105);
    var buttonGraphics = button.addComponent(cc.Graphics);
    buttonGraphics.fillColor = new cc.Color(72, 138, 255, 255);
    buttonGraphics.rect(-130, -35, 260, 70);
    buttonGraphics.fill();
    UIManager.createText(button, "ButtonLabel", buttonText, 28, cc.v2(0, 0), cc.Color.WHITE);
    button.on(cc.Node.EventType.TOUCH_END, function () {
      UIManager.hidePopup();
      onConfirm();
    });

    panel.runAction(cc.scaleTo(0.18, 1).easing(cc.easeBackOut()));
    return mask;
  }

  private static createText(parent: cc.Node, name: string, text: string, fontSize: number, position: cc.Vec2, color: cc.Color): cc.Label {
    var node = new cc.Node(name);
    node.parent = parent;
    node.setPosition(position);
    node.color = color;
    var label = node.addComponent(cc.Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    return label;
  }
}
