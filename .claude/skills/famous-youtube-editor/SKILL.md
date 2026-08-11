---
name: famous-youtube-editor
description: Use when you want to edit/montage a raw talking-head clip into a finished LANDSCAPE 16:9 YouTube video with dynamic shot changes - full-screen cam when speaking directly, full-screen "Premiere-style" motion-graphic animations when explaining, cam-PiP over graphics, and AI B-roll cutaways generated via the Higgsfield MCP. Sibling of famous-reel-editor (which is vertical/IG only). Triggers - "edit my YouTube video", "make a YouTube video from this clip", "youtube edit with the animations", "full-screen animations like Premiere", or when given a talking-head .mov/.mp4 meant for long-form YouTube. NOT for vertical reels/shorts (use famous-reel-editor) and NOT for posting.
---

# Famous YouTube Editor (16:9 long-form)

Turn ONE raw talking-head clip into a finished **1920x1080 YouTube video** that keeps moving: the shot changes with what's being said — full-screen cam, full-screen animation ("Adobe Premiere motion-graphics vibe"), cam-PiP over graphics, and AI B-roll cutaways from the **Higgsfield MCP**. Same editing brain as `famous-reel-editor`, different canvas and shot grammar.

> **Depends on `famous-reel-editor`** being installed as a sibling folder in the same skills directory as this one (`../famous-reel-editor`) — this skill reuses its scripts (`transcribe.py`, `cutjoin.py`, `silence_keep.py`, `gen.py` card patterns), assets (fonts, logos, music), and its **ERRORS NOT TO REPEAT** table (read it — every rule there applies here too). `<reel>` = that folder. Work inside one project folder per video, e.g. `~/yt/<name>/`.

## What's different from famous-reel-editor
| | famous-reel-editor (IG) | THIS skill (YouTube) |
|---|---|---|
| Canvas | 1080x1920 vertical | **1920x1080 landscape** (4K source stays sharp) |
| Layout | fixed: face bottom, cards top | **dynamic shot grammar** (modes A–D below), changes per sentence |
| Cards | top band 1080x864 | **full-screen 1920x1080** motion graphics |
| Subtitles | one-word karaoke ~100px at center | **NONE — clean YouTube look, no burned captions** (user preference; YouTube has its own CC) |
| B-roll | 1–2 per reel, dark to blend into black band | **~1 per 15–20s of runtime** (a 75s video wants ~4), full-screen 16:9, graded to match the video; mix identity B-roll with scene-setting shots (datacenter, office, screens) |
| Pace | contiguous cards, always something moving | shot CHANGES carry the energy; a card doesn't need to be on screen at all times |

## Shot grammar (the core decision)
Assign every sentence of the final transcript ONE mode. This is the edit.

- **A — Full-screen cam**: direct address, personal stories, opinions, jokes, transitions, the hook, the CTA. The speaker fills the frame (4K source → punch-in options, see Punch-ins).
- **B — Full-screen animation** (the "Premiere" look): concepts, lists, numbers, comparisons, step-by-steps, anything a schema explains better than a face. The 1920x1080 motion-graphic card takes the WHOLE frame; voice continues underneath; cam hidden. **Design cards as UI PANELS, not bare text**: every card lives inside an app-window frame (macOS traffic-light title bar + panel body) or a card/tile — dashboards with bar rows, leaderboard windows, terminal windows with typed lines, pricing cards, side-by-side subscription cards, chart panels with delta chips. Big keywords alone on a background read as lazy; the window chrome is what sells the "Premiere graphics" look. Wide layouts (side-by-side, three-column) that use the horizontal space — don't render a vertical card centered on a 16:9 frame. Stage elements INSIDE each card on their trigger words (rows slide in, chips pop, stamps slam) so a 5s card has 2-3 internal events.
- **C — Cam PiP over graphics**: the graphic matters but the delivery/reaction matters too ("look at THIS"). The animation or screen-recording fills the frame; the cam shrinks to a corner PiP (~480px wide, bottom-right, `border:4px` accent or clean rounded crop). Also the mode for user screen-recordings with commentary.
- **D — Full-screen B-roll**: concrete, filmable sentences ("I sat down and built it", "clients kept calling"). Higgsfield-generated (or user-supplied) footage, full-bleed 16:9, voice continues.

**Rhythm rules**: hook = A (first shot is the face, always). **Something NEW must happen on screen every ~5s** — a mode change, a punch-in, a new card, or a staged element popping inside a card all count; scan the shot plan for any gap >5s without an event and break it up (split the card, add a punch-in, or insert a B-roll window). Never stay in one mode >10s. Never two B-roll windows back-to-back. Mode changes land ON word boundaries (use the transcript times). Alternate: a good long-form rhythm is A → B → D → A → C → A …, returning to full-screen cam regularly so the video stays personal. End (CTA) = A.

**How to decide from the transcript**: for each sentence ask — is he *telling me* something (A), *explaining* something abstract (B), *showing* something (C), or *describing an action/scene* (D)? Write the shot plan as a JSON list `{start, end, mode, what}` before generating anything, and sanity-check the mode durations against the rhythm rules.

## Pipeline (run in order, inside one project folder)
1. **Probe the source**: `ffprobe` + extract a frame and LOOK at it (rotation metadata lies — see famous-reel-editor errors). Keep native resolution through the cut; only scale at compose.
2. **Transcribe the RAW**: `python <reel>/scripts/transcribe.py <raw> --edit-dir edit --language en` (ElevenLabs Scribe, tightest word timings — the API key is preconfigured in `<reel>/.env`). Same CLI fallbacks: `transcribe_groq.py` (needs `GROQ_API_KEY`) or `transcribe_local.py` (offline).
3. **Clean-take EDL**: identical discipline to famous-reel-editor steps 3–4 — read word-by-word, hand-pick the clean take of every sentence, drop director's notes/false starts, extend each `end` +0.2/0.4s.
4. **Cut**: `python <reel>/scripts/cutjoin.py edit/edl.json edit/cut.mp4`.
5. **Silence trim**: `python <reel>/scripts/silence_keep.py edit/cut.mp4 edit/edl_sil.json` → re-cut to `edit/cutF.mp4`. For long-form you may keep slightly more air than a short: defaults are fine, don't pass a tighter MIN unless the user wants punchy.
6. **Re-transcribe the final cut** (SAME transcriber as step 2 — never mix engines between raw and cut): `python <reel>/scripts/transcribe.py edit/cutF.mp4 --edit-dir edit/tF ...` and VERIFY no clipped words (audio, not transcript — famous-reel-editor's most expensive lesson).
7. **Shot plan** (NEW, the heart of this skill): read `edit/tF/transcripts/cutF.json`, assign every sentence a mode A–D per the grammar above, write `edit/shotplan.json`. Show the user a one-line-per-shot summary (time, mode, what) before rendering — this is the cheapest moment to change the edit.
8. **Fire the Higgsfield B-roll jobs NOW** (they take 1–3 min; run while cards render) — see B-roll section. One job per mode-D window.
9. **Author + render the cards** for every mode-B/C window: start from `references/gen-youtube-example.py` (this skill — already 1920x1080, window-chrome card vocabulary, shot-window-driven beats) and adapt its BEATS/cards to the new video; `<reel>/scripts/gen.py` remains the reference for trigger mechanics only. Same trigger/anchor discipline (`find_after`, `EXPECT` asserts, key visual early in the beat). Render: `npx --yes hyperframes render . -o cards_all.mp4`. Cards need only exist during their windows — black frames elsewhere are fine (they're never shown).
10. **Compose** with one ffmpeg filter graph driven by `shotplan.json`:
    - Base: cam scaled to `1920:1080` (mode A full-screen; also underneath everything as fallback so no window is ever empty).
    - Mode B: overlay `cards_all.mp4` full-frame with `enable='between(t,A,B)'` per window.
    - Mode C: card/screen-recording full-frame + cam scaled `480:-2` overlaid bottom-right (`W-w-48:H-h-48`) with the same enable window.
    - Mode D: B-roll input `trim=START:END,setpts=PTS-STARTPTS,fps=<src fps>,scale=1920:1080,setsar=1,setpts=PTS+A/TB` then `overlay` with enable — the same chain shape as `<reel>/references/examples/compose-broll.sh`, just full-frame.
    - Then audio: voice `loudnorm=I=-16` only — **NO background music by default** (user preference; add it only if the user explicitly asks, then `<reel>/assets/bg-music.m4a` at `0.06` with fades). `-movflags +faststart`.
    - Encode `libx264 -crf 18 -preset medium` (YouTube re-encodes; keep quality high).
11. **Punch-ins** (optional polish for long mode-A stretches): a 4K source lets you cut between 100% and ~115% crops of the same shot to fake a two-camera setup. If a mode-A stretch exceeds ~8s, alternate punch level at sentence boundaries (`crop=iw/1.15:ih/1.15:(iw-iw/1.15)/2:(ih-ih/1.15)*0.35,scale=1920:1080` for the tight shot).
12. **Self-evaluate before showing**: contact-sheet one frame per shot-plan window and check — mode matches the sentence, no empty frames, PiP not covering a card's key visual, B-roll matches the voiceover, first/last words not clipped, A/V drift <1 frame. Fix, then show.
13. **Retro + self-learning** (MANDATORY): same protocol as famous-reel-editor — honest retro, distill repeatable errors into THIS skill's errors table, and if the lesson is about cutting/transcribing/captions (shared machinery), add it to `famous-reel-editor`'s table instead so both skills benefit.

## Premiere-style card vocabulary (proven patterns — see `references/gen-youtube-example.py`)
Every mode-B/C card is a **UI panel inside an app-window frame** (macOS traffic-light title bar + lowercase filename-style title + panel body). Working patterns from a shipped video, mix and match:
- **Release window** — badge (JUST RELEASED) + mega title + chip row (version, license, maker) + animated spark line at right.
- **Dashboard window** — panel title + horizontal bar rows (name / track / value), rows slide in on their trigger words, bars scaleX in.
- **Checklist file window** (`open_source.txt`) — ✓ rows of KEY → VALUE pairs; a rotated red STAMP slams beside (NOT on top of) the window on its trigger word.
- **Column-chart window** — 3 columns growing from the base, dashed comparison line, accent DELTA CHIP (▲ SCORES OVER …) popping on its trigger word.
- **Leaderboard window** — ranked rows, #1 row accent-bordered and glowing.
- **Stat tiles** — two small windows side by side, each one big number (#1) + label, popping sequentially on their trigger words.
- **Terminal window** — monospace typed lines appearing in sequence (`$ run …`, `▸ loading …`, big RESULT line), blinking accent cursor.
- **Pricing card** — label + huge $0 + accent button (FREE FOR EVERYONE).
- **Subscription duel** — two subscription-card windows side by side (incumbent $20/mo with red CANCEL? stamp vs challenger $0/mo with accent OPEN badge).
`references/compose-example.sh` is a full working compose graph (punch-ins, card windows, 4 B-roll overlays, PiP, loudnorm-only audio).

## AI B-roll via Higgsfield (default: ~1 per 15–20s of runtime)
Long-form breathes on cutaways. Unless the user says "no B-roll" or supplies clips for every mode-D window:
- **Pick windows** during the shot plan (step 7): concrete, filmable sentences AND scene-setting nouns ("Chinese open source models" → datacenter, "is it actually good?" → skeptical look at monitor); 3–6s each; never the hook or CTA. Aim ~1 per 15–20s of runtime.
- **Load the deferred Higgsfield tools via ToolSearch first** (search "higgsfield generate_video media_upload jobs_wait" or `select:` the Higgsfield server's `generate_video`, `media_upload`, `media_confirm`, `jobs_wait`, `job_display`, `balance` — the server prefix varies per session).
- **Identity B-roll** (the creator doing the action — preferred when a photo is available or a clean raw frame can serve): `media_upload` → `curl --upload-file` to the returned URL → `media_confirm` (`type:"image"`), then `generate_video` with `model:"seedance_2_0"`, `medias:[{value:<media_id>, role:"image"}]` (role `image`, NOT `start_image`), `duration:10`, `aspect_ratio:"16:9"`, `resolution:"1080p"`. Generic scenes: same call, no media.
- **Prompt recipe (YouTube grade)**: `<scene/action>, cinematic shallow depth of field, natural color grade matching a modern YouTube documentary, soft key light, slow dolly/slider move, 35mm texture, identity preserved.` Full-screen B-roll must match the VIDEO's grade — do NOT force dark/moody like the IG skill (that rule exists to blend into a black band; there is no black band here).
- Preflight cost with `get_cost:true` once if credits matter. Poll `jobs_wait`/`sync:true`; if pending, `ScheduleWakeup` 120s+, never busy-poll. Download to `broll/` with `curl -L`.
- **Trim to the best slice**: contact-sheet the 10s result, pick the best-motion 3–6s, use `trim=START:END` in the compose chain.
- If a generated clip contradicts the voiceover or looks off, regenerate with a tweaked prompt or fall back to mode A/B for that window — bad B-roll is worse than none.

## ERRORS NOT TO REPEAT (this skill — read famous-reel-editor's table too)
| Error | Rule |
|---|---|
| Vertical-card thinking on a 16:9 frame | A centered narrow column on a wide black frame looks like a cropped reel. Design cards landscape-first: side-by-side layouts, wide graphs, three columns. |
| Never leaving full-screen animation | Mode B for minutes = a screensaver with narration. Return to the face (A) regularly; the rhythm rules are load-bearing. |
| Cutting modes mid-word | Shot changes between words only — use the transcript times, never round numbers. |
| PiP over the card's key visual | Reserve the PiP corner (bottom-right 520x340) as a dead zone in every mode-C card layout. |
| Burned captions on a YouTube video | The user does NOT want captions on long-form YouTube — never render/overlay them; YouTube supplies its own CC. |
| Background music on a YouTube video | The user does NOT want bg music on long-form YouTube — voice only, unless explicitly requested. |
| Dark-moody B-roll rule copied from IG | That rule is for blending into the reel's black band. Full-screen YouTube B-roll matches the video's natural grade. |
| Bare-text cards ("big keyword on glow") | Reads as lazy, not "Premiere". Every card gets window chrome (title bar + panel) or a card/tile shape — see the card vocabulary section. |
| Absolute-positioned stamps over panel content | A rotated stamp placed `position:absolute` inside a window covered the row values (INSANE over FREE/PERMISSIVE). Stamps live BESIDE/BELOW the panel in flex flow (`align-self:flex-end`), never absolutely over rows. |
| Gaps >5s with nothing new on screen | Kills retention. After writing the shot plan, list every event (mode change, punch-in, card element) chronologically and check consecutive gaps; break any >5s gap with a punch-in, split card, or B-roll window. |
| Running the reel scripts unpatched on 16:9 | `cutjoin.py` hardcodes `scale=1080:1920` crop + `-r 25`. Copy it into the project and patch (`scale=1920:1080,setsar=1`, `-r 30`) BEFORE cutting, or the whole cut comes out vertical/25fps. |

## Notes
- Reference for the full-screen animation vibe: modern "Premiere-style" YouTube explainers (MKBHD-adjacent stat cards, Johnny Harris-style full-frame maps/graphs) — big, confident, one idea per card.
- `hyperframes` renders whatever page size gen.py declares; set 1920x1080 in the template and verify the first rendered frame's dimensions before rendering all cards.
- The accent-color system, schema vocabulary, and reference-reel study workflow from famous-reel-editor all apply unchanged — one accent per video, themeable.
