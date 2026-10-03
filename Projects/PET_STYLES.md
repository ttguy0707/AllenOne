# 精灵视觉风格探索

日期：2026-10-02

状态：用户已要求先看多种风格；以下均为候选，尚未选定最终方向。

后续要求：精灵需动态 3D，并覆盖十二生肖、海洋生物和鸟类／鹰类。静态对比图仅作为美术参考，动态原型与系列规划见 [PET_CATALOG.md](PET_CATALOG.md)。

当前已进入主应用开发，24 种不同体态的设计见 [PET_ROSTER.md](PET_ROSTER.md)，运行入口与验证见 [IMPLEMENTATION.md](IMPLEMENTATION.md)。早期概念图不是当前模型的质量验收记录。

## 对比方向

| 编号 | 风格 | 幼体到进化形态的设计 |
| --- | --- | --- |
| A | 软陶小龙 | 圆润的小角与短翼，成长后轮廓更舒展、翼面更大；柔和立体材质 |
| B | 绘本森灵 | 带嫩芽的小森林精灵，成长后出现叶冠、枝角与花朵；手绘水彩／水粉质感 |
| C | 像素星兽 | 简洁的小星兽，成长后增加鳍翼和星纹；明确像素颗粒与有限色板 |
| D | 东方云灵 | 小巧云团精灵，成长后云尾更飘逸、玉色饰角更完整；简洁二维形状与柔和渐变 |

概念图每个方向只展示幼体与进化形态，便于比较；最终阶段数量和成长门槛另行设计。候选不等于承诺四套风格全部实现。

## 生成记录

- 工具：内置 image_gen，使用 imagegen 技能；不是 CLI/API 付费回退路径。
- 用途：本项目的视觉探索对比图，非生产精灵素材或动画精灵表。
- 输出：[四种风格对比图](assets/pet-style-comparison-v1.png)。
- 检查：已目视检查，四个编号与中文名称对应正确，每格均含幼体与更大的进化形态；角色完整，四种材质／画法差异可见。此图用于方向选择，尚未制作透明背景单体素材或动画。

## 生成提示词

```text
Use case: stylized-concept.
Asset type: ONE polished art-direction comparison board for an original personal fitness PWA virtual-pet system. This is a concept exploration sheet, not production game sprites and not an app screenshot.
Primary request: Show four genuinely distinct visual styles for collectible evolving creatures. Use a tidy 2x2 grid on a warm ivory gallery background, generous whitespace and thin subtle dividers. Landscape canvas. In EACH quadrant show TWO full-body versions of the same original creature: a small adorable juvenile on the left and a substantially larger beautiful evolved form on the right. Preserve recognizable identity within each pair; growth adds silhouette and tasteful details, not just scaling. Keep both wholly visible. Adult remains friendly and companion-like, never frightening. Readable as mobile-app mascots.
Top-left A: soft clay 3D little dragon, matte tactile mint body, cream belly, tiny amber horns; evolved graceful bigger wings and leafy-looking tail fins, rounded sculptural forms, soft studio lighting. Label exactly "A  软陶小龙".
Top-right B: hand-painted storybook forest spirit, a small mossy fox/deer-like original creature with a sprout and cream face, watercolor/gouache texture; evolved larger woodland guardian with graceful branching leaf antlers, restrained small flowers, rich emerald silhouette, delicate organic linework. Label exactly "B  绘本森灵".
Bottom-left C: crisp true pixel-art original blue-violet star lizard monster, blocky visible pixel clusters, limited cool palette, no blur; evolved larger angular celestial creature with wing-like fins and amber star accents. Keep this quadrant distinctly pixel-art, never smooth rendering. Label exactly "C  像素星兽".
Bottom-right D: contemporary Chinese-inspired cloud spirit, original floating pearl-white creature with jade ears and a coral forehead mark, elegant clean 2D shapes and very subtle silk-like gradients; evolved flowing cloud-tail, jade horn ornament and restrained gold arc accents, airy auspicious feeling, sophisticated uncluttered mascot art. Label exactly "D  东方云灵".
Text: only those four Chinese labels with large A/B/C/D identifiers; no other text, no scores, no level numbers, no title or watermark. Neutral consistent panel backgrounds keep focus on characters. Distinct professional art directions, cohesive presentation. No recognizable existing franchise characters, no human figures, no fitness equipment, no elaborate scenery. Each panel must visibly communicate a smaller juvenile progressing to a larger, more ornate evolved creature.
```
