"""Build the browser-only demo: one self-contained HTML file, no server or install needed.

    python3 static-demo/build.py                 # writes static-demo/appeals-demo.html
    python3 static-demo/build.py --fragment X    # also writes a body-only version (for hosting)

The page bundles the frontend (web/), the in-page engine (static-demo/engine.js), the seed
documents, the canned agent responses and the config files. It runs in demo mode only.
Re-run this after changing anything in web/, seed/, demo_responses/ or config/.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ["intake", "triage", "evidence", "coding", "drafting", "qa"]
DOCS = ["denial_letter", "clinical_notes", "claim_data", "payer_policy"]


def collect() -> dict:
    seed_src = (ROOT / "app" / "seed.py").read_text()
    seed_order = json.loads(re.search(r"SEED_ORDER = (\[.*?\])", seed_src).group(1).replace("'", '"'))
    samples = {}
    for key in seed_order:
        folder, canned_dir = ROOT / "seed" / key, ROOT / "demo_responses" / key
        samples[key] = {
            "meta": json.loads((folder / "meta.json").read_text()),
            "docs": {d: (folder / f"{d}.txt").read_text() for d in DOCS},
            "canned": {a: (canned_dir / f"{a}.json").read_text() for a in AGENTS if (canned_dir / f"{a}.json").exists()},
            "letter": (canned_dir / "letter.txt").read_text(),
        }
    return {
        "seed_order": seed_order,
        "samples": samples,
        "pricing": json.loads((ROOT / "config" / "pricing.json").read_text()),
        "practices": json.loads((ROOT / "config" / "practices.json").read_text())["practices"],
    }


def script(js: str) -> str:
    return "<script>\n" + js.replace("</script", "<\\/script") + "\n</script>"


def build_body() -> str:
    html = (ROOT / "web" / "index.html").read_text()
    body = html[html.index("<body>") + len("<body>"):html.index("</body>")]
    body = re.sub(r'\s*<script src="app.js"></script>', "", body)
    body = body.replace("PROTOTYPE &ndash; FICTIONAL DATA &middot;",
                        "PROTOTYPE &ndash; FICTIONAL DATA &middot; Browser demo version &middot;")
    fonts = re.search(r'<link rel="stylesheet" href="https://fonts[^>]+>', html).group(0)
    data = json.dumps(collect(), separators=(",", ":")).replace("</", "<\\/")
    return "\n".join([
        "<title>Appeals Prototype</title>",
        fonts,
        "<style>\n" + (ROOT / "web" / "styles.css").read_text() + "\n</style>",
        body.strip(),
        "<script>window.APPEALS_DATA = " + data + ";</script>",
        script((ROOT / "static-demo" / "engine.js").read_text()),
        script((ROOT / "web" / "app.js").read_text()),
    ])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fragment", help="also write a body-only version to this path")
    args = ap.parse_args()
    body = build_body()
    out = ROOT / "static-demo" / "appeals-demo.html"
    out.write_text('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                   '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                   "</head>\n<body>\n" + body + "\n</body>\n</html>\n")
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")
    if args.fragment:
        Path(args.fragment).write_text(body + "\n")
        print(f"Wrote {args.fragment}")


if __name__ == "__main__":
    main()
