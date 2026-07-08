# Cocos Creator 2.x 运行说明

## 目标版本

建议使用 **Cocos Creator 2.4.x** 打开项目，优先使用 2.4.10 或相近的 2.4 LTS 版本。

## 打开项目

1. 克隆仓库：

```bash
git clone https://github.com/Fzkls/cocos-demo.git
cd cocos-demo
```

2. 用 Cocos Creator 2.x 打开项目根目录。
3. 首次打开后，编辑器会自动生成 `library/`、`local/`、`temp/` 等目录，这些目录已经在 `.gitignore` 中忽略。

## 创建运行场景

当前仓库提交的是轻量代码基座，场景文件建议由本地编辑器生成，避免手写 `.fire` 造成 UUID / meta 不一致。

操作步骤：

1. 在 `assets/scenes` 下新建场景：`Game.fire`。
2. 场景中创建 `Canvas`。
3. 将 `assets/scripts/game/GameScene.ts` 挂载到 `Canvas` 节点。
4. 保存场景。
5. 在编辑器中预览运行。

`GameScene` 会在运行时自动创建：

- 背景
- 标题
- 分数 / 最高分 / 步数
- 重新开始按钮
- 8 x 8 消消乐棋盘
- 方块图形和点击交互

## 当前玩法

- 点击第一个方块后进入选中态。
- 点击相邻第二个方块后交换。
- 如果交换后没有三连及以上组合，会自动换回。
- 如果形成横向或纵向三连，会消除、计分、下落补齐。
- 支持连续消除。
- 最高分使用 `cc.sys.localStorage` 保存。

## 后续可以增强

- 增加目标分数 / 限定步数。
- 增加关卡配置 JSON。
- 增加道具：炸弹、横消、竖消、彩虹球。
- 替换 `cc.Graphics` 方块为正式美术 SpriteFrame。
- 增加音效、动画、粒子和结算页。
