# CivicAlign

[English](README.md) | **中文**

CBD South Parramatta 的决策故事板。参赛项目：City of Parramatta "Parramatta Possibilities"（Build with AI）创新挑战 2026，挑战 4"Smarter decisions for a growing city"（更聪明地为增长中的城市做决策）。

CivicAlign 帮居民或决策者看懂**一个地点的一个增长取舍**：每种选择会改变什么，依据是什么，有多不确定，以及该由谁负责。

> **在线演示：** <https://civicalign.vercel.app>，浏览器打开就是最新的居民演示，不用下载。每次推送到 `main` 都会自动重新部署。

> **完整思路框架（单页）：** [`docs/framework.html`](docs/framework.html)。下载后用浏览器打开，GitHub 上只显示源码。详细的设计记录见 [`docs/CHAT_HANDOFF_2026-11-15.md`](docs/CHAT_HANDOFF_2026-11-15.md)。

> **试用演示：** 下载 [`dist/variants/a-studio.html`](dist/variants/a-studio.html)，双击打开即可，不用安装。详见下文[打开演示](#打开演示)。

## 1. 为什么做

| 问题 | 做法 | 产出 |
|---|---|---|
| Council 已经做了专业工作，内容在总规草案〔S2〕、Council 报告〔S4〕和智慧城市战略〔S5〕里，但每份都几十页，普通居民读不动 | 把这些文件按多个维度做成可视化讲解；让居民在总规方案上试着调整；收集反馈 | 非技术用户 3 分钟内看懂取舍、证据、不确定性和责任方〔S1 p.12〕；Council 拿到附代表性说明的反馈和一份证据空白清单 |

简报要求参赛方案在 Council 已有成果的基础上做整合、解读和补证据空白，而不是重做〔S1 p.13〕。

## 2. 来源规则

每一条内容、每个问题、每个数字都能追溯到原文和页码，格式为 **〔S2 p.23〕**。来源见[来源登记表](docs/SOURCES.md)：

| 编号 | 来源 |
|---|---|
| S1 | Parramatta Possibilities 挑战简报（2026-11-06） |
| S2 | Draft CBD South Parramatta Precinct Master Plan（第一期） |
| S3 | [Participate Parramatta 项目页](https://participate.cityofparramatta.nsw.gov.au/cbd-south-master-plan) |
| S4 | [Council 报告 OCM26-56（2026-04-28）](https://docspublished.com.au/CityofParramatta/document/5bdbd20f-5ff3-43bc-97c4-1819402e9f6f) |
| S5 | [Smart City & Innovation Strategy 2024–2033](https://www.cityofparramatta.nsw.gov.au/files/assets/public/v/1/publications/smart-city-and-innovation-strategy.pdf) |

推断和团队的设计决定会单独标明。没有来源的数字只能标"假设"或"假数据"，不能当作 Council 数据展示〔S1 p.3〕。

## 3. 决策

Council 向居民介绍总规时用了三项交付内容〔S3〕：

1. **New City Square（新市民广场）**：这就是我们的决策。总规里叫 **Woodhouse Square**（暂定名〔S2 p.54〕），位于 Council 自有土地上、临 Wentworth Street，面积 1,200 m²〔S2 p.23〕。公示页面写的是 1,300 m²〔S3〕，要用最终版总规核实。
2. **Chinatown Nightlife Destination（唐人街夜生活目的地）**〔S2 p.33–41〕：广场要承接夜市和户外餐饮。
3. **Traffic Changes for Pedestrian Amenity（为行人改造交通）**〔S2 p.48–50〕：决定了广场边缘的路缘、过街和停车场入口。

**Council 已经定了的：**
- 2025 年测试过三种方向：大公园、小型会展中心、餐饮夜生活加市民广场，最后选了第三种〔S4〕；
- 方案比选选了带广场的楼栋方案，并把广场放在 Wentworth Street 一侧〔S2 p.23〕；
- 两次比选都用 6 条城市设计原则 P1–P6 打分〔S2 p.22〕。

**留给居民的：** 广场的空间和预算怎么分。总规写了有哪些功能（遮荫树、公共艺术、照明、可办夜市和活动的灵活硬地、边缘户外餐饮、抬高种植池配座椅〔S2 p.44–45〕），但没写各占多少。

## 4. 居民端：三段 5 屏，约 3 分钟

| 段 | 屏 | 内容 |
|---|---|---|
| ① 总规说了什么 | 1 我是谁、我在乎什么 | 只收语言、身份、年龄段、邮编〔S5 p.30〕；选 3 个最在乎的维度作为权重 |
| | 2 总规讲解 + 你觉得呢 | 按三项交付内容分三张卡片：安排了什么、Council 排除了什么、还有什么没定。每条都能点开看原文页码 |
| ② 换一种分法会怎样 | 3 分配广场 | 从**基准方案 0"总规原样"**开始，调整 4 大类，可展开到 10 类用途 |
| | 4 结果 | 9 个维度的区间，都和方案 0 对比；时间轴 2026 → 2036 → 2041 → 2050；低、中、高三种增长情景 |
| ③ 你怎么看、谁负责 | 5 谁说了算 + 提交 | Council 直接负责 / 合作 / 倡导〔S5 p.33〕；居民写下自己的经验；不收姓名、邮箱或住址 |

来源里没有的数字，页面会明确写"总规没有给出"或"待交通研究核实"，不让 AI 补。

## 5. 模块、维度与模型

- **10 类用途，分 4 大类：**
  - 绿：树冠（深土 / 种植池）、蓝绿基础设施；
  - 活：活动与夜市、文化表达、休憩与游戏；
  - 行：步行与无障碍、自行车停放、路缘接驳；
  - 智：智慧基础设施、循环经济节点。
- **9 个维度：** 热舒适、雨洪、经济活力、可达与通行、安全感、包容、文化与社交、成本、碳与资源。
- **透明公式：** `I_j = Σ a_i × c_ij`，结果显示为高低区间；契合度 `S = Σ w_j × Î_j`。90 个系数逐个标"文献"或"假设"；AI 不产生数字。
- **覆盖检查：** 对照战略图 1 的 18 项智慧城市特征〔S5 p.18〕：直接覆盖 9 项，部分覆盖 3 项，由工具流程实现 3 项，不受这个决策影响 3 项。

## 6. 议会后台：报告上传与逐条核对

1. 规划师上传 Council 的 PDF，如 S2、S4 或专项研究；
2. AI 逐条提取结论，每条必须附来源、页码和原文，否则不收录；
3. 规划师逐条批准、修改或驳回，系统记录批准人和时间；
4. 只有批准过的条目进入居民端；
5. 来源里没有的数字列入**证据空白清单**，交给 Council。

后台还有：
- P1–P6 原则检查；
- 群体汇总（10 人及以上才显示，对比 ABS 人口结构）；
- AI 起草、人工审批的倡导简报。

## 7. 战略对齐

工具挂靠战略 6 项优先事项〔S5 p.8–9〕下的这些行动：1.2.2、2.1.1、2.1.2、2.1.4、2.2.2、3.1.2、3.1.3、4.1.2、4.1.3、4.2.1、5.1.3、6.1.1、6.2.2、6.3.2。

战略里有几项指标的基线写着"待定"〔S5 p.39–63〕，居民的输入可以帮 Council 建立这些基线：
- 对气候适应措施的满意度；
- 对公共交通和主动出行的感受；
- 公共领域项目里智慧基础设施的占比；
- 对寻路的满意度。

## 8. 证据空白与待定事项

- **交通模型还没做：** 要等第二期之后，FY27/28 才聘顾问〔S2 p.54〕〔S4〕；
- **广场资金未定**〔S2 p.54〕；
- **面积有两个数字：** 1,200 m²〔S2 p.23〕和 1,300 m²〔S3〕；
- **广场下方情况不明：** 是否有停车场、种植池是否因为没有深土〔S2 p.45〕；
- **团队待定：** 路线 B（只做广场分配）还是路线 C（先选楼栋方案，再分配广场）。

## 原型 v2（2026-11-15）

`dist/civicalign.html` 是可点击的居民故事板原型，附 Council 后台演示，直接用浏览器打开即可。它由 `app/template.html` 生成，生成命令是 `node scripts/build_app.js`，底图数据来自 `data/precinct.json`。

- **第 2 屏：** 每条 Council 事实都能点开看来源、页码和原文。
- **第 3–4 屏：** 系数和方案 0 的比例都标为团队假设。
- **提交：** 演示提交只保存在浏览器里，不发送给任何人。
- **后台：** 核对清单由团队核对，不是 Council 批准的。

## 打开演示

参赛演示是 **`dist/variants/a-studio.html`**。它是一个单独的 HTML 文件，所有内容都在里面，不用安装任何东西。

1. 在 GitHub 上打开 [`dist/variants/a-studio.html`](dist/variants/a-studio.html)，点代码上方的下载图标 **Download raw file**。也可以点 **Code → Download ZIP** 下载整个仓库再解压。
2. 双击下载好的文件，它会在浏览器里打开。

断网也能用：联网时会加载网页字体，断网时改用系统字体。在里面填写的意见只保存在这台浏览器里。

从上往下依次是：

- **故事：** 地图随滚动缩放和高亮，接着是三件事和 Council 的决策经过。
- **2.5D 工作台：** 游戏风格的等距视角 Woodhouse Square。拖动联动滑杆时，48 块约 25 m² 的地砖会变成树、夜市摊、座椅或步行道。树冠随年份长大，还可以切到夜市夜景。
- **结果：** 9 项结果和方案 0 对比，可以切换对比条和图示两种显示。
- **意见：** 谁负责（D/P/A）和反馈表。
- **另外两个标签：** Council 后台演示和证据台账。

广场布局只是示意，不是设计方案。模型数值是按团队假设算出的区间；每条 Council 事实都能点开看原文出处。

同一目录下还有另外两个设计方向：`b-scroll.html`（纯故事卷轴）和 `c-map.html`（地图优先），`index.html` 是三者的对比页。这四个文件都由 `node scripts/build_variants.js` 根据 `variants/` 里的源文件生成。这个脚本直接从 `app/template.html` 取内容和模型，所以和原型 v2 始终一致。

## 仓库里有什么

| 路径 | 内容 |
|---|---|
| `docs/framework.html` | 完整思路框架（单页） |
| `docs/CHAT_HANDOFF_2026-11-15.md` | 详细设计记录，每条附来源 |
| `docs/SOURCES.md` | 来源登记表 |
| `dist/variants/a-studio.html` | **演示：** 故事卷轴 + 2.5D 工作台 |
| `variants/`、`dist/variants/`、`scripts/build_variants.js` | 三个设计方向和对比页 |
| `app/`、`dist/civicalign.html`、`scripts/build_app.js` | 原型 v2 |
| `src/`、`dist/index.html`、`data/`、`scripts/` | 原型 v1 |

**原型 v1**：three.js 大屏，展示片区 3D 模型。它在十个地块上对比两个示意方案，比较住房、温度、开放空间、出行和就业，每项结果标明责任方；界面可以切换中英文。**v1 还没有实现上面的框架。**

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
- AI 只做三件事：带引用提取结论、改写讲解措辞、起草简报。它不产生数字，不替人做决定，不经人工批准不发布。
- 只收最少必要数据〔S5 p.30〕：不收姓名、邮箱或精确住址；群体结果只在 10 人及以上时显示。

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

## 许可

代码采用 [MIT](LICENSE) 许可。

`data/precinct.json` 派生自 OpenStreetMap，© OpenStreetMap contributors，按 [ODbL](https://opendatacommons.org/licenses/odbl/) 许可使用。
