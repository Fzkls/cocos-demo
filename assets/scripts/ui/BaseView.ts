const { ccclass } = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {
  public show(): void {
    this.node.active = true;
  }

  public hide(): void {
    this.node.active = false;
  }

  public setText(label: cc.Label | null, value: string | number): void {
    if (label) {
      label.string = String(value);
    }
  }
}
