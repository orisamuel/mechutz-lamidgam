"""
Illustrated list-head portraits, generated with fal.ai from public reference photos.

Reference photos live in references/ (gitignored: they are copyrighted). Raw generations go to
references/generated/. The chosen image is finalized into public/party-leaders/<slug>.webp.

  python scripts/portraits.py generate <slug> [--style path/to/style-anchor.png] [--n 2]
  python scripts/portraits.py finalize <slug> <generated.png>

Needs FAL_KEY in the environment. The style must stay clearly illustrative (not photorealistic):
see GAME_SPEC.md §12 on section 2א2 of the Elections (Propaganda Methods) Law.
"""
import base64
import io
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "references"
OUT = REF / "generated"
PUBLIC = ROOT / "public" / "party-leaders"
MODEL = os.environ.get("FAL_MODEL", "fal-ai/nano-banana/edit")

STYLE = (
    "Redraw this person as a classic newspaper 'hedcut' portrait illustration: fine ink stippling dots and "
    "delicate crosshatching, in the manner of Wall Street Journal hedcut portraits. Strictly monochrome: deep navy "
    "ink (#12233F) only, no other colours at all, on a plain warm off-white paper background (#F4F1EA). Head and "
    "shoulders, centered, facing the "
    "viewer, calm and dignified expression. Keep the person's real likeness exactly: face shape, hairline, "
    "hairstyle, facial hair, glasses and age. It must clearly read as a hand-drawn illustration, never as a "
    "photograph. No text, no letters, no logos, no emblems, no frame, no border, no watermark. Vertical 4:5 "
    "composition with even margins around the head."
)

STYLE_MATCH = (
    "The LAST image is the style reference: match its illustration technique, stipple density, ink colour, "
    "paper background and framing exactly. Do not copy that person — only the style."
)

# (file, crop box or None). Crops isolate the right person in group or wide shots.
SUBJECTS = {
    "pirates": {
        "refs": [("shem-tov-2012-flash90.jpg", (330, 20, 620, 380)), ("shem-tov-2021-ppi.jpg", (830, 0, 1175, 400))],
        "extra": "Both images show the same man. Image 1 is older and frontal; image 2 is more recent. Draw him as he "
        "looks in image 2 (around fifty), frontal like image 1, wearing the black pirate tricorne hat with the small "
        "skull emblem from image 2.",
    },
    "sharsher": {
        "refs": [("shvili-2026-ynet.jpg", (170, 20, 530, 416)), ("shvili-2026-flash90-c14.webp", (190, 0, 540, 455))],
        "extra": "Both images show the same man, in his sixties: a weathered, tanned face with deep lines, short grey "
        "hair at the sides, thin lips and a stern, unsmiling expression. Use his face from image 1 (no sunglasses). "
        "Keep the tall jeweled crown with the Stars of David that he wears, with no lettering on it, and dress him in "
        "the royal cape with the white fur collar from image 2.",
    },
    "seder-chadash": {
        "refs": [("ofek-2019-ynet.jpg", None), ("ofek-2021-maariv.jpg", (220, 50, 620, 505))],
        "extra": "Both images show the same man. Keep his rectangular glasses and his grey beard. Collared shirt and tie.",
    },
    "ani-veata": {
        "refs": [("giladi-2026-youtube.jpg", (470, 60, 870, 520))],
        "extra": "Draw only the man in the center, with his glasses and short grey beard, in a dark jacket and white shirt.",
    },
    "gan-eden": {
        "refs": [("ben-david-2026-flash90.jpg", (1006, 0, 1580, 717))],
        "extra": "Draw only the tall bearded man in the center, with his long beard and white kippah, in a dark suit and "
        "a light blue tie.",
    },
    # No reliable photo of this list head exists, so this one is deliberately anonymous.
    "hatikun": {
        "refs": [],
        "prompt": "An anonymous person drawn as a head-and-shoulders silhouette: the face is completely in deep shadow "
        "with no facial features at all, generic short hair, plain collared shirt and jacket. Same ink stipple hedcut "
        "technique, navy ink and off-white paper background. Clearly anonymous, not an identifiable person. No text, "
        "no question mark, no frame.",
    },
}


def data_uri(path: Path, box) -> str:
    img = Image.open(path).convert("RGB")
    if box:
        img = img.crop(box)
    img.thumbnail((1024, 1024))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def call_fal(prompt: str, images: list[str]) -> dict:
    key = os.environ.get("FAL_KEY")
    if not key:
        sys.exit("FAL_KEY is not set")
    body = {"prompt": prompt, "image_urls": images, "num_images": 1, "output_format": "png"}
    req = urllib.request.Request(
        f"https://fal.run/{MODEL}",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Key {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as res:
            return json.load(res)
    except urllib.error.HTTPError as err:
        sys.exit(f"fal error {err.code}: {err.read().decode(errors='replace')[:800]}")


def generate(slug: str, style: str | None, n: int) -> None:
    subject = SUBJECTS[slug]
    images = [data_uri(REF / f, box) for f, box in subject["refs"]]
    prompt = subject.get("prompt") or f"{STYLE} {subject['extra']}"
    if style:
        images.append(data_uri(Path(style), None))
        prompt = f"{prompt} {STYLE_MATCH}"
    OUT.mkdir(parents=True, exist_ok=True)
    for i in range(n):
        result = call_fal(prompt, images)
        for j, image in enumerate(result.get("images", [])):
            target = OUT / f"{slug}-{i + 1}{'' if j == 0 else f'-{j}'}.png"
            urllib.request.urlretrieve(image["url"], target)
            with Image.open(target) as im:
                print(f"{target.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}")
        if result.get("description"):
            print("model note:", result["description"][:200])


INK = (0x12, 0x23, 0x3F)
PAPER = (0xF4, 0xF1, 0xEA)


def duotone(img: Image.Image) -> Image.Image:
    """Map luminance onto navy ink → paper, so every portrait shares one palette (removes stray colour)."""
    gray = img.convert("L")
    hist = gray.histogram()
    total = sum(hist)
    lo = next(i for i in range(256) if sum(hist[: i + 1]) >= total * 0.01)
    hi = next(i for i in range(255, -1, -1) if sum(hist[i:]) >= total * 0.25)  # the paper background
    span = max(1, hi - lo)
    lut = [tuple(round(INK[c] + (PAPER[c] - INK[c]) * min(1, max(0, (v - lo) / span)) ** 1.1) for c in range(3)) for v in range(256)]
    return Image.merge("RGB", [gray.point([lut[v][c] for v in range(256)]) for c in range(3)])


def finalize(slug: str, source: str, zoom: float = 1.0, focus_y: float = 0.45) -> None:
    img = duotone(Image.open(source).convert("RGB"))
    w, h = img.size
    target_ratio = 4 / 5
    if w / h > target_ratio:  # too wide: crop the sides
        new_w = int(h * target_ratio)
        img = img.crop(((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h))
    else:  # too tall: keep the top, where the face is
        new_h = int(w / target_ratio)
        top = int((h - new_h) * 0.25)
        img = img.crop((0, top, w, top + new_h))
    if zoom > 1:  # tighten the framing so every head reads at the same size
        w, h = img.size
        cw, ch = int(w / zoom), int(h / zoom)
        top = min(h - ch, max(0, int(h * focus_y - ch / 2)))
        img = img.crop(((w - cw) // 2, top, (w - cw) // 2 + cw, top + ch))
    img = img.resize((640, 800), Image.LANCZOS)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    target = PUBLIC / f"{slug}.webp"
    img.save(target, "WEBP", quality=86, method=6)
    print(f"{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB")


def edit(source: str, target: str, prompt: str) -> None:
    """Small corrective pass on an existing illustration (e.g. remove stray lettering)."""
    result = call_fal(prompt, [data_uri(Path(source), None)])
    OUT.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(result["images"][0]["url"], target)
    print(target)


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) >= 2 and args[0] == "generate":
        style = args[args.index("--style") + 1] if "--style" in args else None
        n = int(args[args.index("--n") + 1]) if "--n" in args else 1
        generate(args[1], style, n)
    elif len(args) >= 3 and args[0] == "finalize":
        finalize(args[1], args[2], *(float(a) for a in args[3:5]))
    elif len(args) == 4 and args[0] == "edit":
        edit(args[1], args[2], args[3])
    else:
        print(__doc__)
