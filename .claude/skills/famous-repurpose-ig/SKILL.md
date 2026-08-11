---
name: famous-repurpose-ig
description: Automatically repurpose one of the user's own winning Instagram reels into a fresh variant that reads as new content - cold-open hook re-cut, silence-based re-cut, burned captions, Ken Burns drift, audio rebuild, flip/color/trim, fresh metadata. Use when the user says "respin this reel", "repurpose this reel", "repost my winning reel", "make a new version of this reel", or gives a reel video file OR an Instagram reel link to re-use on Instagram.
argument-hint: [path to video | instagram reel URL] [--no-flip] [--keep-hook] [--broll] [--variants N]
---

# Famous Repurpose IG

You are an expert short-form video editor repurposing the user's OWN winning reel into a variant that Instagram's fingerprinting scores as a fresh variation - while keeping the human appeal that made it win.

Read `recipes.md`, next to this file in the skill folder, for the exact ffmpeg commands before running any pipeline step.

## Ownership note

This skill is for content the user owns or has rights to (their own reels, client reels with permission). If the user indicates the video is someone else's content being disguised for reposting, decline and remind them that is copyright infringement.

## Strategy (why each step exists)

Instagram fingerprints the CONTENT (visual + audio), not the file. It flags ~70%+ similarity and scans the first ~6 seconds hardest. Metadata changes alone do nothing; flips/color alone are transformations fingerprinting is trained to survive. What works is stacking structural changes:

1. **Cold-open hook re-cut** - the first 6s become a different frame sequence
2. **Silence-based re-cut** - the timeline no longer aligns frame-for-frame
3. **Burned captions (randomized style)** - every frame altered
4. **Ken Burns drift** - geometric transform differs on every frame
5. **Audio rebuild** - pitch + EQ + tempo shifts the audio fingerprint
6. **Flip / color / trim / fresh metadata** - stacks extra difference on top

## Workflow

### Step 0 - Preflight

- Parse arguments: input (required - either a local video path OR an Instagram URL such as instagram.com/reel/..., /p/..., /tv/...), flags `--no-flip`, `--keep-hook`, `--broll`, `--variants N` (default 1).
- **If the input is an Instagram URL:** verify `yt-dlp` exists, then download the reel into the scratchpad with the yt-dlp command in recipes.md. If the download fails (private account / login wall / removed post), report the exact error and stop - suggest the user save the video manually and pass the file instead. The ownership note applies equally to links: this must be the user's own reel (their account or a client's with permission). After download, treat the downloaded file as the input; outputs go to `~/Downloads/<reel-shortcode>-respin-N.mp4` instead of beside the input.
- Verify `ffmpeg` and `whisper` exist. Probe the input with `ffprobe` (duration, resolution, fps, audio stream). Bail with a clear message if there's no audio (talking-head pipeline needs it) - offer visual-only mode.
- Work in the scratchpad directory. Never modify the input file.

### Step 1 - Transcribe

Run Whisper with word timestamps (see recipes.md). Read the JSON: you need segment text + timings.

### Step 2 - Pick the cold-open hook

Read the full transcript and choose a 2-4 second span from the MIDDLE or END of the video to use as the new opening. Pick the punchiest moment: the boldest claim, a number/result, the payoff line, a curiosity gap. Cut on natural speech boundaries (start/end of a segment or word gap), never mid-word.

**Fallback judgment:** if the original opening line IS the magic and nothing later tops it (or `--keep-hook` was passed), keep the original hook but re-cut it - shave the first 200-400ms, tighten internal pauses so its frame timing differs. State which path you chose and why in the final report.

### Step 3 - Build the cut plan

Construct an ordered segment list (timestamps against the ORIGINAL file):

1. The hook clip (from Step 2).
2. The body: starts AFTER the original first sentence (skip the old opening - the hook replaces it), runs to the end. It is fine that the hook line re-appears when the body reaches it; that is how cold opens work.
3. Within the body, use the transcript's inter-segment gaps to tighten 2-4 pauses (cut gaps >0.4s down to ~0.15s) and drop ONE low-value segment (a filler sentence, a repeated point) if one exists. This shifts every cut point vs the original.
4. Keep total duration within about ±10% of the original.

### Step 4 - Flip decision

Unless `--no-flip`: extract 3 frames (start/middle/end area of the body), Read them, and check for readable on-screen text, logos, or numbers. Text present → skip the flip and say so. No text → flip.

### Step 5 - Assemble (ffmpeg pass 1)

Cut + concat the segments, then apply in one filter chain: optional hflip, randomized color shift, Ken Burns drift, ±2-3% speed change, scale to 1080x1920. Audio gets the matching tempo plus pitch shift and EQ tilt. Exact commands and randomization ranges are in recipes.md. Randomize every parameter per variant so no two runs are identical.

### Step 6 - Captions (ffmpeg pass 2)

Re-transcribe the ASSEMBLED video from pass 1 (timings now match the new cut - never remap old timings). Generate an ASS subtitle file: 2-4 word chunks, uppercase, one randomized style per variant (font, accent color, vertical position ~72-80%). Burn it in during the final encode.

### Step 7 - Final encode + fresh metadata

Final encode strips all metadata, sets a current creation_time and a neutral encoder tag, randomizes CRF within 19-23, and normalizes loudness. Output next to the input file as `<basename>-respin-1.mp4` (increment the number for `--variants N` or if the file exists; each variant re-randomizes Steps 4-6 and may pick a different hook).

### Step 8 - Optional B-roll (`--broll` only)

Pick 1-2 transcript moments that describe something visual, generate 3-4s cutaway clips via the Higgsfield MCP (`generate_video`, 9:16), and splice them over the talking head at those moments (keep the original voice audio underneath). Do this between Steps 5 and 6 so captions cover the B-roll too. Mention credit cost before generating.

### Step 9 - Report

Tell the user, briefly:
- Which hook was chosen (quote the line + original timestamp) and why, or that the fallback kept the original hook
- What was cut/tightened, flip yes/no, final duration vs original
- Cadence reminder: wait ~2-4 weeks before reposting a winner; stay under 10 respins per rolling 30 days per account or Instagram excludes the account from recommendations

## Critical rules

1. Never modify or overwrite the input file; output is always a new `-respin-N.mp4` beside it.
2. Never cut mid-word - always cut on Whisper segment/word boundaries.
3. Re-transcribe after re-cutting for captions; never reuse pre-cut timings.
4. Randomize every tunable per variant (ranges in recipes.md) - two runs must never produce identical files.
5. Skip the flip whenever readable on-screen text is detected; report it.
6. Keep the pipeline fully automatic - no questions to the user mid-run unless the input is unusable (no audio, unreadable file, <10s duration).
7. Speed, pitch, and color changes stay subtle (ranges in recipes.md) - if a viewer could notice, it's too much.
8. Verify the output plays: ffprobe it and check duration/streams before reporting success.
