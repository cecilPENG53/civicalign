# CivicAlign

[English](README.md) | **中文**

CBD South Parramatta 的决策故事板。参赛项目：City of Parramatta "Parramatta Possibilities"（Build with AI）创新挑战 2026，挑战 4"Smarter decisions for a growing city"（更聪明地为增长中的城市做决策）。

CivicAlign 帮居民或决策者看懂**一个地点的一个增长取舍**：每种选择会改变什么，依据是什么，有多不确定，以及该由谁负责。

## 决策是什么

Draft CBD South Parramatta Precinct Master Plan（第一期，2026 年 5 月 11 日至 6 月 23 日公示）提出新建 **Woodhouse Square**：位于 Council 自有土地上、临 Wentworth Street、靠近 Parramatta Station 的 1,200 m² 城市广场（总规第 23 页；公示网页写 1,300 m²，还要用最终版总规核实）。

总规把它描述为一个灵活的硬地广场，包括：
- 遮荫树、公共艺术和照明；
- 边缘是户外餐饮；
- 抬高的种植池，配座椅；
- 可以办夜市和文化活动。

CivicAlign 要回答的问题是：**这块广场的空间和预算，怎么在相互竞争的用途之间分配？** 这些用途包括树冠与降温、市集与活动、文化表达、儿童游戏、步行与骑行、路缘接驳和智慧基础设施。

## 仓库里有什么

1. **原型 v1**（`src/`、`dist/`）：three.js 大屏，展示片区 3D 模型。它在十个地块上对比两个示意方案，比较住房、温度、开放空间、出行和就业，每项结果标明责任方：Council 直接负责、共同负责、Council 倡导争取。界面可以切换中英文。
2. **v2 设计**（`docs/CHAT_HANDOFF_2026-11-15.md`）：已经商定的广场决策框架，包括：
   - 10 类用途，分为绿、活、行、智 4 大类；
   - 9 个影响维度，结果显示为区间；
   - 透明的 10 × 9 系数矩阵，AI 不产生数字；
   - 居民权重、低中高三种增长情景、2026、2036、2050 时间轴；
   - 约 3 分钟的居民端 5 屏流程，以及议会后台；
   - 与市政府 Smart City & Innovation Strategy 2024–2033 全部 18 项特征的对照。

v1 还没有实现 v2 的设计。

### v1 的数据状态

| 部分 | 状态 |
|---|---|
| 建筑、道路、铁路 | 观测数据，OpenStreetMap 2026-11-10 快照 |
| 片区边界 | 按 Council 的文字描述手描，与街道和铁路中线相差约 5 m 以内 |
| 十个地块 | 按规则挑选（片区内、5 层及以下、占地 300 m² 以上），不是总规点名的地块 |
| 住房、温度、出行、就业 | 按假设费率推算，**不是 Council 数据** |
| 方案 A / B | 示意性假设，**不是 Council 的提案** |
| 居民观察 | 三条示例，团队自拟 |
| 用户测试 | 还没做 |

## 负责任使用

- 占位数据一律标明。不是 Council 观测到的数据，就不当作观测数据展示。
- 模型输出是在明确假设下的区间，不是预测。
- AI 只负责起草通俗解释。所有决定由人来做，Council 要据以行动的内容必须经人审批。
- 不收集姓名、邮箱或精确住址，群体结果只在 10 人及以上时显示。

## 运行

直接用浏览器打开 `dist/index.html`。需要联网加载 three.js 和字体。

AI 通俗解读只在页面发布为 Claude artifact 时可用。它依赖 artifact 运行时的 `sample` 能力，用的是查看者自己的 Claude 用量。本地打开时这一块显示"不可用"，其余功能正常。

## 修改与构建

需要 Python 3，不用安装第三方包。

```bash
python scripts/build.py
```

- `src/template.html`：页面全部源码，包括样式、中英文文案、后果模型、three.js 场景和 AI 解读。数据填在 `__DATA__` 占位符处。
- `data/precinct.json`：处理后的片区几何，坐标是以片区为原点的本地米制。
- `dist/index.html`：独立页面。
- `dist/artifact.html`：发布为 Claude artifact 用的版本，发布时声明 `capabilities: {sample: {}}`。

## 重新生成片区数据

`scripts/build_data.py` 把 Overpass 的原始 JSON 转成 `data/precinct.json`。

```bash
curl -s -A "precinct-prototype/0.1" --data-urlencode 'data=[out:json][timeout:60];(way["building"](-33.8220,151.0000,-33.8150,151.0100);way["highway"](-33.8220,151.0000,-33.8150,151.0100);way["railway"="rail"](-33.8220,151.0000,-33.8150,151.0100);way["leisure"~"park|garden|playground"](-33.8220,151.0000,-33.8150,151.0100);way["landuse"~"grass|recreation_ground"](-33.8220,151.0000,-33.8150,151.0100);relation["building"](-33.8220,151.0000,-33.8150,151.0100););out body geom;' https://overpass-api.de/api/interpreter -o data/raw.json
```

```bash
python scripts/build_data.py data/raw.json data/precinct.json
```

片区边界多边形是 `build_data.py` 里的 `P`。

## 资料来源

- Draft CBD South Parramatta Precinct Master Plan：https://participate.cityofparramatta.nsw.gov.au/cbd-south-master-plan
- City of Parramatta，Smart City & Innovation Strategy 2024–2033：https://www.cityofparramatta.nsw.gov.au/files/assets/public/v/1/publications/smart-city-and-innovation-strategy.pdf
- Parramatta Possibilities 挑战简报，挑战 4

## 许可

代码采用 [MIT](LICENSE) 许可。

`data/precinct.json` 派生自 OpenStreetMap，© OpenStreetMap contributors，按 [ODbL](https://opendatacommons.org/licenses/odbl/) 许可使用。
