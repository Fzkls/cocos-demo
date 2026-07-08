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
- 分数 / 最高分 / 步数 / 目标分
- 重新开始按钮
- Loading
- Toast
- 胜负 Popup
- 8 x 8 消消乐棋盘
- 方块图形和点击交互

## 当前玩法

- 点击第一个方块后进入选中态。
- 点击相邻第二个方块后交换。
- 如果交换后没有三连及以上组合，会自动换回。
- 如果形成横向或纵向三连，会消除、计分、下落补齐。
- 四连会生成横消或竖消特殊方块。
- 五连会生成彩虹球。
- 交叉消除会生成炸弹。
- 特殊方块支持横消、竖消、炸弹、彩虹球。
- 支持连续消除。
- 支持限定步数和目标分数。
- 达到目标分数会弹出过关 Popup。
- 步数耗尽且未达到目标会弹出失败 Popup。
- 检测到死局后会自动洗牌。
- 最高分使用 `cc.sys.localStorage` 保存。

## 关卡配置

关卡配置位于：

```txt
assets/resources/config/levels.json
```

示例字段：

```json
{
  "id": 1,
  "name": "甜品工坊 1",
  "rows": 8,
  "cols": 8,
  "tileTypes": 5,
  "targetScore": 500,
  "moveLimit": 24
}
```

## 静态资源说明

当前版本已经使用 `cc.Sprite + cc.SpriteFrame` 渲染方块，但不强依赖真实图片资源：

- 方块 SpriteFrame 默认由代码动态生成。
- 方块符号使用 `cc.Label` 显示。
- UI 由 `GameScene.ts` 和 `UIManager.ts` 运行时创建。
- `assets/resources/textures/tiles` 是后续正式方块贴图目录。
- `assets/resources/audio` 是后续正式音频目录。
- 当前音效优先加载真实音频，缺失时使用 WebAudio 生成兜底音。

这样做是为了优先保证第一版能运行，避免 Cocos Creator 2.x 因图片、prefab、SpriteFrame UUID 或 `.meta` 引用不一致导致资源丢失。

## 如果运行报错

优先把 Cocos Creator Console 里的完整错误贴出来，重点看：

- TypeScript 编译错误
- `Can not find uuid`
- `deserialize failed`
- `GameScene` 挂载失败
- `cc.SpriteFrame` 或 `cc.Label` 运行时报错
- `cc.resources.load` 加载配置失败

## 后续可以增强

- 接正式美术资源。
- 接正式音效和 BGM。
- 增加更多关卡。
- 增加移动端多分辨率适配。
- 增加微信小游戏构建配置。
