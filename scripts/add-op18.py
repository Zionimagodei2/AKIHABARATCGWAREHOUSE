#!/usr/bin/env python3
"""
Add OP-18 "The Dominance of God" (English ONE PIECE CARD GAME) listings:
  - 275: Booster Box  (pre-order, market ~$384-400, TCGplayer market $396.19)
  - 276: Sealed Case of 12 boxes (store case multiplier 10.3-11.6x box price)

Market facts (verified 2026-09-24 via TCGplayer / Saga Concepts / Universe TCG /
Castle Games / ToyWiz / samuraiswordtokyo):
  - Set name: "The Dominance of God" (next mainline booster after OP-17)
  - Status: PRE-ORDER open market-wide; English presale est. shipping 11/20/2026
  - Structure: 24 packs per box, 12 boxes (288 packs) per case
  - Theme: God's Knights and a brand-new theme (per official product blurb)

Idempotent: skips products whose id already exists.
Also mirrors the box art to op-18-sc.webp for the case image.
"""
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "public" / "products.json"
IMG_DIR = ROOT / "public" / "images" / "onepiece-english"

now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

BOX_DESC = (
    "Pre-order the OP-18 The Dominance of God English Booster Box for the ONE PIECE "
    "CARD GAME. The Dominance of God is the eighteenth main expansion, following OP-17 "
    "The World's Strongest Warriors, and is one of the most anticipated English One "
    "Piece releases of 2026. Each factory-sealed booster box contains 24 booster packs "
    "pulling you into the God's Knights storyline with a brand-new theme, leader cards "
    "and alt-art chase cards. This is a pre-order product: the official English release "
    "is estimated for November 2026 and orders ship as soon as stock arrives from "
    "Bandai. Ideal for collectors, players, TCG stores, breakers and resellers searching "
    "for the latest English One Piece booster products. Reserve your OP-18 booster box "
    "now to lock in launch allocation. Authentic Bandai product, secure packaging and "
    "worldwide tracked shipping."
)

CASE_DESC = (
    "Pre-order the OP-18 The Dominance of God Sealed Case - a factory-sealed English "
    "ONE PIECE CARD GAME case containing 12 booster boxes (288 booster packs total) "
    "from The Dominance of God expansion, the eighteenth main set of the One Piece Card "
    "Game. Buying by the case is the best way to guarantee launch-day allocation for "
    "this high-demand November 2026 release, and factory-sealed cases are the preferred "
    "format for collectors, TCG stores, breakers and resellers looking to purchase "
    "sealed English One Piece booster boxes in bulk. Open packs, build a complete "
    "master set or hold sealed inventory for resale. This is a pre-order product: the "
    "official English release is estimated for November 2026 and orders ship as soon as "
    "stock arrives from Bandai. Shop authentic English One Piece products with secure "
    "packaging, tracked worldwide shipping and competitive supplier pricing."
)

NEW_PRODUCTS = [
    {
        "id": "275",
        "title": "OP-18 The Dominance of God Booster Box English ONE PIECE CARD",
        "price": 389.99,
        "original_price": 439.99,
        "image": "/images/onepiece-english/op-18-bb.webp",
        "category": "English One Piece",
        "categories": ["English One Piece", "Booster Boxes"],
        "rating": 4.5,
        "in_stock": True,
        "description": BOX_DESC,
        "created_at": now,
        "updated_at": now,
        "sort_order": 1,
    },
    {
        "id": "276",
        "title": "OP-18 The Dominance of God Sealed Case (12 Boxes) \u2013 English ONE PIECE CARD",
        "price": 4299.00,
        "original_price": 4699.00,
        "image": "/images/onepiece-english/op-18-sc.webp",
        "category": "English One Piece",
        "categories": ["English One Piece", "Sealed Case"],
        "rating": 4.5,
        "in_stock": True,
        "description": CASE_DESC,
        "created_at": now,
        "updated_at": now,
        "sort_order": 2,
    },
]


def main() -> None:
    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    existing_ids = {str(p.get("id")) for p in products}
    existing_titles = {str(p.get("title")) for p in products}

    added = 0
    for np in NEW_PRODUCTS:
        if str(np["id"]) in existing_ids or np["title"] in existing_titles:
            print(f"skip (already present): {np['id']} {np['title'][:60]}")
            continue
        products.append(np)
        added += 1
        print(f"added: {np['id']} | {np['title']}")
        print(f"       price {np['price']} (orig {np['original_price']}) | "
              f"subcat {np['categories'][1]} | sort_order {np['sort_order']}")

    if added:
        PRODUCTS.write_text(
            json.dumps(products, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"products.json updated: {len(products)} total rows (+{added})")

    # Case image: OP-18 cases are not physically photographed yet (presale) -
    # mirror the verified booster box packaging art, standard presale practice.
    bb = IMG_DIR / "op-18-bb.webp"
    sc = IMG_DIR / "op-18-sc.webp"
    if bb.exists() and not sc.exists():
        shutil.copyfile(bb, sc)
        print("case image: mirrored op-18-bb.webp -> op-18-sc.webp")
    elif sc.exists():
        print("case image: op-18-sc.webp already present")
    else:
        print("WARNING: op-18-bb.webp missing - case image NOT created", file=sys.stderr)
        sys.exit(1)

    # sanity: every product still has required keys
    for p in products:
        for k in ("id", "title", "price", "image", "category", "categories", "in_stock"):
            if k not in p:
                print(f"VALIDATION FAIL: {p.get('id')} missing {k}", file=sys.stderr)
                sys.exit(1)
    print("validation: all rows have required keys")


if __name__ == "__main__":
    main()
