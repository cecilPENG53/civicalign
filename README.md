# CBD South Growth Sandbox / CBD South 增长权衡沙盘

Parramatta Possibilities（Build with AI Innovation Challenge）挑战 4 的原型草稿。

一个 three.js 大屏：在 CBD South Parramatta 片区的 3D 模型上，把十个地块改建成两种方案，对比住房、温度、公园、出行和商铺的变化区间，并看清每项后果由谁负责。支持中英文切换。

## 现状

这是草稿，不是成品。

| 部分 | 状态 |
|---|---|
| 建筑、道路、铁路 | 观测数据，OpenStreetMap 2026-11-10 快照 |
| 片区边界 | 按 Council 文字描述手描，未与规划文件核对 |
| 十个可改建地块 | 按规则挑选（片区内 5 层及以下、占地 300 m² 以上），不是 master plan 点名的地块 |
| 住房、温度、出行、商铺面积 | 假费率推算，不是 Council 数据 |
| 方案 A / B | 示意性假设，不是 Council 的提案 |
| 居民观察 | 三条示例，团队自拟 |
| 用户测试 | 未做 |

## 运行

直接用浏览器打开 `dist/index.html`。需要联网加载 three.js 和字体。

AI 通俗解读只在作为 Claude artifact 发布时可用（依赖 artifact 运行时的 `sample` 能力，花的是查看者自己的 Claude 用量）。本地打开时这一块会显示"不可用"，其余功能正常。

## 修改与构建

需要 Python 3，无第三方依赖。

```bash
python scripts/build.py
```

- `src/template.html`：页面全部源码（样式、中英文文案、后果模型、three.js 场景、AI 解读）。数据位置是 `__DATA__` 占位符。
- `data/precinct.json`：处理后的片区几何，坐标为以片区为原点的本地米制。
- `dist/index.html`：独立页面。
- `dist/artifact.html`：发布为 Claude artifact 用的片段（发布时声明 `capabilities: {sample: {}}`）。

## 重新生成片区数据

`scripts/build_data.py` 把 Overpass 的原始 JSON 转成 `data/precinct.json`。

```bash
curl -s -A "precinct-prototype/0.1" --data-urlencode 'data=[out:json][timeout:60];(way["building"](-33.8220,151.0000,-33.8150,151.0100);way["highway"](-33.8220,151.0000,-33.8150,151.0100);way["railway"="rail"](-33.8220,151.0000,-33.8150,151.0100);way["leisure"~"park|garden|playground"](-33.8220,151.0000,-33.8150,151.0100);way["landuse"~"grass|recreation_ground"](-33.8220,151.0000,-33.8150,151.0100);relation["building"](-33.8220,151.0000,-33.8150,151.0100););out body geom;' https://overpass-api.de/api/interpreter -o data/raw.json
```

```bash
python scripts/build_data.py data/raw.json data/precinct.json
```

片区边界多边形写在 `build_data.py` 的 `P` 里。

## 数据许可

`data/precinct.json` 派生自 OpenStreetMap，© OpenStreetMap contributors，按 [ODbL](https://opendatacommons.org/licenses/odbl/) 许可使用。
