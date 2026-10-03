# 项目工作指引

## 项目记忆路由

本项目的持久记忆位于 `Projects/`。开始本项目的工作前：

1. 阅读 `Projects/README.md`，了解文档分工与当前阶段。
2. 阅读 `Projects/PROJECT.md`，确认用户目标、约束及已确认范围。
3. 阅读 `Projects/DECISIONS.md`，遵循已接受的决策。
4. 涉及需求、界面、数据或实现方案时，阅读 `Projects/DESIGN.md`。
5. 确定功能范围或验收时，阅读 `Projects/REQUIREMENTS.md`；涉及数据保存、备份或迁移时，阅读 `Projects/DATA_FORMAT.md`。
6. 涉及放纵餐、计分或精灵养成时，阅读 `Projects/MEALS_AND_PETS.md`，注意其中未确认的计分边界。
7. 涉及精灵系列、模型或动态 3D 时，阅读 `Projects/PET_CATALOG.md`；`prototypes/pet3d/` 是独立探索原型，不能当作已实现的完整 PWA。
8. 开发主应用前阅读 `Projects/IMPLEMENTATION.md`；24 种姿态设计见 `Projects/PET_ROSTER.md`。正式开发入口为 `app/`，不是旧原型。
9. 修改 UI、主题或模型材质时阅读 `Projects/VISUAL_SYSTEM.md`，保留浅／深／跟随系统能力，并检查两种主题下的可读性与 3D 效果。

10. 精灵展示已改为预渲染立体动画，修改前阅读 `Projects/ANIMATED_COMPANIONS.md`。不继续把旧实时程序模型作为交付方向，不恢复拖动旋转。

11. 应用名为 AllenOne；当前 UI 使用 Google Material 风格，修改前阅读 `Projects/MATERIAL_UI.md`。品牌图标使用生图 PNG，采用标准大写 A、平面几何四色拼接，不用 SVG 重画；其他 UI 图标采用单色官方 Material Symbols，本地素材与规范见 `Projects/ICON_SYSTEM.md`。原 Atelier 仅为历史，不恢复旧装饰风格；更名不改数据库键或备份 Schema。

## 维护规则

- 将用户明确确认的需求与代理提出的建议分开记录，不把建议视为已批准范围。
- 用户确认新决策、修改约束或推进项目阶段后，在本次工作中同步更新相关记忆文件。
- `PROJECT.md` 和 `DESIGN.md` 保持当前状态；`DECISIONS.md` 按日期记录决策及原因。决策被替代时保留历史并注明替代关系。
- 新增设计专题文档时放入 `Projects/`，并更新 `Projects/README.md` 的索引。
- 保持记录简洁，不重复堆积对话全文；不记录密钥、账号凭据或真实个人运动与健康数据。
- 尚未确认的细节列为待收敛事项；按当前任务推进，不因待收敛事项擅自扩大实现范围。

## 当前工作边界

用户已授权完成 20 多种差异姿态设计后开始开发 App。主应用开发版已在 `app/` 实现，本机运行说明见根目录 `README.md`。面向 iPhone PWA，Windows 开发；尚未外部部署或真机验证。具体物种名单、五阶段与成长数值为代理设计默认值，需与用户明确确认的周计分规则区分。
