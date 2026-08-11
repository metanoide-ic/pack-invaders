#!/bin/bash
# Compose the Kimi K3 YouTube video from shotplan.json windows. No captions, no music.
set -e
cd "$(dirname "$0")"

ffmpeg -y \
  -i edit/cutF.mp4 \
  -i cards/cards_all.mp4 \
  -i broll/business.mp4 \
  -i broll/testing.mp4 \
  -i broll/datacenter.mp4 \
  -i broll/skeptical.mp4 \
  -filter_complex "
[0:v]split=3[camA][camP][camZ];
[camZ]crop=iw/1.15:ih/1.15:(iw-iw/1.15)/2:(ih-ih/1.15)*0.35,scale=1920:1080,setsar=1[punch];
[camA][punch]overlay=enable='between(t,3.46,4.94)+between(t,73.08,75.03)'[v1];
[v1][1:v]overlay=enable='between(t,4.94,8.14)+between(t,12.98,36.36)+between(t,44.60,47.32)+between(t,58.20,60.60)+between(t,67.46,70.36)'[v2];
[4:v]trim=2.0:4.92,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,setpts=PTS+8.14/TB[brDC];
[v2][brDC]overlay=enable='between(t,8.14,11.06)'[v3];
[5:v]trim=2.0:6.18,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,setpts=PTS+40.42/TB[brSK];
[v3][brSK]overlay=enable='between(t,40.42,44.60)'[v4];
[2:v]trim=2.0:7.24,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,setpts=PTS+50.40/TB[br1];
[v4][br1]overlay=enable='between(t,50.40,55.64)'[v5];
[3:v]trim=2.0:6.62,setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,setpts=PTS+62.84/TB[br2];
[v5][br2]overlay=enable='between(t,62.84,67.46)'[v6];
[camP]scale=480:-2,drawbox=x=0:y=0:w=iw:h=ih:color=0x00E599@1:t=6[pip];
[v6][pip]overlay=x=W-w-48:y=H-h-48:enable='between(t,17.36,21.00)+between(t,27.00,32.36)+between(t,67.46,70.36)'[vout];
[0:a]loudnorm=I=-16[aout]
" -map "[vout]" -map "[aout]" \
  -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t 75.03 \
  final_youtube.mp4
echo DONE
