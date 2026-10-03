# AllenOne 图标规范

更新：2026-10-03。

## 已确认方向

- 品牌使用标准大写 A、平面几何拼接，字形需要精致、有设计感。最新要求取消立体感，也替代此前允许非标准 A 的方向。
- 品牌继续使用内置生图功能，不用 SVG 重画。
- 其他 UI 图标保持单色。用户先要求全部生图，后明确允许素材网站来源；当前使用官方素材，不将其冒充为生图产物。
- 浅色、深色、跟随系统继续有效。具体最新美术尚待用户评价。

## 当前素材与实现

品牌原图为 [allenone-a-typographic-v1.png](assets/allenone-a-typographic-v1.png)，使用内置 image_gen.imagegen，完整提示词见 [提示词](assets/allenone-a-typographic-v1-prompt.txt)。当前字形采用直线笔画、平直横梁、三角留白和四色切分。`scripts/icons.mjs` 仅合成白底并缩放为 32／192／512 PNG。

界面选用 [Google Material Symbols](https://github.com/google/material-design-icons) 的 Rounded、400 字重、24px、非填充版本。18 个符号覆盖首页／日历／精灵／餐饮／设置、四类运动、浅色／深色／系统主题、添加／关闭／前后箭头／详情箭头／完成。复用同一关闭图标处理删除训练组。

源素材与逐个 URL、版本固定在 `assets/material-symbols-rounded/`，版本为 `737e3324305806514d7909874fa1818ae1808232`，保留 Apache-2.0 许可证。`scripts/ui-icons.mjs` 从未改绘的官方 SVG 栅格化为透明 96px PNG；运行资源在 `app/assets/ui-icons/`，附 LICENSE 和来源 NOTICE，无远程字体或运行时素材请求。

`app/icons.js` 与 `app/icons.css` 使用 PNG alpha 蒙版显示单色图标。浅色为深灰，深色为浅灰，主按钮内匹配文字明暗；仅品牌为四色。图标仍有原有文字标签／按钮名称，装饰图标不重复朗读。素材随 Service Worker 缓存。

旧四色 UI 图标提示词 `assets/icons-flat-v1/prompts.json` 是已放弃的探索，不进入正式应用。动作教学示意与精灵动画属于插图／角色素材，本轮未修改。

## 验证与预览

- 构建成功；18 个图标可离线读取。
- 390／1440px、浅／深主题、五个主页面检查通过，无横向溢出、JS 或资源错误。
- 已检查添加／删除训练组、关闭弹窗、日历前后切换、主题切换等图标按钮。
- 手机预览：[浅色](assets/allenone-mono-light-390.png)、[深色](assets/allenone-mono-dark-390.png)。
- 桌面预览：[浅色](assets/allenone-mono-light-1440.png)、[深色](assets/allenone-mono-dark-1440.png)。
- 未进行 iPhone 真机验收。
