# Cocos Match-3 Demo

一个基于 **Cocos Creator 2.x + TypeScript** 的消消乐 Demo 项目。

## 当前状态

已经完成第一版可运行工程，并补齐 Phase 1～Phase 3 的核心能力：

- 已提交默认启动场景 `assets/scenes/Game.fire`
- 已配置启动场景 `db://assets/scenes/Game.fire`
- 8 x 8 消消乐棋盘
- 方块使用 `cc.Sprite + cc.SpriteFrame` 渲染，当前 SpriteFrame 由代码动态生成
- 点击相邻方块交换
- 无匹配自动换回
- 横向 / 纵向三连及以上消除
- 消除后下落补齐
- 连续消除
- 分数、步数、最高分
- 限定步数、目标分数、胜负结算
- 关卡配置 `assets/resources/config/levels.json`
- 特殊方块：横消、竖消、炸弹、彩虹球
- 死局检测和自动洗牌
- Toast、Loading、Popup 基础 UI
- 缩放、闪光、粒子、缓动动画反馈
- 基础音效：优先加载真实音频资源，缺失时使用 WebAudio 生成兜底音效
- 资源加载管理器 `ResourceManager`

## 项目结构

```txt
assets/
  prefabs/                 # prefab 占位
  resources/
    audio/                 # 可选音频资源目录
    config/
      levels.json          # 关卡配置
    textures/
      tiles/               # 可选方块贴图资源目录
  scenes/
    Game.fire              # 默认启动场景
  scripts/
    core/                  # 配置、事件、日志
    game/                  # 消消乐核心玩法
    manager/               # 存储、音频、关卡、资源管理器
    ui/                    # UI 基类和 UIManager
docs/
  SETUP.md                 # 本地运行说明
  PROJECT_PLAN.md          # 项目计划与验收说明
settings/
project.json
tsconfig.json
```

## 快速运行

1. 克隆仓库：

```bash
git clone https://github.com/Fzkls/cocos-demo.git
cd cocos-demo
```

2. 使用 **Cocos Creator 2.4.x** 打开项目根目录。
3. 等待编辑器导入资源。
4. 打开 `assets/scenes/Game.fire`。
5. 点击预览运行。

详细说明见：[`docs/SETUP.md`](docs/SETUP.md)。

## 核心源码

| 文件 | 作用 |
|---|---|
| `assets/scenes/Game.fire` | 默认启动场景，包含 Canvas 和 GameScene 挂载 |
| `assets/resources/config/levels.json` | 关卡目标、步数、棋盘尺寸、方块类型配置 |
| `assets/scripts/game/Match3Model.ts` | 纯数据棋盘逻辑、匹配、特殊方块、死局检测、洗牌 |
| `assets/scripts/game/Match3Board.ts` | 棋盘交互、交换、消除、补齐、胜负流程 |
| `assets/scripts/game/Tile.ts` | 单个方块 SpriteFrame 渲染与动画 |
| `assets/scripts/game/GameScene.ts` | 场景入口，动态创建 UI、加载关卡并启动棋盘 |
| `assets/scripts/core/EventBus.ts` | 全局事件总线 |
| `assets/scripts/manager/LevelManager.ts` | 关卡配置加载和关卡进度 |
| `assets/scripts/manager/ResourceManager.ts` | resources 资源加载与释放 |
| `assets/scripts/manager/AudioManager.ts` | 音效加载、播放和 WebAudio 兜底 |
| `assets/scripts/ui/UIManager.ts` | Toast、Loading、Popup 基础 UI |

## 静态资源策略

当前版本已经切到 `cc.Sprite + cc.SpriteFrame` 渲染，但不强依赖真实图片资源。默认情况下，`Tile.ts` 会用代码动态生成 SpriteFrame，保证项目没有图片也能运行。

后续接正式素材时，把图片放到：

```txt
assets/resources/textures/tiles/
```

音频资源放到：

```txt
assets/resources/audio/
```

即可继续扩展 `ResourceManager` / `AudioManager` 的加载映射。

## 已完成阶段

- Phase 1：基础体验完善 —— 已完成
- Phase 2：玩法规则增强 —— 已完成
- Phase 3：资源与配置工程化 —— 已完成

## 后续建议

下一步可以继续做：正式美术素材、正式音效、更多关卡、移动端适配、微信小游戏构建配置。 
