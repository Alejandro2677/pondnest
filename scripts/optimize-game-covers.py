"""Optional local compression; preserves each original file and full cover.

Run: python scripts/optimize-game-covers.py (requires Pillow).
The UI uses each original as fallback and the smaller WebP when available.
"""
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps

folder = Path(__file__).resolve().parent.parent / "public" / "juegos"
if not folder.is_dir():
    raise SystemExit(f"Missing cover directory: {folder}")
target = folder / "optimized"
target.mkdir(exist_ok=True)
for path in folder.iterdir():
    if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".avif"}:
        continue
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image).convert("RGBA")
        image.thumbnail((480, 480), Image.Resampling.LANCZOS)
        output = target / f"{path.name}.webp"
        compressed = BytesIO()
        image.save(compressed, "WEBP", quality=84, method=6)
        if compressed.tell() < path.stat().st_size:
            output.write_bytes(compressed.getvalue())
            print(f"{path.name}: {path.stat().st_size} -> {output.stat().st_size} bytes")
        else:
            output.unlink(missing_ok=True)
            print(f"{path.name}: original already smaller, preserved")
