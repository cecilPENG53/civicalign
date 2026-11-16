# Languages in the demo

The globe menu in the demo's header offers the same 13 languages, in the same order, as the language menu on the City of Parramatta website (checked 16 Nov 2026): English (Australia), Chinese (Simplified), Chinese (Traditional), Korean, Hindi, Arabic, Tamil, Gujarati, Nepali, Tagalog (Filipino), Telugu, Persian and Punjabi.

| Language | Where the text comes from | Reviewed by a person? |
| --- | --- | --- |
| English, Chinese (Simplified) | Written by the team (`L(zh,en)` and `{zh,en}` in the source) | Yes, by the team |
| Chinese (Traditional) | `zh-Hant.json`: rule-based conversion of the Simplified text with OpenCC (`cn→twp`, Taiwan vocabulary, 臺 written 台) | **No** |
| The other 10 | `<code>.json`: machine translation of the English by Claude (AI), 16 Nov 2026 | **No** |

Every unreviewed language shows a banner under the header: "AI translation, not yet reviewed by a native speaker" (or, for Traditional Chinese, that it was converted automatically). Remove a language's banner only after a native speaker has reviewed its file.

## What stays the same in every language

- Quotes from Council documents (the source drawer and the evidence ledger) stay in their original English and are labelled as original wording.
- Source IDs and page numbers (S2 p.23), numbers and units.
- Street and place names: Woodhouse Square, Wentworth St, Church St and so on.
- If a string has no translation, the English is shown.

## How it works

- `variants/i18n.js` holds the picker and decides what `L(zh,en)` and `T({zh,en})` return. Other languages look up the English text. Keys with `{0}`, `{1}` are templates for strings that contain numbers or other text.
- `scripts/build_variants.js` inlines every table into the built pages, so a downloaded page still works offline.
- Arabic and Persian set `dir="rtl"`. The map, the 2.5D square, sliders and charts keep their west→east layout (see `variants/i18n.css`).
- Each script's Noto font (KR, TC, Devanagari, Arabic, Tamil, Gujarati, Telugu, Gurmukhi) loads from Google Fonts only when that language is chosen. Offline, system fonts are used.
- The choice is saved in `localStorage` (`cav_lang`), and `<html lang>` is set.

## Changing text

1. Edit the zh/en text as before, then run `node scripts/build_variants.js`.
2. Run `node scripts/i18n_extract.js` to refresh `_keys.json` (every English string the demo can show).
3. Run `node scripts/i18n_check.js` to list missing keys, or translations that dropped a `{0}` placeholder, an HTML tag or a source ID. Add the missing entries to each `<code>.json`. Until you do, those strings show in English.
4. To refresh Traditional Chinese, run `scripts/i18n_zh_hant.js` (it says how to install opencc-js).
5. Rebuild.

Chinese text belongs only on the Chinese side: the first argument of `L(zh,en)` or a `zh:` field. That includes Chinese punctuation (`。` `；` `：` `＋`) and units. Write a unit with words as `unit:{zh:"人",en:"people"}` and print it with `U(d)`. Never write a bilingual pair such as `"人 / people"`. Both build scripts run `scripts/cjk_guard.js` and fail if Chinese would show in the English interface, or if an English key or a non-Chinese translation contains Chinese. To check built pages by hand, run `node scripts/cjk_guard.js`.

## For reviewers

Each `<code>.json` maps English to translation, one line per string. Some sentences are split around a source chip, for example "…so deep soil is" + "unconfirmed". Check those in the page, not only in the file.
