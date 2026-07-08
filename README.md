# Cocos Match-3 Demo

一个基于 **Cocos Creator 2.x + TypeScript** 的消消乐项目基座。

## 当前状态

已经完成第一版核心代码：

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
  scenes/                  # 场景目录，本地创建 Game.fire
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
3. 在 `assets/scenes` 下创建 `Game.fire`。
4. 场景中创建 `Canvas`。
5. 将 `assets/scripts/game/GameScene.ts` 挂载到 `Canvas`。
6. 保存场景并预览。

详细说明见：[`docs/SETUP.md`](docs/SETUP.md)。

## 核心源码

| 文件 | 作用 |
|---|---|
| `assets/scripts/game/Match3Model.ts` | 纯数据棋盘逻辑 |
| `assets/scripts/game/Match3Board.ts` | 棋盘交互、交换、消除、补齐 |
| `assets/scripts/game/Tile.ts` | 单个方块绘制与动画 |
| `assets/scripts/game/GameScene.ts` | 场景入口，动态创建 UI 和棋盘 |
| `assets/scripts/core/EventBus.ts` | 全局事件总线 |
| `assets/scripts/manager/StorageManager.ts` | 最高分本地存储 |

## 重要说明

当前没有直接提交 `.fire` 场景文件，是刻意保守处理：Cocos Creator 2.x 的场景和 `.meta` 文件依赖编辑器生成的 UUID，手写容易导致挂载脚本失效。第一版先提交可维护的代码基座，建议你在本地编辑器生成场景后再提交 `Game.fire` 和相关 `.meta` 文件。

## 后续计划

详见：[`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md)。
