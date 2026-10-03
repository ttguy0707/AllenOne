# AllenOne 界面与品牌

更新：2026-10-03。图标最新规范见 `ICON_SYSTEM.md`。

## 已确认

- 应用名称为 **AllenOne**。
- 用户不接受此前界面的“AI 味”，明确要求 Google 系风格。
- 浅色、深色、跟随系统，以及预渲染精灵动画继续保留。

## 当前实现选择

- 参考 Google Material 的界面语言，以蓝色主色、白／浅灰表面、清晰的导航选中态、常规无衬线字体和直接的操作文案组织界面。具体色值和布局是实现选择，尚未获得用户最终审美验收。
- 首页先显示本周统计和四类运动入口，精灵位于桌面右侧、手机下方。源代码顺序与键盘访问顺序一致。
- 移除装饰圆环、渐变舞台、金色点缀、衬线标题、英文装饰标题和文艺口号；不添加虚构趋势图或运动数据。
- 桌面使用常驻导航与记录按钮；手机使用完整底部导航栏和图标选中底色，保留 iPhone 安全区。
- 卡片、按钮、日期选择、图鉴、弹窗、输入框和主题选择使用统一样式。移动端主要操作目标至少 44px。
- 主题仍使用设备原有偏好；运行不依赖字体 CDN、远程图标请求或付费服务，官方图标素材随应用本地打包。

| 用途 | 浅色 | 深色 |
| --- | --- | --- |
| 背景 | #f8fafd | #111318 |
| 卡片 | #ffffff | #1b1d22 |
| 次级表面 | #f0f4f9 | #21242c |
| 正文 | #1f1f1f | #e3e3e3 |
| 主色 | #0b57d0 | #a8c7fa |

## 名称与兼容

- 页面标题、首次使用页、导航、设置、Manifest、iOS 主屏幕标题、PNG 图标、导出文件名和格式说明统一使用 AllenOne。
- 品牌通过内置 imagegen 生成：标准大写 A、平直横梁、清楚的三角留白、平面四色几何拼接，取消厚度、折面与阴影。其他 UI 图标为单色 Material Symbols Rounded；来源与制作方式见 `ICON_SYSTEM.md`。具体图形仍待用户评价。
- 保留 Manifest id、start_url、scope，以及已有 IndexedDB 数据库名、设备偏好键、Schema 和养成规则版本，以便改名后继续读取历史记录。内部 Wildfit 标识不是用户可见品牌，不为更名而迁移数据库。
- 旧备份可直接导入；新备份只有说明文字与下载文件名换成 AllenOne，字段格式不变。

## 入口与验证

- `../app/material.css` 替代 Atelier 样式；`../app/app.js` 为页面结构与文案；`../app/theme.js` 管理浅深主题。
- `../app/icon-32.png` 为 favicon，192／512 PNG 用于应用内和主屏幕；原图为 `assets/allenone-a-typographic-v1.png`；`../app/manifest.webmanifest` 保留安装身份。
- 旧 `atelier.css` 保留为源文件历史，但从正式构建排除。
- 验证已通过：8 项核心测试；四类运动、模板、餐记录、备份恢复与离线回归；两种主题下 390／1440 宽度的五页与表单；动画暂停、互动、成长及离线。另验证旧品牌备份导入、Manifest 安装身份不变、数据不变、AllenOne 下载名与移动导航触控尺寸。
- 实际浏览器截图：`assets/allen1-theme-preview.png`、`assets/allen1-light-desktop.png`、`assets/allen1-dark-desktop.png`。均为空白测试环境，不含用户真实记录。
- 尚未进行 iPhone 真机验收；马／鳐的动画素材仍待补充。

设计参考：[Material 色彩角色](https://m3.material.io/styles/color/roles)、[Material 底部导航](https://m3.material.io/components/navigation-bar/overview)。本项目采用其设计方向，不声称使用官方组件库或逐项完成规范认证。

## 品牌修订历史（2026-10-02；SVG 实现已被 D022 替代）

用户将名称从 Allen1 改为 AllenOne，并要求更炫酷的 Google 风格图标。已同步应用显示名、Manifest、iOS 主屏幕标题、导出文件名和说明；原数据库与安装身份不变。图标保持可编辑 SVG，同时生成 192／512 PNG。上方 allen1 前缀截图为旧版历史，最新品牌预览见 `assets/allenone-brand-preview.png`。

本轮已验证：页面与 iOS 标题、Manifest 名称、192／512 PNG、AllenOne 导出文件名，以及 390／900／1440 宽度下浅深主题；安装 id 不变、业务数据不变。

## 图标融合修订历史（2026-10-02；已被 D022 替代）

用户认为四种颜色结合突兀，要求连接更自然。新版统一 A 的外轮廓，将横梁收进双侧笔画，采用同一蒙版内的局部柔和色彩过渡。此渐变仅用于品牌图标，不恢复旧 UI 的装饰渐变。旧版保留为 `assets/allenone-icon-v1.svg`；当前源文件副本为 `assets/allenone-icon-v2.svg`，最新预览为 `assets/allenone-brand-v2-preview.png`。SVG 与 192／512 PNG 同步更新，已检查 24／32／48px 小尺寸和浅深背景；具体图形效果仍待用户评价。


## 历史图标：生图几何折叠版（2026-10-02；已被 D023 替代）

用户回到几何拼接方向，允许非标准 A，要求轻微立体与科技感，随后明确使用生图功能、不用 SVG。已通过内置 imagegen 生成原始 PNG，保存为 `assets/allenone-icon-generated-v1.png`；完整提示词见同名 `-prompt.txt`。

`scripts/icons.mjs` 仅将生成原图合成白色底并缩放为 32／192／512 PNG，用于 favicon、应用内品牌和主屏幕。正式构建排除旧 icon.svg，历史 SVG 留档；原图保留不改写。最新浅深背景及小尺寸预览见 `assets/allenone-brand-generated-preview.png`。

本轮验证：构建成功；32／192／512 PNG 尺寸正确；浏览器加载新 PNG、Manifest 仅含 PNG，390px 浅深主题无横向溢出或页面／资源错误。预览检查包含 24／32／48px 图标与浅深背景。真机安装效果仍待验证。
