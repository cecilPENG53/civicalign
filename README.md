# CivicAlign

**English** | [中文](README.zh-CN.md)

A decision storyboard for CBD South Parramatta. Built for Challenge 4, "Smarter decisions for a growing city", of the City of Parramatta's Parramatta Possibilities (Build with AI) innovation challenge, 2026.

CivicAlign helps a resident or a decision-maker understand **one growth trade-off in one place**: what each choice would change, what evidence supports it, how uncertain it is, and who is responsible for acting on it.

## The decision

The Draft CBD South Parramatta Precinct Master Plan (Phase 1, exhibited 11 May to 23 June 2026) proposes a new civic plaza off Wentworth Street, next to Parramatta Station. The exhibition page gives it as 1,300 m². The plan's p.22 scheme gives 1,200 m². This still needs checking against the final plan.

CivicAlign asks: **how should that plaza's space and budget be shared between competing uses?** The uses include tree canopy and cooling, markets and events, cultural expression, play, walking and cycling, kerb access and smart infrastructure.

## What is in this repository

This repository holds two things:

1. **Prototype v1** (`src/`, `dist/`). A three.js big-screen view of the precinct in 3D. It compares two illustrative options on ten parcels across housing, heat, open space, car trips and jobs. Each result is tagged with who is responsible: Council controls, Shared, or Council advocates. It has English and Chinese text.
2. **The v2 design** (`docs/CHAT_HANDOFF_2026-11-15.md`). This is the agreed framework for the plaza decision:
   - 10 uses in 4 groups: green, active, movement and smart.
   - 9 impact dimensions, shown as low–high ranges.
   - A transparent 10 × 9 coefficient matrix. AI does not produce numbers.
   - Resident weights, low, medium and high growth scenarios, and a 2026, 2036 and 2050 timeline.
   - A 5-screen resident flow of about 3 minutes, and a Council backend.
   - A mapping to all 18 characteristics in the City's Smart City & Innovation Strategy 2024–2033.

v1 does not implement the v2 design yet.

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
- AI only drafts plain-language explanations. People make every decision, and a person approves anything Council would act on.
- No names, emails or exact addresses are collected. Group results are shown only for groups of 10 or more.

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

## Sources

- Draft CBD South Parramatta Precinct Master Plan: https://participate.cityofparramatta.nsw.gov.au/cbd-south-master-plan
- City of Parramatta, Smart City & Innovation Strategy 2024–2033
- Parramatta Possibilities challenge brief, Challenge 4

## Licence

The code is under the [MIT](LICENSE) licence.

`data/precinct.json` is derived from OpenStreetMap, © OpenStreetMap contributors. It is used under the [ODbL](https://opendatacommons.org/licenses/odbl/).
