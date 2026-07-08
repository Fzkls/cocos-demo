# Cocos Match-3 Demo

一个基于 **Cocos Creator 2.x + TypeScript** 的消消乐 Demo 项目。

## 当前状态

已经完成第一版可运行工程：

- 已提交默认启动场景 `assets/scenes/Game.fire`
- 已配置启动场景 `db://assets/scenes/Game.fire`
- 8 x 8 消消乐棋盘
- 方块运行时绘制，无需先准备美术资源
- 点击相邻方块交换
- 无匹配自动换回
- 横向 / 纵向三连及以上消除
- 消除后下落补齐
- 连续消除
- 分数、步数、最高分
- 重新开始
- 事件总线、日志、本地存储、音频占位

## 项目结构

```txt
assets/
  prefabs/                 # prefab 占位
  resources/               # resources 占位
  scenes/
    Game.fire              # 默认启动场景
  scripts/
    core/                  # 配置、事件、日志
    game/                  # 消消乐核心玩法
    manager/               # 存储、音频等管理器
    ui/                    # UI 基类
docs/
  SETUP.md                 # 本地运行说明
  PROJECT_PLAN.md          # 项目计划
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
| `assets/scripts/game/Match3Model.ts` | 纯数据棋盘逻辑 |
| `assets/scripts/game/Match3Board.ts` | 棋盘交互、交换、消除、补齐 |
| `assets/scripts/game/Tile.ts` | 单个方块绘制与动画 |
| `assets/scripts/game/GameScene.ts` | 场景入口，动态创建 UI 和棋盘 |
| `assets/scripts/core/EventBus.ts` | 全局事件总线 |
| `assets/scripts/manager/StorageManager.ts` | 最高分本地存储 |

## 静态资源策略

当前版本不依赖图片、prefab 或音频资源。方块和基础 UI 都通过 `cc.Graphics`、`cc.Label` 在运行时动态创建，目的是先保证玩法链路稳定可运行。后续接正式美术时，再把 `Tile.ts` 从代码绘制替换为 SpriteFrame 渲染。

## 后续计划

详见：[`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)。
