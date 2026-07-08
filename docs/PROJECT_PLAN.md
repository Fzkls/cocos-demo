# Cocos 消消乐项目 Plan

## 一、当前版本定位

这是一个 **Cocos Creator 2.x + TypeScript** 的消消乐项目基座，目标不是一次性做成完整商业游戏，而是先搭出可运行、可扩展、适合后续迭代的工程结构。

当前第一版重点：

- 项目能被 Cocos Creator 2.x 打开。
- 核心玩法逻辑独立于视图。
- 棋盘、方块、分数、步数、重启按钮都能运行时生成。
- 不强依赖美术资源，先用 `cc.Graphics` 和 `cc.Label` 画出可玩的 Demo。

## 二、已完成内容

### 1. 工程结构

```txt
assets/
  prefabs/
  resources/
  scenes/
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
| 全局配置 | `assets/scripts/core/Constants.ts` | 棋盘尺寸、方块类型、事件名、存储 key |
| 事件总线 | `assets/scripts/core/EventBus.ts` | 模块间事件通信 |
| 日志工具 | `assets/scripts/core/Logger.ts` | 后续统一日志开关 |
| 棋盘模型 | `assets/scripts/game/Match3Model.ts` | 纯数据逻辑，负责生成、交换、匹配、消除、下落、补齐 |
| 方块视图 | `assets/scripts/game/Tile.ts` | 单个方块的绘制、选中态、消除动画 |
| 棋盘控制 | `assets/scripts/game/Match3Board.ts` | 点击、交换、消除、连锁、计分、刷新视图 |
| 场景入口 | `assets/scripts/game/GameScene.ts` | 动态创建 UI 和棋盘 |
| 本地存储 | `assets/scripts/manager/StorageManager.ts` | 保存最高分 |
| 音频占位 | `assets/scripts/manager/AudioManager.ts` | 后续接入音效和 BGM |

## 三、第一版验收标准

打开 Cocos Creator 2.x 后，按 `docs/SETUP.md` 创建场景并挂载 `GameScene.ts`，应满足：

- 页面出现标题、分数、最高分、步数、重启按钮。
- 页面出现 8 x 8 棋盘。
- 点击两个相邻方块可以交换。
- 无消除组合时自动换回。
- 有三连组合时自动消除并加分。
- 消除后上方方块下落，新方块补齐。
- 支持连续消除。
- 点击重新开始后棋盘、分数、步数重置。

## 四、后续迭代计划

### Phase 1：基础体验完善

- 增加启动场景文件并固化 `Game.fire`。
- 增加方块移动缓动效果。
- 增加消除缩放、闪光或粒子效果。
- 增加 Toast / Loading / 弹窗基础 UI。

### Phase 2：玩法规则增强

- 增加关卡系统。
- 增加限定步数和目标分数。
- 增加特殊方块：
  - 横向消除
  - 纵向消除
  - 炸弹
  - 彩虹球
- 增加死局检测和自动洗牌。

### Phase 3：资源与配置工程化

- 增加 `resources/config/levels.json`。
- 方块由 `cc.Graphics` 替换为 `SpriteFrame`。
- 音效和 BGM 资源接入 `AudioManager`。
- 增加资源加载和释放规范。

### Phase 4：平台发布

- Web Mobile 构建配置。
- 微信小游戏构建配置。
- 首屏资源压缩。
- 分包策略。
- 版本号和构建产物规范。

## 五、当前风险点

| 风险 | 说明 | 建议 |
|---|---|---|
| 场景文件未提交 | `.fire` 场景手写容易出现 UUID / meta 不一致 | 由本地 Cocos Creator 生成场景后再提交 |
| 未接入正式素材 | 当前使用代码绘制方块 | 后续替换为 SpriteFrame |
| 未做死局检测 | 可能出现无可用移动的棋盘 | Phase 2 增加检测和洗牌 |
| 未做移动端适配细节 | 当前按 750 x 1334 设计 | 后续增加多分辨率适配测试 |

## 六、建议下一步

优先在本地 Cocos Creator 2.4.x 中完成一次运行验证，然后把编辑器生成的 `assets/scenes/Game.fire` 和相关 `.meta` 文件提交回仓库。这样项目会从“代码基座”变成“打开即运行”的完整工程。
