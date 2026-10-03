# 项目记忆索引

本目录保存个人运动记录 PWA 的需求、设计与决策，供后续工作持续读取与维护。

| 文档 | 内容 |
| --- | --- |
| [PROJECT.md](PROJECT.md) | 用户目标、环境、约束、已确认范围与当前进度 |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 第一版已确认功能清单、用户流程与验收场景 |
| [DECISIONS.md](DECISIONS.md) | 已确认决策、原因与变更历史 |
| [DESIGN.md](DESIGN.md) | 当前设计基线、候选方案与待收敛问题 |
| [DATA_FORMAT.md](DATA_FORMAT.md) | 数据可迁移要求、字段与导出格式草案、后续验收标准 |
| [MEALS_AND_PETS.md](MEALS_AND_PETS.md) | 放纵餐统计、周计分、连续倍增和精灵养成规则 |
| [PET_STYLES.md](PET_STYLES.md) | 精灵视觉风格候选、概念图与生成提示词 |
| [PET_CATALOG.md](PET_CATALOG.md) | 十二生肖／海洋／鸟类系列与可运行动态 3D 原型 |
| [PET_ROSTER.md](PET_ROSTER.md) | 24 种精灵的不同主姿态、待机、互动与成长设计 |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | 主应用架构、当前功能、验证和剩余边界 |
| [VISUAL_SYSTEM.md](VISUAL_SYSTEM.md) | 视觉历史与当前规范路由 |
| [MATERIAL_UI.md](MATERIAL_UI.md) | 最新：AllenOne 品牌、Google Material 风格、主题与兼容 |
| [ICON_SYSTEM.md](ICON_SYSTEM.md) | 标准 A 生图品牌、单色 Material 图标、素材来源与打包 |
| [ANIMATED_COMPANIONS.md](ANIMATED_COMPANIONS.md) | 最新：预渲染立体动画替换实时模型，资源与播放规范 |

## 当前阶段

应用已命名 **AllenOne**。按用户最新要求改为 Google Material 风格，运动功能优先、蓝色主色、浅深主题，见 `MATERIAL_UI.md`；旧 Atelier 为历史方案。

最新方向：用户否定现有实体模型效果，已确认改用预渲染立体角色动画，取消实时模型与旋转；当前已接入 22 套动画，马／鳐素材受生成服务拦截而待补充；详见 `ANIMATED_COMPANIONS.md`。

前轮状态：2026-10-02，主应用开发版已接入 24 种差异姿态与核心记录／养成功能。按最新反馈进一步精修模型并重做 UI，提供浅色、深色和跟随系统主题，见 `VISUAL_SYSTEM.md`；功能状态见 `IMPLEMENTATION.md`。尚未外部部署或真机验证，最新美术仍待用户评审。

## 记录约定

- **已确认**：用户已明确接受的目标、约束或决策。
- **候选**：供讨论的设计建议，尚未进入承诺实现的范围。
- **待收敛**：仍需结合后续讨论确定的问题。

根目录 `AGENTS.md` 提供本目录的读取路由与维护规则。不要仅凭旧对话中的建议认定功能已经确认。
