# CivicAlign

**English** | [中文](README.zh-CN.md)

A decision storyboard for CBD South Parramatta. Built for Challenge 4, "Smarter decisions for a growing city", of the City of Parramatta's Parramatta Possibilities (Build with AI) innovation challenge, 2026.

CivicAlign helps a resident or a decision-maker understand **one growth trade-off in one place**: what each choice would change, what evidence supports it, how uncertain it is, and who is responsible for acting on it.

> **Live demo:** <https://civicalign.vvailabs.com> opens the latest resident demo in your browser, with nothing to download. Every push to `main` redeploys it.

> **The full framework, as one page:** [`docs/framework.html`](docs/framework.html). Download it and open it in a browser; GitHub shows only its source code. The detailed working notes, in Chinese, are in [`docs/CHAT_HANDOFF_2026-11-15.md`](docs/CHAT_HANDOFF_2026-11-15.md).

> **Try the demo:** download [`dist/variants/a-studio.html`](dist/variants/a-studio.html) and double-click it. There is nothing to install. See [Open the demo](#open-the-demo) below.

## 1. Why

| Problem | Approach | Result |
|---|---|---|
| Council has already done the professional work in the draft master plan [S2], the Council report [S4] and the Smart City Strategy [S5]. Each runs to dozens of pages, so residents do not read them. | Turn the documents into visual explanations organised by dimension. Let residents try alternatives to the plan. Collect their feedback. | A non-technical user understands the trade-off, the evidence, the uncertainty and who is responsible within 3 minutes [S1 p.12]. Council receives feedback with a representativeness check, plus a list of evidence gaps. |

The brief asks entries to build on Council's existing work, interpreting it and filling evidence gaps rather than duplicating it [S1 p.13].

## 2. The source rule

Every statement, question and number links back to a source document and page, written like **[S2 p.23]**. The sources are listed in the [source register](docs/SOURCES.md):

| ID | Source |
|---|---|
| S1 | Parramatta Possibilities challenge brief (6 Nov 2026) |
| S2 | Draft CBD South Parramatta Precinct Master Plan, Phase 1 |
| S3 | [Participate Parramatta project page](https://participate.cityofparramatta.nsw.gov.au/cbd-south-master-plan) |
| S4 | [Council report OCM26-56, 28 April 2026](https://docspublished.com.au/CityofParramatta/document/5bdbd20f-5ff3-43bc-97c4-1819402e9f6f) |
| S5 | [Smart City & Innovation Strategy 2024–2033](https://www.cityofparramatta.nsw.gov.au/files/assets/public/v/1/publications/smart-city-and-innovation-strategy.pdf) |

Inferences and team design choices are labelled as such. Any number without a source is marked as an assumption or placeholder, and is never shown as Council data [S1 p.3].

## 3. The decision

Council describes the master plan to residents through three deliverables [S3]:

1. **New City Square.** This is the decision. The plan calls it **Woodhouse Square** (a provisional name [S2 p.54]): 1,200 m² on Council-owned land facing Wentworth Street [S2 p.23]. The exhibition page says 1,300 m² [S3], so the figure needs checking against the final plan.
2. **Chinatown Nightlife Destination** [S2 p.33–41]. The square hosts its night markets and outdoor dining.
3. **Traffic Changes for Pedestrian Amenity** [S2 p.48–50]. These shape the square's edges, crossings and car park entry.

**Already decided by Council:**
- In 2025, Council tested a large park, a small convention centre, and a dining and nightlife precinct with a civic square. It chose the third [S4].
- Its options testing then picked a scheme with a plaza and put the plaza on Wentworth Street [S2 p.23].
- Both choices were scored against six urban design principles, P1–P6 [S2 p.22].

**Left open for residents:** how to share the square's space and budget. The plan lists the uses (shade trees, public art, lighting, flexible paving for night markets and events, outdoor dining at the edges, raised planters with seating [S2 p.44–45]) but not how much room each gets.

## 4. Resident storyboard: three parts, five screens, about three minutes

| Part | Screen | Content |
|---|---|---|
| 1. What the plan says | 1. Who I am and what I care about | Language, role, age band and postcode only [S5 p.30]. The resident picks three dimensions to weight. |
| | 2. The plan, and what do you think? | One card per deliverable: what is planned, what Council ruled out, and what is still open. Every claim opens to its source page. |
| 2. What if it were shared differently | 3. Share the square | Start from **baseline scenario 0, the plan as drawn**, then adjust 4 groups that open into 10 uses. |
| | 4. Results | 9 impact ranges, each compared with scenario 0, over a 2026 → 2036 → 2041 → 2050 timeline and low, medium and high growth. |
| 3. Your view and who decides | 5. Who decides, and submit | Council delivers, partners or advocates [S5 p.33]. The resident adds their own experience. No name, email or address. |

If no source gives a number, the page says so ("the plan gives no figure", "awaiting the traffic study") and the AI does not fill it in.

## 5. Uses, dimensions and model

- **10 uses in 4 groups.**
  - Green: canopy (deep soil or planters), blue-green infrastructure.
  - Active: events and night markets, cultural expression, rest and play.
  - Movement: walking and access, bike parking, kerb access.
  - Smart: smart infrastructure, circular-economy point.
- **9 dimensions:** heat comfort, stormwater, economic activity, access and movement, perceived safety, inclusion, culture and social life, cost, carbon and resources.
- **Transparent formula:** `I_j = Σ a_i × c_ij`, given as a low–high range, and fit `S = Σ w_j × Î_j`.
  - Each of the 90 coefficients is labelled literature or assumption.
  - AI never produces numbers.
- **Coverage:** the dimensions are checked against all 18 smart-city characteristics in the strategy's Figure 1 [S5 p.18]. 9 are covered, 3 partly covered, 3 handled by the tool's own process, and 3 are not affected by this decision.

## 6. Council backend: report upload and claim review

1. A planner uploads a Council PDF, such as S2, S4 or a technical study.
2. AI extracts claims. Each claim must carry its source, page and quote, or it is dropped.
3. The planner approves, edits or rejects each claim. The tool records who approved it and when.
4. Only approved claims reach residents.
5. Figures that no source provides go on an **evidence-gap list** for Council.

The backend also does three more things:
- checks resident proposals against P1–P6;
- reports results only for groups of 10 or more, with a representativeness check against the ABS Census;
- drafts advocacy briefs, which a person approves.

## 7. Strategy alignment

The tool links to actions under the strategy's six priorities [S5 p.8–9]: 1.2.2, 2.1.1, 2.1.2, 2.1.4, 2.2.2, 3.1.2, 3.1.3, 4.1.2, 4.1.3, 4.2.1, 5.1.3, 6.1.1, 6.2.2 and 6.3.2.

Several of the strategy's indicators have the baseline "TBC" [S5 p.39–63], and resident input can help set them:
- satisfaction with climate adaptation;
- views on public and active transport;
- smart infrastructure in public domain projects;
- satisfaction with wayfinding.

## 8. Evidence gaps and open questions

- **No traffic model exists yet.** Traffic modelling comes after Phase 2, with consultant engagement planned for FY27/28 [S2 p.54][S4].
- **Funding for the square is not settled** [S2 p.54].
- **Two figures for the square's size:** 1,200 m² [S2 p.23] versus 1,300 m² [S3].
- **Soil under the square is unknown.** It is not clear whether the new car park sits under it, or whether the raised planters mean there is no deep soil [S2 p.45].
- **Undecided by the team:** route B (allocate the square only) or route C (choose the building scheme first, then allocate the square).

## Prototype v2 (built 15 Nov 2026)

`dist/civicalign.html` is a clickable prototype of the resident storyboard and a demo Council view. Open it in a browser. It is built from `app/template.html` with `node scripts/build_app.js`, which inlines `data/precinct.json` for the base map.

- **Screen 2:** every Council fact opens to its source, page and original wording.
- **Screens 3–4:** the coefficients and Scenario 0 split are labelled team assumptions.
- **Submissions:** stay in the viewer's browser and are not sent anywhere.
- **Council view:** its ledger entries were checked by the team. Council has not approved them.

## Open the demo

The demo for the submission is **`dist/variants/a-studio.html`**. It is a single HTML file with everything inside it, so there is nothing to install.

1. Open [`dist/variants/a-studio.html`](dist/variants/a-studio.html) on GitHub and click **Download raw file** (the download icon above the code). Or use **Code → Download ZIP** for the whole repository and unzip it.
2. Double-click the downloaded file. It opens in your web browser.

It works offline. With an internet connection it also loads the web fonts; without one it falls back to system fonts. Feedback typed into it stays in that browser.

What it shows, from top to bottom:

- **Story:** the map reframes and highlights places as you scroll, then the three deliverables and Council's decision path.
- **2.5D studio:** a game-style isometric Woodhouse Square. Its 48 tiles of about 25 m² change into trees, market stalls, benches and paths as you drag the linked sliders. Tree crowns grow by year. There is a night-market view.
- **Results:** all nine dimensions against Scenario 0, as comparison bars or pictograms.
- **Your say (pick and vote, no typing needed):**
  - *Council says vs you see.* Tick the situations you have run into, under three tabs: square, Chinatown and traffic. Each item pairs a team-written example (labelled as one, not a real resident report) with what Council says, cited to source and page. Where no source gives a figure, the item says "no official figure · evidence gap". You can add your own item by tapping a place and an issue.
  - *Pick one of two.* Eight quick rounds of "which use should get 100 m² more?" across the 10 uses, which give you a ranking.
  - Free-text feedback is still there as an optional extra. Vote counts are **simulated** (source D1 in `docs/SOURCES.md`): 96 seeded synthetic respondents, labelled "Simulated" on every count, plus your own votes, marked "your vote". A toggle switches to "only my votes", which start at 0. "About this data" explains the method and how real data would be collected through Participate Parramatta, QR signs and library tablets. Items you add appear only to people using the same browser. The demo has no server.
- **Council backend tab:** tallies by option and by role, and age-band counts, each with its source and its D/P/A role. The 10-person threshold applies to each group, so the 8 simulated visitors stay hidden. Every tally is labelled "Simulated".
- **Other tabs:** a demo Council backend and the evidence ledger.

The square's layout is indicative, not a design. Model values are ranges from team assumptions, and every Council fact opens to its source.

Two other design directions sit beside it: `b-scroll.html` (scroll story only) and `c-map.html` (map-first). `index.html` compares them. All four are built with `node scripts/build_variants.js` from the sources in `variants/`. That script takes the content and model straight from `app/template.html`, so they always match prototype v2.

## What is in this repository

| Path | What it is |
|---|---|
| `docs/framework.html` | The full framework as one page |
| `docs/CHAT_HANDOFF_2026-11-15.md` | Detailed design notes with sources, in Chinese |
| `docs/SOURCES.md` | Source register |
| `dist/variants/a-studio.html` | **The demo:** scroll story and 2.5D studio |
| `variants/`, `dist/variants/`, `scripts/build_variants.js` | Three design directions and their comparison page |
| `app/`, `dist/civicalign.html`, `scripts/build_app.js` | Prototype v2 |
| `src/`, `dist/index.html`, `data/`, `scripts/` | Prototype v1 |

**Prototype v1** is a three.js big-screen view of the precinct in 3D. It compares two illustrative options on ten parcels across housing, heat, open space, car trips and jobs, and tags each result with who is responsible. It has English and Chinese text. **v1 does not implement the framework above yet.**

### Status of v1 data

| Part | Status |
|---|---|
| Buildings, roads, rail | Observed: OpenStreetMap snapshot, 2026-11-10 |
| Precinct boundary | Traced by hand from the Council's description; within about 5 m of the street and rail centrelines |
| Ten parcels | Picked by a rule (inside the precinct, 5 storeys or fewer, footprint over 300 m²). The master plan does not name them. |
| Housing, heat, trips, jobs | Estimated from assumed rates. **This is not Council data.** |
| Options A and B | Illustrative assumptions. **These are not Council proposals.** |
| Community observations | Three sample entries written by the team |
| User testing | Not done yet |

## Responsible use

- Placeholder data is labelled as such. Nothing is shown as observed Council data unless it is.
- Model output is a range under stated assumptions, not a forecast.
- AI extracts claims with citations, rewrites explanations and drafts briefs. It produces no numbers, makes no decisions and publishes nothing without a person's approval.
- Only the minimum data is collected [S5 p.30]: no names, emails or exact addresses. Group results are shown only for groups of 10 or more.

## Run

Open `dist/index.html` in a browser. It needs an internet connection to load three.js and the fonts.

The AI plain-language summary works only when the page is published as a Claude artifact. It uses the artifact runtime's `sample` capability and the viewer's own Claude usage. Opened locally, that panel shows "not available" and everything else still works.

## Edit and build

You need Python 3. There are no third-party packages.

```bash
python scripts/build.py
```

- `src/template.html` holds the full page source: styles, English and Chinese text, the consequence model, the three.js scene and the AI summary. The data goes where the `__DATA__` placeholder is.
- `data/precinct.json` holds the processed precinct geometry, in local metres with the precinct as the origin.
- `dist/index.html` is the standalone page.
- `dist/artifact.html` is the version for publishing as a Claude artifact. Declare `capabilities: {sample: {}}` when you publish it.

## Regenerate precinct data

`scripts/build_data.py` turns raw Overpass JSON into `data/precinct.json`.

```bash
curl -s -A "precinct-prototype/0.1" --data-urlencode 'data=[out:json][timeout:60];(way["building"](-33.8220,151.0000,-33.8150,151.0100);way["highway"](-33.8220,151.0000,-33.8150,151.0100);way["railway"="rail"](-33.8220,151.0000,-33.8150,151.0100);way["leisure"~"park|garden|playground"](-33.8220,151.0000,-33.8150,151.0100);way["landuse"~"grass|recreation_ground"](-33.8220,151.0000,-33.8150,151.0100);relation["building"](-33.8220,151.0000,-33.8150,151.0100););out body geom;' https://overpass-api.de/api/interpreter -o data/raw.json
```

```bash
python scripts/build_data.py data/raw.json data/precinct.json
```

The precinct boundary polygon is `P` in `build_data.py`.

## Licence

The code is under the [MIT](LICENSE) licence.

`data/precinct.json` is derived from OpenStreetMap, © OpenStreetMap contributors. It is used under the [ODbL](https://opendatacommons.org/licenses/odbl/).
