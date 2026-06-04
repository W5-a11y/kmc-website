#!/usr/bin/env python3
"""Quick checks for tech card hover wiring."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html = (root / "tech.html").read_text() if (root / "tech.html").exists() else ""
tech_css = (root / "tech.css").read_text() if (root / "tech.css").exists() else ""
hover_css = (root / "tech-card-hover.css").read_text() if (root / "tech-card-hover.css").exists() else ""
svg = root / "assets/tech/card-beta-hover-shapes.svg"

print("=== tech.html ===")
for name in ["tech.css", "tech-card-hover.css", "th-card__hover-reveal", "card-beta-hover-shapes.svg"]:
    print(f"  {name}:", name in html or (name.endswith(".svg") and svg.exists()))

print("\n=== tech.css ===")
print("  hl span width rules:", bool(re.search(r"th-card__hl", tech_css)))
print("  ::before hover blocks:", "title-hl::before" in tech_css)

print("\n=== tech-card-hover.css ===")
print("  clip-path reveal:", "clip-path" in hover_css)
print("  pseudo rectangles:", "title-hl::before" in hover_css)
print("  overlay svg exists:", svg.exists())
