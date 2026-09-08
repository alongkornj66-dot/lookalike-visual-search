"""
Generate a synthetic product image catalog for the Visual & Style Search demo.

Why synthetic images instead of scraped/real product photos?
- No licensing/copyright concerns (safe to ship in a portfolio project)
- No network dependency to build the dataset
- Deterministic: same run always produces the same catalog + images,
  which makes the embedding/similarity pipeline easy to reason about
  and demo reliably during an interview.

Each product is a simple vector-style icon (t-shirt, dress, shoe, bag, hat)
rendered with a distinct color + pattern combination. Visually similar
products (same silhouette, similar color family) are grouped in
products.json so the "find similar" demo has an obviously-correct answer
to sanity check against.
"""

import json
import math
import os
import random

from PIL import Image, ImageDraw

random.seed(42)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)
IMAGES_DIR = os.path.join(ROOT, "backend", "public", "images")
DATA_DIR = os.path.join(ROOT, "backend", "src", "data")
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

CANVAS = 512
BG = (247, 246, 242)

# category -> (draw_fn, base label, price range)
CATEGORIES = ["tshirt", "dress", "shoe", "bag", "hat"]

COLOR_FAMILIES = {
    "red":    [(196, 60, 60), (214, 92, 92), (168, 40, 52)],
    "blue":   [(58, 92, 168), (84, 128, 196), (40, 64, 128)],
    "green":  [(66, 138, 96), (98, 168, 120), (44, 104, 72)],
    "yellow": [(224, 178, 60), (238, 200, 100), (200, 150, 40)],
    "black":  [(40, 40, 44), (60, 60, 66), (24, 24, 28)],
    "white":  [(238, 236, 230), (250, 249, 246), (220, 218, 212)],
    "pink":   [(216, 128, 156), (232, 160, 184), (192, 100, 132)],
    "beige":  [(210, 188, 156), (224, 206, 178), (190, 166, 132)],
}

PATTERNS = ["solid", "striped", "dotted"]


def apply_pattern(draw, bbox, color, pattern, accent):
    x0, y0, x1, y1 = bbox
    draw.rectangle(bbox, fill=color)
    if pattern == "striped":
        stripe_w = 18
        x = x0
        toggle = False
        while x < x1:
            if toggle:
                draw.rectangle([x, y0, min(x + stripe_w, x1), y1], fill=accent)
            x += stripe_w
            toggle = not toggle
    elif pattern == "dotted":
        r = 8
        yy = y0 + r
        row = 0
        while yy < y1 - r:
            xx = x0 + r + (r if row % 2 else 0)
            while xx < x1 - r:
                draw.ellipse([xx - r, yy - r, xx + r, yy + r], fill=accent)
                xx += r * 3
            yy += r * 3
            row += 1


def draw_tshirt(draw, color, accent, pattern):
    cx = CANVAS // 2
    body = [(cx - 110, 160), (cx - 110, 420), (cx + 110, 420), (cx + 110, 160)]
    draw.polygon(body, fill=color)
    draw.polygon([(cx - 110, 170), (cx - 190, 220), (cx - 150, 270), (cx - 90, 210)], fill=color)
    draw.polygon([(cx + 110, 170), (cx + 190, 220), (cx + 150, 270), (cx + 90, 210)], fill=color)
    draw.polygon([(cx - 60, 140), (cx + 60, 140), (cx + 40, 175), (cx - 40, 175)], fill=BG)
    apply_pattern(draw, (cx - 90, 220, cx + 90, 400), color, pattern, accent)
    draw.polygon([(cx - 60, 140), (cx + 60, 140), (cx + 40, 175), (cx - 40, 175)], fill=color)


def draw_dress(draw, color, accent, pattern):
    cx = CANVAS // 2
    draw.polygon([(cx - 55, 130), (cx + 55, 130), (cx + 40, 260), (cx - 40, 260)], fill=color)
    draw.polygon([(cx - 40, 260), (cx + 40, 260), (cx + 130, 430), (cx - 130, 430)], fill=color)
    draw.polygon([(cx - 55, 140), (cx - 100, 190), (cx - 70, 220), (cx - 40, 175)], fill=color)
    draw.polygon([(cx + 55, 140), (cx + 100, 190), (cx + 70, 220), (cx + 40, 175)], fill=color)
    apply_pattern(draw, (cx - 100, 270, cx + 100, 420), color, pattern, accent)
    draw.polygon([(cx - 40, 260), (cx + 40, 260), (cx + 100, 270), (cx - 100, 270)], fill=color)


def draw_shoe(draw, color, accent, pattern):
    cy = 300
    draw.rounded_rectangle([120, cy - 40, 340, cy + 20], radius=25, fill=color)
    draw.polygon([(320, cy - 40), (400, cy - 10), (400, cy + 40), (300, cy + 20)], fill=color)
    draw.rectangle([120, cy + 15, 400, cy + 45], fill=accent)
    apply_pattern(draw, (140, cy - 30, 300, cy + 5), color, pattern, accent)


def draw_bag(draw, color, accent, pattern):
    cx = CANVAS // 2
    draw.rounded_rectangle([cx - 110, 200, cx + 110, 400], radius=18, fill=color)
    draw.arc([cx - 70, 100, cx + 70, 260], start=180, end=360, fill=accent, width=14)
    apply_pattern(draw, (cx - 100, 220, cx + 100, 380), color, pattern, accent)
    draw.rounded_rectangle([cx - 30, 270, cx + 30, 310], radius=6, fill=accent)


def draw_hat(draw, color, accent, pattern):
    cx = CANVAS // 2
    draw.ellipse([cx - 150, 260, cx + 150, 320], fill=color)
    draw.pieslice([cx - 90, 130, cx + 90, 300], start=180, end=360, fill=color)
    apply_pattern(draw, (cx - 90, 210, cx + 90, 300), color, pattern, accent)
    draw.rectangle([cx - 90, 255, cx + 90, 270], fill=accent)


DRAW_FN = {
    "tshirt": draw_tshirt,
    "dress": draw_dress,
    "shoe": draw_shoe,
    "bag": draw_bag,
    "hat": draw_hat,
}

NAME_WORDS = {
    "tshirt": ["Classic Tee", "Everyday Tee", "Relaxed Tee", "Crew Tee"],
    "dress": ["Summer Dress", "Midi Dress", "Wrap Dress", "Sundress"],
    "shoe": ["Runner Sneaker", "Court Sneaker", "Canvas Shoe", "Trail Shoe"],
    "bag": ["Tote Bag", "Crossbody Bag", "Weekender Bag", "Mini Bag"],
    "hat": ["Bucket Hat", "Baseball Cap", "Sun Hat", "Beanie"],
}

BASE_PRICE = {"tshirt": 290, "dress": 690, "shoe": 1290, "bag": 890, "hat": 350}


def main():
    products = []
    pid = 1
    for category in CATEGORIES:
        for color_name, shades in COLOR_FAMILIES.items():
            # not every category x color combo, keep it varied but bounded
            if random.random() < 0.35:
                continue
            pattern = random.choice(PATTERNS)
            color = random.choice(shades)
            accent = random.choice(
                [c for cname, shs in COLOR_FAMILIES.items() for c in shs if cname != color_name]
            )

            img = Image.new("RGB", (CANVAS, CANVAS), BG)
            draw = ImageDraw.Draw(img)
            DRAW_FN[category](draw, color, accent, pattern)

            filename = f"{category}_{pid:03d}.png"
            img.save(os.path.join(IMAGES_DIR, filename))

            name = random.choice(NAME_WORDS[category])
            price = BASE_PRICE[category] + random.randint(-50, 150)

            products.append({
                "id": pid,
                "name": f"{color_name.capitalize()} {name}",
                "category": category,
                "color": color_name,
                "pattern": pattern,
                "price": price,
                "imageUrl": f"/images/{filename}",
            })
            pid += 1

    with open(os.path.join(DATA_DIR, "products.json"), "w") as f:
        json.dump(products, f, indent=2)

    print(f"Generated {len(products)} products -> {DATA_DIR}/products.json")
    print(f"Images written to {IMAGES_DIR}")


if __name__ == "__main__":
    main()
