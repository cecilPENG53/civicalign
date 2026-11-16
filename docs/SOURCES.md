# 来源登记表 / Source register

本项目的规则：**每一条事实都要能追溯到这里的某个来源和页码。** 每个居民端问题、每个模块、每个数字，都要挂上来源。

引用格式：〔S2 p.23〕表示来源 S2 第 23 页。没有来源的内容只能标成"假设"或"假数据"。

页码规则：
- S1 用 PDF 页序；
- S2 和 S5 用 PDF 上印的页码（S5 是跨页排版，一个 PDF 页对应两个印刷页码）。

## 已阅读的来源

| ID | 来源 | 发布方 | 日期 | 链接 / 本地文件 | 用在哪里 |
| --- | --- | --- | --- | --- | --- |
| S1 | Parramatta Possibilities – Public Challenge Briefing Notes | City of Parramatta | 2026-11-06 | 本地：`parramatta-possibilities-challenge-briefing.pdf`（团队持有） | 赛题要求、Challenge 4 的范围、数据来源清单、证据标准、提交清单 |
| S2 | Draft CBD South Parramatta Precinct Master Plan (Phase 1) | City of Parramatta | 2026（4 月提交 Council） | https://participate.cityofparramatta.nsw.gov.au/upload/parra/document/260421---Draft-CBD-South-Master-PlanUpdate_1778470189.pdf | 场地、Woodhouse Square、方案比选、P1–P6、交通、实施 |
| S3 | Participate Parramatta 项目页：Draft CBD South Parramatta Precinct Master Plan | City of Parramatta | 2026-11-15 访问 | https://participate.cityofparramatta.nsw.gov.au/cbd-south-master-plan | 三项主要交付内容、1,300 m² 的说法、时间线、常见问答、22.3% 华人背景 |
| S4 | Council 报告 OCM26-56 Draft CBD South Parramatta Precinct Master Plan（2026 年 4 月 28 日 Ordinary Council Meeting，议程 12.3） | City of Parramatta | 2026-04-28 | https://docspublished.com.au/CityofParramatta/document/5bdbd20f-5ff3-43bc-97c4-1819402e9f6f | 决策经过、Councillor 简报、交通研究的时间、展期咨询方式 |
| S5 | Smart City & Innovation Strategy 2024–2033 | City of Parramatta | 2024 | https://www.cityofparramatta.nsw.gov.au/files/assets/public/v/1/publications/smart-city-and-innovation-strategy.pdf（网站禁止脚本下载，需用浏览器手动下载） | 6 项优先事项、行动编号、指标、原则、最少必要数据、第 18 页六瓣图 |

## 已知但还没读的来源

| ID | 来源 | 链接 | 为什么要读 |
| --- | --- | --- | --- |
| S6 | 总规中文摘要 | S3 页面 "Translations 中文翻译" 下的 "中文摘要" | 统一中文术语；作为中文界面措辞的依据 |
| S7 | Preliminary Master Plan Framework（2025-12-08 Council 通过） | S4 里提到，链接在 docspublished | 了解早期方案：大公园 / 会展中心 / 餐饮夜生活 |
| S8 | Parramatta DCP 2023 Part 9（City Centre） | Council 网站 | 深土区和步行净宽的数值 |
| S9 | ABS Census 2021（Parramatta LGA / SA2） | abs.gov.au | 人口层、代表性检查 |
| S10 | WSU Benchmarking Heat in Parramatta | Western Sydney University | 热舒适基线 |
| S11 | BOM Parramatta North 气候统计 | bom.gov.au | 气温基线 |
| S12 | Transport for NSW Open Data Hub | opendata.transport.nsw.gov.au | 车站人流（数据集待选） |
| S13 | City Economy Strategy 2026–2036 / Parramatta Retail Strategy | Council 网站 | 经济活力维度 |
| S14 | Draft Community Infrastructure Strategy 2026–2046 | Council 网站 | 休憩、包容维度 |
| S15 | Parramatta Bike Plan 2024 | Council 网站 | 模块 7 |
| S16 | Parramatta City Centre Local Infrastructure Contributions Plan 2022 | Council 网站 | 广场资金来源 |

## 模拟数据（不是证据）

| ID | 内容 | 怎么生成 | 怎么标注 | 正式版怎么换成真实数据 |
| --- | --- | --- | --- | --- |
| D1 | 演示里的居民投票（第 4 章“广场最该解决什么？最多选 3 项”，以及 Council 后台的汇总和轮盘） | `variants/vote.js` 用固定随机种子 20261116 生成 96 位模拟受访者：附近居民 44、通勤者 28、商户 / 员工 16、访客 8，年龄段比例按身份不同。每人按所属身份对 10 项用途的权重，不重复地抽选 3 项。权重表写在代码里，页面的“关于这些数据”里也列出来。访客故意少于 10 人，用来演示每组 10 人的隐私门槛 | 票数和汇总所在的每个板块都带“模拟数据 / Simulated”标签；本浏览器里的演示提交另行计数 | 用赛题允许的标明模拟数据〔S1 p.3〕。真实数据在 Participate Parramatta 收集（2020 年以来超过 196,000 名独立访客〔S5 p.16–17〕），加现场二维码和图书馆平板；只问身份和可选的年龄段、邮编〔S5 p.30〕；用 ABS 人口普查（S9）检查代表性 |

投票卡片上的情况说法是团队写的示例，不是 Council 的说法，也不是居民的报告；只有票数是模拟的。D1 不能当作 Council 的观测数据引用。

## 不作为证据的材料

| ID | 材料 | 说明 |
| --- | --- | --- |
| X1 | Gemini Demo（https://gemini.google.com/share/1f41a91482ea） | 只作为界面参考。里面的数字（+43 秒、19% 树荫、18,400 人次、n=142 等）在 S1–S5 里都找不到，**不能引用** |
| X2 | 团队的 Gemini 策略对话（https://share.gemini.google/YGGLGKooyw0b） | 只作为提交框架的参考，数字未经核实 |
| X3 | claude.ai 对话 artifact | 讨论记录，不是来源 |
