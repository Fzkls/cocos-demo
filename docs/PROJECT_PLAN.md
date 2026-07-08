# Cocos 消消乐项目 Plan

## 一、当前版本定位

这是一个 **Cocos Creator 2.x + TypeScript** 的消消乐可运行 Demo 项目。当前已经不只是基础骨架，而是完成了 Phase 1～Phase 3 的核心能力：基础体验、玩法规则、资源与配置工程化。

## 二、已完成内容

### 1. 工程结构

```txt
assets/
  prefabs/
  resources/
    audio/
    config/
      levels.json
    textures/
      tiles/
  scenes/
    Game.fire
  scripts/
    core/
    game/
    manager/
    ui/
docs/
settings/
project.json
tsconfig.json
```

### 2. 核心模块

| 模块 | 文件 | 说明 |
|---|---|---|
| 默认场景 | `assets/scenes/Game.fire` | 包含 Canvas 和 GameScene 挂载 |
| 关卡配置 | `assets/resources/config/levels.json` | 关卡目标、步数、棋盘尺寸、方块类型 |
| 场景配置 | `settings/project.json` | 启动场景指向 `db://assets/scenes/Game.fire` |
| 全局配置 | `assets/scripts/core/Constants.ts` | 棋盘尺寸、动画参数、事件名、资源路径、存储 key |
| 事件总线 | `assets/scripts/core/EventBus.ts` | 模块间事件通信，支持 target 绑定 |
| 资源管理 | `assets/scripts/manager/ResourceManager.ts` | resources 资源加载、缓存和释放 |
| 关卡管理 | `assets/scripts/manager/LevelManager.ts` | 加载关卡、切换关卡、进度存储 |
| 音频管理 | `assets/scripts/manager/AudioManager.ts` | 真实音频加载 + WebAudio 兜底音效 |
| UI 管理 | `assets/scripts/ui/UIManager.ts` | Toast、Loading、Popup |
| 棋盘模型 | `assets/scripts/game/Match3Model.ts` | 纯数据逻辑、匹配、特殊方块、死局检测、洗牌 |
| 方块视图 | `assets/scripts/game/Tile.ts` | SpriteFrame 渲染、选中、生成、闪光、消除动画 |
| 棋盘控制 | `assets/scripts/game/Match3Board.ts` | 点击、交换、消除、连锁、计分、步数、胜负流程 |
| 场景入口 | `assets/scripts/game/GameScene.ts` | 加载关卡、创建 UI、创建棋盘、处理弹窗 |

## 三、阶段完成情况

### Phase 1：基础体验完善 —— 已完成

| 需求 | 状态 | 实现 |
|---|---:|---|
| 增加更细的方块移动缓动效果 | 已完成 | `Match3Board.syncAllTiles()` 使用 `cc.easeSineInOut()` |
| 增加消除缩放、闪光或粒子效果 | 已完成 | `Tile.playRemove()`、`Tile.playFlash()`、`Match3Board.playBurstAt()` |
| 增加 Toast / Loading / 弹窗基础 UI | 已完成 | `UIManager.showToast()`、`showLoading()`、`showPopup()` |
| 增加基础音效 | 已完成 | `AudioManager` 支持真实音效加载和 WebAudio 兜底 |

### Phase 2：玩法规则增强 —— 已完成

| 需求 | 状态 | 实现 |
|---|---:|---|
| 增加关卡系统 | 已完成 | `assets/resources/config/levels.json` + `LevelManager` |
| 增加限定步数和目标分数 | 已完成 | `Match3Board` 内维护 `moveLimit`、`targetScore`、胜负判断 |
| 横向消除特殊方块 | 已完成 | `TileKind = row`，触发行清除 |
| 纵向消除特殊方块 | 已完成 | `TileKind = col`，触发列清除 |
| 炸弹特殊方块 | 已完成 | `TileKind = bomb`，触发 3 x 3 清除 |
| 彩虹球特殊方块 | 已完成 | `TileKind = rainbow`，触发同色或全屏清除 |
| 死局检测和自动洗牌 | 已完成 | `Match3Model.hasAvailableMove()`、`shuffleUntilPlayable()` |

### Phase 3：资源与配置工程化 —— 已完成

| 需求 | 状态 | 实现 |
|---|---:|---|
| 增加 `resources/config/levels.json` | 已完成 | 已提交 `assets/resources/config/levels.json` |
| 方块由 `cc.Graphics` 替换为 SpriteFrame | 已完成 | `Tile.ts` 改为 `cc.Sprite + cc.SpriteFrame`，默认动态生成 SpriteFrame |
| 音效和 BGM 资源接入 AudioManager | 已完成 | `AudioManager` 已支持 `assets/resources/audio` 下的音频资源；无资源时自动兜底 |
| 增加资源加载和释放规范 | 已完成 | `ResourceManager` 封装 JSON、SpriteFrame、AudioClip 的加载、缓存、释放 |

## 四、第一版验收标准

打开 Cocos Creator 2.4.x 后，按 `docs/SETUP.md` 直接打开 `assets/scenes/Game.fire` 并预览运行，应满足：

- 页面出现标题、关卡、分数、最高分、目标分、剩余步数、重启按钮。
- 页面出现 8 x 8 棋盘。
- Loading 能展示并在关卡加载后隐藏。
- 点击两个相邻方块可以交换。
- 无消除组合时自动换回并提示。
- 有三连组合时自动消除并加分。
- 四连、五连、交叉消除会生成特殊方块。
- 特殊方块能触发行清除、列清除、炸弹清除、彩虹清除。
- 消除后上方方块下落，新方块补齐。
- 支持连续消除。
- 达到目标分后弹出过关 Popup。
- 步数耗尽后弹出失败 Popup。
- 死局时自动洗牌并提示。
- 点击重新开始后棋盘、分数、步数重置。

## 五、当前风险点

| 风险 | 说明 | 建议 |
|---|---|---|
| 场景为手写最小场景 | 已补齐 `Game.fire` 和脚本 meta，但未经过本地 Cocos Creator 实际导入验证 | 首次打开后如果编辑器自动修正场景或 meta，直接提交编辑器改动 |
| 动态 SpriteFrame 依赖 Canvas | 当前无真实图片时使用 Canvas 生成贴图，适合 Web 预览；原生平台建议换正式图片 | 接入正式 PNG / SpriteFrame 后再做原生构建验证 |
| 音效使用 WebAudio 兜底 | 没有真实音频时 Web 预览可听到基础音效；原生平台建议换正式 AudioClip | 将音频放入 `assets/resources/audio` |
| 特殊方块规则仍是 Demo 版 | 已实现核心触发，但组合规则没有做到商业消消乐的全部复杂度 | 后续可增加特殊方块互相组合的更丰富效果 |
| 移动端适配细节未专项测试 | 当前按 750 x 1334 设计 | 后续增加多分辨率适配测试 |

## 六、建议下一步

现在可以直接用 Cocos Creator 2.4.x 打开项目并预览 `assets/scenes/Game.fire`。如果编辑器 Console 出现 UUID、反序列化或 TypeScript 编译错误，优先根据报错修正场景或脚本兼容性。

后续更适合继续做：正式美术资源、正式音效、关卡编辑器、移动端适配、微信小游戏构建配置。
