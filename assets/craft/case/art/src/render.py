"""Screenshot scenes/*.html into ../<name>-2560.webp, ../<name>-1440.webp and a tiny blur placeholder.

python3 render.py [name ...]     (needs Playwright + /usr/bin/google-chrome; no network used)
Writes placeholders.json  {name: data-uri}  for art.css.
"""
import asyncio
import base64
import io
import json
import os
import sys

from PIL import Image, ImageFilter
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
SCENES = os.path.join(HERE, "scenes")
DEST = os.path.dirname(HERE)
PH = os.path.join(HERE, "placeholders.json")


async def main(names):
    ph = json.load(open(PH)) if os.path.exists(PH) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        ctx = await b.new_context(viewport={"width": 2560, "height": 1440}, device_scale_factor=1)
        await ctx.route("http*://**", lambda r: r.abort())
        pg = await ctx.new_page()
        for n in names:
            await pg.goto("file://" + os.path.join(SCENES, n + ".html"))
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(250)
            png = await pg.screenshot(type="png")
            im = Image.open(io.BytesIO(png)).convert("RGB")
            im.save(os.path.join(DEST, f"{n}-2560.webp"), "WEBP", quality=86, method=6)
            im.resize((1440, 810), Image.LANCZOS).save(os.path.join(DEST, f"{n}-1440.webp"), "WEBP", quality=86, method=6)
            tiny = im.resize((48, 27), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
            buf = io.BytesIO()
            tiny.save(buf, "WEBP", quality=50)
            ph[n] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
            sizes = [os.path.getsize(os.path.join(DEST, f"{n}-{w}.webp")) // 1024 for w in (2560, 1440)]
            print(f"{n}: 2560={sizes[0]}KB 1440={sizes[1]}KB ph={len(ph[n])}B")
        await b.close()
    json.dump(ph, open(PH, "w"), indent=1, sort_keys=True)


if __name__ == "__main__":
    names = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(SCENES) if f.endswith(".html"))
    asyncio.run(main(names))
