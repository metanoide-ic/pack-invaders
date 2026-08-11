---
name: famous-thumbnail
description: Generate a high-converting YouTube thumbnail from a reference thumbnail the user likes + a description of their video's theme/subject. Recreates the reference's proven layout/style with the user's own topic using the Higgsfield MCP (GPT Image 2, 16:9). Use when the user says "make me a thumbnail", "YouTube thumbnail", "thumbnail like this one", shares a reference thumbnail image, or wants a cover image for a video. NOT for two-app "X + Y" graphics (that's youtube-thumbnail-maker) and NOT for in-video popup graphics.
---

# Famous Thumbnail (reference-driven, GPT Image 2)

Take ONE reference thumbnail the user likes + their video's theme/subject → produce a 16:9 YouTube thumbnail that steals the reference's *converting structure* (layout, emotion, contrast, text treatment) but carries the user's topic.

Work inside one project folder per thumbnail, e.g. `~/thumbnails/<video-name>/`.

## Inputs (collect BOTH before generating)
1. **Reference image** — a thumbnail the user likes (file path or pasted image). If they only gave a YouTube URL, grab the thumbnail: `curl -L -o ref.jpg "https://i.ytimg.com/vi/<VIDEO_ID>/maxresdefault.jpg"`.
2. **Theme/subject** — what the video is about, in the user's words. If they gave only a vague topic, ask ONE quick question: "What's the one claim/result/emotion the video delivers?" (that becomes the thumbnail's hook). Don't interrogate them — one question max, then proceed with sensible defaults.
3. **Optional**: a photo of the creator's face (if the reference features a person and the user wants themselves in it), brand colors, exact text they want on it.

## Pipeline

### 1. Study the reference (ALWAYS, before any prompt)
`Read` the reference image and extract, explicitly, in your notes:
- **Layout grid**: where the face/subject sits (left/right third?), where the text block sits, how much empty space.
- **Text treatment**: word count (high-CTR thumbnails use ≤4 words), font vibe (heavy sans, condensed, outlined?), color, stroke/shadow, any highlight word in a different color.
- **Emotion/subject**: facial expression (shock, smirk, pointing?), object props, arrows/circles.
- **Color story**: background style (gradient? blurred scene? solid?), the 1–2 accent colors, overall contrast level.
- **What makes it convert**: the curiosity gap or tension the composition creates (before/after, big number, "vs", forbidden thing, transformation).

### 2. Write the thumbnail concept (1–2 lines, show the user only if uncertain)
Map the user's theme onto the reference's structure. Decide the ≤4-word text (UPPERCASE, curiosity-gap phrasing — a claim, number, or tension: "I QUIT ADS", "$0 → $10K", "STOP DOING THIS"), the subject/expression, and the accent color. Keep the reference's *skeleton*, swap the *content*. Never copy the reference's exact text or a creator's identity/branding.

### 3. Upload the reference to Higgsfield
Load the deferred Higgsfield tools via ToolSearch first (`select:` the `generate_image`, `media_upload`, `media_confirm`, `jobs_wait`, `job_display` tools of the Higgsfield server; the server-name prefix varies per session).
- `media_upload` → `curl --upload-file ref.jpg "<returned upload URL>"` → `media_confirm` (`type: "image"`).
- If a creator face photo was supplied, upload it the same way (GPT Image 2 accepts multiple reference images in `medias`).

### 4. Generate (GPT Image 2 — never a local tool, never another model)
`generate_image` with:
- `model: "gpt_image_2"`
- `medias: [{value: <ref_media_id>, role: "image"}]` (+ the face photo as a second `role: "image"` entry if supplied)
- `aspect_ratio: "16:9"`, `resolution: "2k"`, `quality: "high"` (thumbnails live or die on text crispness at small sizes — never `low`)
- `batch_size`/multiple candidates: generate **2 variants** in one go when cheap (same prompt, or one prompt + one alternate text hook) so the user picks.

**Prompt recipe** (adapt, don't template blindly):
```
YouTube thumbnail, 16:9. Recreate the LAYOUT, TEXT STYLE, and ENERGY of the
reference image, but with new content: <subject/scene for the user's theme>.
Bold text reading "<TEXT, ≤4 words>" in <treatment from step 1: e.g. heavy white
uppercase sans with black stroke>, <position>. <Face/subject description +
expression, "use the person from the second reference image" if face supplied>.
Background: <style from reference>. Accent color <hex/name>. Extreme contrast,
crisp edges, readable at 200px wide, no watermark, no extra text.
```
- Spell the overlay text in CAPS inside quotes — GPT Image 2 renders quoted text literally.
- Poll with `jobs_wait`; generation takes ~30–90s. Download the PNG(s) into the project folder (`curl -L -o thumb-v1.png "<url>"`).

### 5. Self-evaluate BEFORE showing (the 200px test)
- Downscale a copy to 200px wide (`ffmpeg -i thumb-v1.png -vf scale=200:-2 thumb-small.png` or PIL) and `Read` it: **is the text readable and the emotion legible at feed size?** If not → regenerate with bigger text / fewer words / more contrast.
- Check: text spelled correctly (GPT Image 2 is good but verify every word), no mangled hands/eyes, no accidental logos/watermarks, subject not cropped by the edges, and the 16:9 frame is fully used (no letterbox bars).
- Compare side-by-side against the reference: same *energy*? If it reads flat next to the reference, punch up contrast/saturation/expression and regenerate.

### 6. Deliver + iterate
Show the winning candidate(s) with `SendUserFile`. Offer one round of targeted tweaks (text change, color swap, expression). For a pure text fix, re-run with the same medias + an edit-style prompt ("same image, change the text to '<NEW>'") — GPT Image 2 handles targeted edits well when the previous output is passed back as the reference.

## High-converting thumbnail rules (bake into every concept)
- **≤4 words**, uppercase, one idea. The title carries the sentence; the thumbnail carries the tension.
- **One focal point** (a face with a strong expression beats everything; faces should be large — head ~1/3 of frame height).
- **Curiosity gap**: the thumbnail must raise a question the title doesn't fully answer (before/after, big number, contradiction, red arrow at something odd).
- **3-color max**: background + subject + ONE accent. High contrast between text and background always.
- **Edges matter**: keep text/faces off the bottom-right corner (timestamp overlay) and inside ~5% safe margins.
- If the reference violates one of these but clearly converts anyway, trust the reference — it's the proven artifact.

## ERRORS NOT TO REPEAT
| Error | Rule |
|---|---|
| Generating before studying the reference | Always `Read` the reference and write out the layout/text/color analysis first — the prompt quality comes from the analysis. |
| Copying the reference's literal text/branding | Steal structure, never content or identity. |
| `quality: low` / 1k output | Text goes mushy at feed size. Always 2k + high. |
| Showing an unchecked result | Run the 200px test + spellcheck every generated word before presenting. |
| Wall of text in the prompt's quoted string | GPT Image 2 renders long quoted strings tiny. ≤4 words. |

## Self-learning (at the end of every thumbnail)
When the thumbnail is approved: note in chat what worked and what needed rounds, and if a mistake is repeatable, add a row to ERRORS NOT TO REPEAT in THIS file without asking. Save especially good prompt→result pairs as notes in a `references/` folder here so the next thumbnail one-shots.
