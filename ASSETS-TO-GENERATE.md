# Renders and videos to generate for the bean-to-cup homepage

The site already works with built-in 3D scenes and placeholder photos. These assets are optional upgrades. Generate them with Midjourney, Runway, Kling or Spline, save them in `public/media/`, and send them over to be wired in.

**Same look for everything:** warm cream background `#F3EAE0`, terracotta `#C0623B` accents, deep espresso `#2B1D16`, soft studio lighting, warm soft shadows, matte ceramic textures, minimal and calm. **No logos or brand names** on any product: only plain packaging, or the Sip & Soul Café name.

| # | File name | Where it goes | Type and size |
| --- | --- | --- | --- |
| 1 | `grinder-still.png` | Hero "GRIND" (replaces the 3D grinder on phones) | Transparent PNG, 2000 × 2400 |
| 2 | `grinder-explode.mp4` | Hero, scrubbed by scroll on desktop | Video, 4–6 s, 1920 × 1080, 30 fps, plain cream background |
| 3 | `beans-falling.mp4` | Hero, plays once on load | Video, 2–3 s, 1080 × 1350, transparent (WebM with alpha) or cream background |
| 4 | `pour-over.mp4` | Section 2 "POUR", scrubbed by scroll | Video, 6–8 s, 1920 × 1080, 30 fps |
| 5 | `coffee-funnel-cup.mp4` | Section 3, the cup transition | Video, 5–6 s, 1080 × 1350, 30 fps |
| 6 | `splash-1.png` … `splash-4.png` | Section 3, floating blurred drops | Transparent PNG, 800 × 800 each |
| 7 | `giant-mug.png` | Section 4 "FIND YOUR CUP" background | Transparent PNG, 2400 × 2000 |
| 8 | `card-origin.png`, `card-roast.png`, `card-beans.png`, `card-flavor.png` | Section 4 carousel cards | PNG, 1200 × 900 each |
| 9 | `og-image.jpg` | Link preview on WhatsApp, Facebook and others | JPG, 1200 × 630 (a version made from the hero is already included) |

## Prompts

**1. Grinder still.** A matte black electric burr coffee grinder with a clear glass conical hopper full of roasted coffee beans, a small terracotta dial on the side, standing on a warm cream studio background, soft diffused studio light from the top left, gentle warm shadow, matte ceramic texture, minimal premium product photography, centered, no text, no logo.

**2. Grinder exploded view.** The same matte black burr grinder slowly separating vertically into an exploded view: the lid rises, the glass hopper of beans lifts, the two steel burr discs separate to show their teeth, and fine coffee grounds fall gently between them. Locked camera, slow and smooth motion, cream background, soft studio light, no text.

**3. Beans falling.** Roasted coffee beans tumbling from the top of the frame in slow motion into an empty glass hopper, soft warm studio light, shallow depth of field, cream background, no text.

**4. Pour-over.** A matte black gooseneck kettle pouring a thin stream of water in slow circles into a white ceramic pour-over dripper set on a round glass carafe. Coffee drips into the carafe, which slowly fills, with soft steam rising. A large terracotta arch behind, a wooden counter, a small terracotta vase and a white cup in soft focus. Warm afternoon studio light, locked camera, no text.

**5. Coffee funnel into a cup.** A swirling funnel of dark glossy coffee spiraling down from above into a white ceramic cup on a saucer, filling it, with a few blurred splashes and droplets floating around in the foreground. Soft cream background, warm light, slow motion, no text.

**6. Splashes.** A single dark coffee splash or droplet frozen mid-air, glossy, isolated on a transparent background. Make 4 different shapes.

**7. Giant mug.** An oversized matte latte-beige ceramic mug, front view, with a thin stream of coffee dripping into it from above, cream studio background, soft warm shadow, minimal, no text.

**8. Card images.** Each on a cream background with soft light, minimal:
- **Origin:** coffee cherries and green coffee beans on a matte terracotta plate.
- **Roast:** three small piles of light, medium and dark roasted beans side by side.
- **Beans:** a plain unbranded kraft coffee bag with a few beans spilling out.
- **Flavor:** a cup of coffee surrounded by cocoa pieces, an orange slice and berries, representing tasting notes.

## Tips

- Keep videos short and loopable where possible. Export MP4 (H.264) under 8 MB, plus WebM for transparency.
- For scroll-scrubbed videos, export with a keyframe every frame (`-g 1` in ffmpeg) so scrubbing stays smooth.
- Spline is the best fit if you'd rather have a real 3D grinder or kettle model (`.splinecode`) instead of video.
