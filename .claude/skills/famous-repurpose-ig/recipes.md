# Reel Respin - ffmpeg / whisper recipes

All commands assume: `IN` = input path, `WORK` = scratchpad dir, 30fps-ish 9:16 talking-head source. Adapt fps/resolution from the ffprobe result.

## Download (Instagram URL input only)

```bash
yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "$WORK/%(id)s.%(ext)s" "<URL>"
```

`%(id)s` is the reel shortcode - use it for the output name (`~/Downloads/<shortcode>-respin-N.mp4`). If Instagram demands login, retry once with `--cookies-from-browser chrome`; if that also fails, stop and ask the user to save the video manually.

## Probe

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,width,height,r_frame_rate -of json "$IN"
```

## Transcribe (word timestamps)

```bash
whisper "$IN" --model small --language en --word_timestamps True --output_format json --output_dir "$WORK"
```

Use `--model base` if the video is >3 min and speed matters. If the speech is not English, drop `--language en` and let it detect. The JSON has `segments[]` with `start`, `end`, `text`, and `words[]`.

## Randomization ranges (draw fresh values per variant)

| Parameter | Range | Notes |
|---|---|---|
| saturation | 0.92-1.10 | eq filter |
| contrast | 0.97-1.05 | eq filter |
| brightness | -0.03-+0.03 | eq filter |
| gamma | 0.96-1.04 | eq filter |
| speed | 0.97-1.03 | video setpts + audio atempo |
| pitch | 0.985-1.015 | asetrate method, independent of speed |
| drift amplitude | 12-24 px | Ken Burns sin/cos drift |
| drift periods | 6-11 s | two different periods for x and y |
| EQ tilt | ±1.5 dB | low shelf one way, high shelf the other |
| CRF | 19-23 | final encode |
| start trim | 0.1-0.4 s | extra shave off segment 1 |
| end trim | 0.1-0.5 s | shave off last segment |

Generate the values with `$RANDOM` in bash or by picking them yourself; record them for the report.

## Pass 1 - cut, concat, transform

Cut each planned segment losslessly-ish to intermediates (re-encode for frame accuracy):

```bash
ffmpeg -y -ss <start> -to <end> -i "$IN" -c:v libx264 -crf 16 -preset fast -c:a aac -b:a 192k "$WORK/seg_00.mp4"
```

Concat via demuxer (`file 'seg_00.mp4'` lines in `concat.txt`):

```bash
ffmpeg -y -f concat -safe 0 -i "$WORK/concat.txt" -c copy "$WORK/cut.mp4"
```

Then one transform pass (example values shown - substitute your random draws; drop `hflip,` when flip is off):

```bash
ffmpeg -y -i "$WORK/cut.mp4" -filter_complex "\
[0:v]hflip,\
eq=saturation=1.06:contrast=1.02:brightness=0.01:gamma=0.98,\
scale=1188:2112,\
crop=1080:1920:x='(iw-ow)/2+18*sin(t/7.3)':y='(ih-oh)/2+14*cos(t/9.1)',\
setpts=PTS/1.02,fps=30[v];\
[0:a]atempo=1.02,\
asetrate=48000*1.01,aresample=48000,atempo=1/1.01,\
equalizer=f=120:t=q:w=1:g=1.2,equalizer=f=8000:t=q:w=1:g=-1.0[a]" \
-map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset medium -c:a aac -b:a 192k "$WORK/assembled.mp4"
```

Notes:
- `scale` to 110% then animated `crop` = Ken Burns drift; the sin/cos periods must differ so the path never repeats.
- The `asetrate/aresample/atempo` trio shifts pitch without changing duration; it stacks after the speed `atempo`.
- If the source is landscape, first crop/scale it to 9:16 before this chain (center crop, or ask nothing - center is the automatic choice).

## Pass 2 - captions

Re-transcribe `assembled.mp4` (same whisper command). Build `captions.ass`:

- PlayRes 1080x1920. One Style line, randomized per variant:
  - Font: pick from Arial Black, Helvetica Neue Bold, Futura Bold, Avenir Next Heavy
  - PrimaryColour white; pick ONE accent colour (yellow `&H0000FFFF`, green `&H0000FF00`, cyan `&H00FFFF00`, orange `&H0000A5FF`) used via `{\c}` on 1-2 emphasis words per caption
  - Fontsize 84-100, Bold 1, BorderStyle 1, Outline 5-7, Shadow 0-2
  - Alignment 2 (bottom-center), MarginV mapped to 72-80% vertical position (MarginV ≈ 1920*(1-pos))
- Dialogue lines: group words into 2-4 word chunks on whisper word timings, text uppercase, no punctuation except ? and !

Burn + final encode + fresh metadata in one pass:

```bash
ffmpeg -y -i "$WORK/assembled.mp4" -vf "ass=$WORK/captions.ass" \
-map_metadata -1 -metadata creation_time="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
-metadata encoder="Lavf" -movflags +faststart \
-c:v libx264 -crf <CRF> -preset medium -pix_fmt yuv420p \
-af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k \
"<dir-of-input>/<basename>-respin-<N>.mp4"
```

## Verify

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type -of json "<output>"
```

Duration should be within ~±10% of the original (report the exact numbers). Confirm one video + one audio stream.

## B-roll splice (--broll only)

After generating a Higgsfield clip `broll.mp4` (9:16, 3-4s) for a chosen transcript moment at assembled-timeline time T:

```bash
ffmpeg -y -i "$WORK/assembled.mp4" -i "$WORK/broll_scaled.mp4" -filter_complex "\
[1:v]scale=1080:1920,setpts=PTS+<T>/TB[b];\
[0:v][b]overlay=enable='between(t,<T>,<T+dur>)'[v]" \
-map "[v]" -map 0:a -c:v libx264 -crf 17 -c:a copy "$WORK/assembled_broll.mp4"
```

Original voice audio stays; B-roll video overlays it for its duration. Then continue to Pass 2 (captions go on top).
