import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

IMAGE_ROOT = ROOT / "assets" / "img"
DATA_ROOT = ROOT / "assets" / "data"

FOLDERS = [
    "members",
    "news",
    "events",
    "partners"
]

EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".avif"
}

manifest = {}

for i in FOLDERS:
    directory = IMAGE_ROOT / i
    directory.mkdir(parents=True, exist_ok=True)
    images = sorted(
        file
        for file in directory.iterdir()
        if file.is_file()
        and file.suffix.lower() in EXTENSIONS
    )
    
    manifest[i] = [
        "/" + file.relative_to(ROOT).as_posix()
        for file in images
    ]
    
    print(f"[OK] {i}: {len(images)} images found")
    
DATA_ROOT.mkdir(parents=True, exist_ok=True)
output = DATA_ROOT / "images.json"

with output.open("w", encoding="utf-8") as file:
    json.dump(manifest, file, indent=4)
    
print("\n[OK] Image manifest generated!")