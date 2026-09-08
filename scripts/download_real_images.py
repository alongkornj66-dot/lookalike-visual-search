#!/usr/bin/env python3
"""Download real product images from Unsplash CDN."""
import urllib.request
import os
import time

BASE = "https://images.unsplash.com/photo-"
PARAMS = "?w=600&h=600&q=85&auto=format&fit=crop"

# Map each product filename -> Unsplash photo ID
IMAGES = {
    # T-shirts
    "tshirt_001": "1521572163474-6864f9cf17ab",   # classic tee
    "tshirt_002": "1503342217505-b0a15ec3261c",   # casual shirt
    "tshirt_003": "1562157873-818bc0726f68",       # pink/light shirt
    "tshirt_004": "1576566588028-4147f3842f27",   # striped / neutral
    # Dresses
    "dress_005":  "1496747611176-843222e1e57c",   # summer dress
    "dress_006":  "1572804013309-59a88b7e92f1",   # sundress
    "dress_007":  "1515886657613-9f3515b0c78f",   # white dress
    # Shoes
    "shoe_008":   "1542291026-7eec264c27ff",       # red sneaker
    "shoe_009":   "1560769629-975ec94e6a86",       # colorful sneakers
    "shoe_010":   "1606107557195-0e29a4b5b4aa",   # yellow sneaker
    "shoe_011":   "1600185365483-26d7a4cc7519",   # black sneaker
    "shoe_012":   "1460353581641-37baddab0fa2",   # white sneaker
    "shoe_013":   "1603808033192-082d6919d3e1",   # beige canvas shoe
    # Bags
    "bag_014":    "1548036328-c9fa89d128fa",       # structured bag
    "bag_015":    "1584917865442-de89df76afd3",   # crossbody bag
    "bag_016":    "1553062407-98eeb64c6a62",       # white bag
    "bag_017":    "1590874103328-eac38a683ce7",   # pink/blush bag
    "bag_018":    "1614179818511-76b14b7e5d62",   # beige bag
    # Hats
    "hat_019":    "1576871337622-98d48d1cf531",   # knit hat / beanie
    "hat_020":    "1521369909029-2afed882baee",   # sun hat
    "hat_021":    "1588850561407-ed78c282e89b",   # baseball cap
    "hat_022":    "1521369909029-2afed882baee",   # light cap (reuse)
    "hat_023":    "1578632767115-351597cf2a0d",   # bucket hat
    "hat_024":    "1556306535-0f09a537f0a3",       # beige bucket hat
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "public", "images")

headers = {"User-Agent": "Mozilla/5.0"}

for name, photo_id in IMAGES.items():
    url = f"{BASE}{photo_id}{PARAMS}"
    dest = os.path.join(OUT_DIR, f"{name}.jpg")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        with open(dest, "wb") as f:
            f.write(data)
        print(f"  OK  {name}.jpg  ({len(data)//1024} KB)")
    except Exception as e:
        print(f"  FAIL {name}: {e}")
    time.sleep(0.3)

print("\nDone.")
