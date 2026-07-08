# Cocos Creator 2.x 运行说明

## 目标版本

建议使用 **Cocos Creator 2.4.x** 打开项目，优先使用 2.4.10 或相近的 2.4 LTS 版本。

## 打开项目

1. 克隆仓库：

```bash
git clone https://github.com/Fzkls/cocos-demo.git
cd cocos-demo
```

2. 用 Cocos Creator 2.4.x 打开项目根目录。
3. 首次打开后，编辑器会自动生成 `library/`、`local/`、`temp/` 等目录，这些目录已经在 `.gitignore` 中忽略。
4. 等待资源导入完成。
5. 打开 `assets/scenes/Game.fire`。
6. 点击预览运行。

## 当前启动场景

仓库已经提交默认场景：

```txt
assets/scenes/Game.fire
assets/scenes/Game.fire.meta
```

场景结构：

```txt
Game.fire
  Canvas
    GameScene.ts
```

启动配置：

```json
{
  "start-scene": "db://assets/scenes/Game.fire"
}
```

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

## 静态资源说明

当前版本不依赖图片、prefab 或音频资源：

- 方块使用 `cc.Graphics` 动态绘制。
- 方块符号使用 `cc.Label` 显示。
- UI 由 `GameScene.ts` 运行时创建。
- `assets/resources` 和 `assets/prefabs` 暂时只保留目录。

这样做是为了优先保证第一版能运行，避免 Cocos Creator 2.x 因图片、prefab、SpriteFrame UUID 或 `.meta` 引用不一致导致资源丢失。

## 如果运行报错

优先把 Cocos Creator Console 里的完整错误贴出来，重点看：

- TypeScript 编译错误
- `Can not find uuid`
- `deserialize failed`
- `GameScene` 挂载失败
- `cc.Graphics` 或 `cc.Label` 运行时报错

## 后续可以增强

- 增加目标分数 / 限定步数。
- 增加关卡配置 JSON。
- 增加道具：炸弹、横消、竖消、彩虹球。
- 替换 `cc.Graphics` 方块为正式美术 SpriteFrame。
- 增加音效、动画、粒子和结算页。
