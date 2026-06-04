#!/usr/bin/env python3
"""Quick audit: tech page CSS wiring and selector coverage."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
html = (root / "tech.html").read_text() if (root / "tech.html").exists() else ""
tech_css = (root / "tech.css").read_text() if (root / "tech.css").exists() else ""
hover_css = (root / "tech-card-hover.css").read_text() if (root / "tech-card-hover.css").exists() else ""

print("=== tech.html ===")
print("exists:", bool(html))
for name in ["tech.css", "tech-card-hover.css", "id=\"tech-projects\"", "th-card__info", "th-card__title-hl"]:
    print(f"  {name}:", name in html)

print("\n=== tech.css ===")
print("  @import tech-card-hover:", "@import" in tech_css and "tech-card-hover" in tech_css)
print("  active hover span width rules:", bool(re.search(r'^[^/\n].*:hover.*width:', tech_css, re.M)))
print("  commented hover block:", "REMOVED — per-span hover" in tech_css)

print("\n=== tech-card-hover.css ===")
print("  exists:", bool(hover_css))
print("  ::before content on hover:", "title-hl::before" in hover_css)
print("  article:first-of-type:", "article:first-of-type" in hover_css)
print("  z-index: -1 (bad):", "z-index: -1" in hover_css)

print("\n=== GitHub main ===")
print("  tech.html on main: NO (only on cursor/tech-card-hover-7d7e branch)")
