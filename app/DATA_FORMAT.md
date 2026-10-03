# AllenOne 备份与迁移格式 1.0.0

本文件对应当前可运行开发版。完整恢复使用 JSON；CSV 是运动逐组明细的便携视图，不能代替完整备份。示例均为虚构，不含用户数据。

## 文件与版本

- `schema_version`：固定 `1.0.0`。未来版本必须提供迁移，当前拒绝不支持的版本。
- `app_version`：生成应用版本；`created_at` 为首次创建时间，ISO 8601；`exported_at` 为导出时间。
- `revision` 是本机写入冲突检测值，不导出，恢复时重新分配。
- 日期固定北京时间 Asia/Shanghai，`YYYY-MM-DD`；时刻使用含时区的 ISO 8601。运动跨天计入开始日期。
- 单位：时间秒、距离米、重量 kg、次数整数；金额不存在。无值为 null，字符串为空表示未写备注。

## 顶层集合

| 字段 | 定义 |
| --- | --- |
| settings | rest_seconds 默认休息秒数，time_zone 固定 Asia/Shanghai |
| exercises | 动作定义：id、name、muscle、weight_basis、instruction、diagram、builtin |
| workouts | 完成的运动；尚未完成录入存于 draft，不计入统计 |
| templates | id、name、created_at（如有），exercises 为有序目标动作列表 |
| meals | id、date、notes、created_at、updated_at；一条代表一顿 |
| scoring_rules | version=weekly-v1、start_week、growth_version=growth-draft-v1 |
| settlements | 已确认周的原始接收精灵、确认时间及可重算流水 |
| pets | 按永久解锁顺序排列的精灵进度 |
| equipped | 当前已解锁精灵的 ID |
| equipment_events | 历次装配变更的 pet_id 与 at 时间 |
| total_score | 独立总分，十进制整数字符串 |
| draft | null 或最近未完成录入表单；表单数值仍为字符串，不能作完成记录导入 |

## 运动 workouts

每条有稳定 id。sport 为 strength / running / cycling / basketball；date 为所属日；duration_seconds 为总时长（力量含休息）；duration_source 为 manual / timer / time_range。started_at、ended_at 可为 null，补记不虚构时刻。distance_meters 仅跑步与骑行有值；notes 篮球固定空字符串；template_id 可为空，模板删除不影响历史快照。created_at、updated_at 是记录维护时间。

力量训练 exercises 是有序数组，每项有 exercise_id、name（当时名称快照）、weight_basis（当时口径）、sets（有序逐组数据）。每组有稳定 id、weight_kg、reps、completed。0 kg 是明确录入的自重／无外加重量，不表示缺失；未录入数据保留在 draft，保存完成记录时要求重量与次数有效。未完成组保留原始值但不计入完成组数与力量进步。

重量口径明确记录为“杠铃总重”“单只哑铃”“器械标重”“自重”“辅助重量”或“外加负重”。不同口径不要直接相加。配速和均速由原始距离与时长派生，不单独作为权威数据。

模板 exercises 每项为 exercise_id、target_sets、target_reps；本版每个动作共用目标次数，保存模板取第一组目标，实际训练按逐组值保留。

## 周计分与精灵

start_week 为首次使用日期之后的下一个周一。周一至周日计数，按时间顺序确认已结束周；不自动确认空白周。settlements 每条保存 week（周一日期）、pet_id（当时接收精灵）、confirmed_at。每次重算派生 count、success、streak、delta、total_before/after/actual、pet_before/after/actual。

<=1 顿达标；连续达标 +2^(n−1)，连续超标 −2^n，结果切换后 n=1。总分与接收精灵分别最低0；分数不封顶。**所有分数与变化值使用十进制整数字符串**，迁移工具须使用 BigInt/任意精度整数，不用浮点数。导入以原始餐记录与历史 pet_id 重算余额，不信任传入余额。

pets 每条包含 id、initial_score（首只60，其余0）、score、threshold、unlocked_at、source（解锁资格来自哪只，首只null）、claimed（该精灵首次满级资格是否已用）。临时成长版本 growth-draft-v1：按解锁序号 n 从0起，满级 threshold=120×2^n；0/20%/45%/70%/100% 分为5档；满级不截断分数、不消耗分数，只能领取一次新伙伴。历史重算不撤销解锁，source 与 claimed 作为永久记录保存。

## JSON 导入

选择文件 → 校验版本、日期、字段、唯一 ID、关联、连续周与数值 → 预览数量 → 勾选完整替换 → 原子写入。不存在静默合并。重复恢复同一备份不增加重复记录。可以先导出当前备份。失败时不覆盖现存状态；多页面同时写入时旧页面被拒绝并提示刷新。

文件保护限制：20 MB、每集合最多100000行、分数字符串最多10000位、最多10000个已结算周。这是防止异常导入占满浏览器的校验限制，不是计分封顶。超过限制需要专门迁移处理，不能静默截断。

机器结构见 backup.schema.json。跨字段关系与精确计分还由运行时校验器验证；JSON Schema 单独不能验证全部业务关系。

## CSV 明细

UTF-8 BOM、逗号分隔、CRLF 行结束；所有单元格双引号包裹，内部双引号转义为两个。列：workout_id,sport,date,duration_seconds,distance_meters,notes,exercise_index,exercise_id,exercise_name,set_id,set_index,weight_kg,weight_basis,reps,completed。索引从0开始。力量每组一行，其余每次运动一行。空单元格为不适用值。

同一次力量运动的时长在各组行重复，为描述运动而不是逐组时长；累计时长必须先按 workout_id 去重。开头为 =、+、-、@、制表符、回车或单引号的字符串会额外前置一个单引号，防止表格公式执行；迁移解析时删除这一保护前缀一次即可恢复原值。

CSV 不含完整餐记录／周流水／精灵／模板／动作说明／时间戳；长期归档请同时保存 JSON 与本说明。目标第三方 App 尚未指定，不能保证直接导入。

## 原型资源

精灵模型由本地代码生成，动作示意为本地 SVG，不需要下载图片服务。无需账号；数据不发送服务器。IndexedDB 本机存储不是独立备份，建议定期保存 JSON 到手机“文件”或其他存储位置。
