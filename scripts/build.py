"""Assemble the page from src/template.html and data/precinct.json.

Writes two files:
  dist/artifact.html  body fragment, the form published as a Claude artifact
  dist/index.html     standalone page that opens in any browser
"""
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
template = (root / "src" / "template.html").read_text(encoding="utf-8")
data = (root / "data" / "precinct.json").read_text(encoding="utf-8")
assert template.count("__DATA__") == 1
page = template.replace("__DATA__", data)

head = (
    '<!doctype html><html><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>body{margin:0;font:14px system-ui}[hidden]{display:none!important}img{max-width:100%}</style>"
    "</head><body>"
)
dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "artifact.html").write_text(page, encoding="utf-8", newline="\n")
(dist / "index.html").write_text(head + page + "</body></html>", encoding="utf-8", newline="\n")
print("built", dist)
