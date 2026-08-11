#!/usr/bin/env python3
# Landscape 1920x1080 "Premiere-style" card generator — UI panels/app windows, not bare text.
import json, re, html, sys

A = "#00E599"; AD = "rgba(0,229,153,0.45)"; GL = "rgba(0,229,153,0.16)"
RED = "#ff5470"; REDD = "rgba(255,84,112,0.45)"

d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "../edit/tF/transcripts/cutF.json"))
WS = [w for w in d["words"] if w.get("type") != "spacing" and w.get("start") is not None]
TOTAL = 75.03
def norm(s): return re.sub(r"[^a-z0-9 ]", "", s.lower())
TOK = [norm(w["text"]) for w in WS]
def find_after(trig, after):
    tt = norm(trig).split()
    for i in range(len(TOK) - len(tt) + 1):
        if TOK[i:i+len(tt)] == tt and WS[i]["start"] >= after - 0.01:
            return round(WS[i]["start"], 2)
    return after
def esc(s): return html.escape(s)

EXPECT = [
    ("Kimi", 4.5, 5.5), ("Fable", 14.0, 15.5), ("GPT", 15.3, 16.5),
    ("insane", 18.0, 19.2), ("scores", 23.5, 24.7), ("Marathon.", 33.0, 34.0),
    ("surprise", 46.0, 47.0), ("free", 59.2, 60.2), ("canceling", 68.2, 69.2),
]
for t, lo, hi in EXPECT:
    got = find_after(t, lo)
    assert lo <= got <= hi, f"anchor {t!r} at {got}, expected [{lo},{hi}]"

def win(title, body, wid="", extra=""):
    """macOS-style app window: title bar with traffic dots + title + body."""
    return (f'<div class="win {wid}" {extra}><div class="tbar"><span class="dot r"></span>'
            f'<span class="dot y"></span><span class="dot g"></span>'
            f'<span class="ttxt">{esc(title)}</span></div><div class="wbody">{body}</div></div>')

BEATS = [
    ("release",     4.94,  8.14, "release", {}),
    ("bars",       12.98, 17.36, "bars", {
        "rows": [("KIMI K3", 96.4, True, 13.10), ("FABLE 5", 97.1, False, find_after("Fable", 14.0)),
                 ("GPT 5.6", 96.8, False, find_after("GPT", 15.3))]}),
    ("insane",     17.36, 21.00, "insane", {}),
    ("over56",     21.00, 27.00, "over56", {}),
    ("leaderboard",27.00, 32.36, "leaderboard", {
        "rows": [("1", "KIMI K3", "62.4%", True), ("2", "GPT 5.6", "59.8%", False), ("3", "FABLE 5", "58.1%", False)]}),
    ("same",       32.36, 36.36, "same", {}),
    ("surprise",   44.60, 47.32, "surprise", {}),
    ("free",       58.20, 60.60, "free", {}),
    ("cancel",     67.46, 70.36, "cancel", {}),
]

def inner(i, kind, p, s):
    if kind == "release":
        body = (f'<div class="relrow"><div><div class="badge" id="bd{i}">JUST RELEASED</div>'
                f'<div class="mega" id="mg{i}">KIMI <span class="acc">K3</span></div>'
                f'<div class="chiprow" id="ch{i}"><span class="chip">v3.0</span><span class="chip">OPEN WEIGHTS</span><span class="chip acc2">MOONSHOT AI</span></div></div>'
                f'<svg class="wsvg" viewBox="0 0 560 420" preserveAspectRatio="none">'
                f'<polyline id="rl{i}" points="16,350 110,325 205,335 300,265 395,275 470,150 545,45" style="stroke:{A}"/>'
                f'<circle id="rc{i}" cx="545" cy="45" r="13" fill="{A}"/></svg></div>')
        return f'<div class="centerwrap">{win("moonshot.ai — release notes", body, "wbig")}</div>'
    if kind == "bars":
        rows = ""
        for j, (name, val, hot, _) in enumerate(p["rows"]):
            rows += (f'<div class="brow" id="br{i}{j}"><span class="bname{" hot" if hot else ""}">{esc(name)}</span>'
                     f'<div class="btrack"><div class="bfill{" hot" if hot else ""}" id="bf{i}{j}" style="width:{val}%"></div></div>'
                     f'<span class="bval">{val}</span></div>')
        body = f'<div class="paneltitle">FRONTIER SCORE <span class="acc">— RIGHT UP THERE</span></div>{rows}'
        return f'<div class="centerwrap">{win("benchmark_dashboard", body, "wbig")}</div>'
    if kind == "insane":
        rows = "".join(f'<div class="lrow" id="ir{i}{j}"><span class="lck">{ck}</span><span class="lt">{esc(t)}</span><span class="lv acc">{esc(v)}</span></div>'
                       for j, (ck, t, v) in enumerate([("✓", "WEIGHTS", "OPEN"), ("✓", "LICENSE", "PERMISSIVE"), ("✓", "COST", "FREE")]))
        body = rows
        return (f'<div class="leftwrap">{win("open_source.txt", body, "wmed")}'
                f'<div class="stamp" id="st{i}">INSANE</div></div>')
    if kind == "over56":
        cols = [("FABLE 5", 78, False), ("GPT 5.6", 80, False), ("KIMI K3", 88, True)]
        ch = ""
        for j, (n, hgt, hot) in enumerate(cols):
            ch += (f'<div class="col"><div class="cbarw"><div class="cbar{" hot" if hot else ""}" id="cb{i}{j}" style="height:{hgt}%"></div></div>'
                   f'<span class="cname{" hot" if hot else ""}">{esc(n)}</span></div>')
        body = (f'<div class="paneltitle">MANY BENCHMARKS</div><div class="chart">{ch}'
                f'<div class="gline" id="gl{i}"></div><div class="delta" id="dl{i}">▲ SCORES OVER GPT 5.6</div></div>')
        return f'<div class="centerwrap">{win("scores_vs_gpt56.chart", body, "wbig")}</div>'
    if kind == "leaderboard":
        rows = ""
        for j, (rk, n, sc, hot) in enumerate(p["rows"]):
            rows += (f'<div class="lb{" hot" if hot else ""}" id="lb{i}{j}"><span class="lrk">{rk}</span>'
                     f'<span class="lnm">{esc(n)}</span><span class="lsc">{sc}</span></div>')
        body = f'<div class="paneltitle">RANKS <span class="acc">#1</span></div>{rows}'
        return f'<div class="leftwrap">{win("programbench — leaderboard", body, "wmed")}</div>'
    if kind == "same":
        t1 = win("swe_marathon", '<div class="tilebig acc">#1</div><div class="tilesub">KIMI K3</div>', "wtile")
        t2 = win("agentic_bench", '<div class="tilebig acc">#1</div><div class="tilesub">KIMI K3</div>', "wtile")
        return (f'<div class="centerwrap"><div class="paneltitle over">SAME STORY</div><div class="tilerow">'
                f'<div id="tl{i}0">{t1}</div><div id="tl{i}1">{t2}</div></div></div>')
    if kind == "surprise":
        body = (f'<div class="term"><div class="tline" id="t1{i}"><span class="acc">$</span> run real_world_test.sh</div>'
                f'<div class="tline" id="t2{i}">▸ loading kimi-k3 …</div>'
                f'<div class="tline big" id="t3{i}">RESULTS: <span class="acc">MIGHT SURPRISE YOU</span><span class="cur" id="cu{i}">▌</span></div></div>')
        return f'<div class="centerwrap">{win("albert@mac — real_world_test", body, "wbig")}</div>'
    if kind == "free":
        body = (f'<div class="price"><div class="ptitle">AI EDUCATION</div><div class="pnum" id="pn{i}">$0</div>'
                f'<div class="pbtn" id="pb{i}">FREE FOR EVERYONE</div></div>')
        return f'<div class="centerwrap">{win("pricing", body, "wmed")}</div>'
    if kind == "cancel":
        c1 = win("claude.ai — subscription", '<div class="subname">CLAUDE</div><div class="subprice">$20<span>/mo</span></div><div class="xstamp" id="xs{}">CANCEL?</div>'.format(i), "wtile")
        c2 = win("kimi — subscription", '<div class="subname">KIMI K3</div><div class="subprice acc">$0<span>/mo</span></div><div class="okstamp">OPEN</div>', "wtile")
        return (f'<div class="leftwrap"><div class="tilerow tight">'
                f'<div id="cc{i}0">{c1}</div><div id="cc{i}1">{c2}</div></div></div>')
    return ""

clips = []; tw = []
for i, (key, s, e, kind, p) in enumerate(BEATS):
    dur = e - s
    clips.append(f'<div class="beat" id="beat{i}" data-start="{s}" data-duration="{dur:.2f}" data-track-index="{i+2}">'
                 f'<div class="inner" id="in{i}">{inner(i, kind, p, s)}</div></div>')
    js = [f'tl.fromTo("#beat{i}",{{opacity:0,y:40,scale:0.96}},{{opacity:1,y:0,scale:1,duration:0.24,ease:"power3.out"}},{s:.2f});']
    if kind == "release":
        js.append(f'tl.fromTo("#mg{i}",{{opacity:0,y:50}},{{opacity:1,y:0,duration:0.4,ease:"power3.out"}},{s+0.15:.2f});')
        js.append(f'tl.fromTo("#ch{i}",{{opacity:0,y:24}},{{opacity:1,y:0,duration:0.35,ease:"power3.out"}},{find_after("released", 6.0):.2f});')
        js.append(f'tl.fromTo("#rl{i}",{{attr:{{"stroke-dashoffset":1300}}}},{{attr:{{"stroke-dashoffset":0}},duration:1.2,ease:"power2.out"}},{s+0.3:.2f});')
        js.append(f'tl.fromTo("#rc{i}",{{opacity:0,scale:0}},{{opacity:1,scale:1,duration:0.3,ease:"back.out(2)"}},{s+1.4:.2f});')
    if kind == "bars":
        for j, (_, _, _, at) in enumerate(p["rows"]):
            js.append(f'tl.fromTo("#br{i}{j}",{{opacity:0,x:-70}},{{opacity:1,x:0,duration:0.28,ease:"power3.out"}},{at:.2f});')
            js.append(f'tl.fromTo("#bf{i}{j}",{{scaleX:0}},{{scaleX:1,duration:0.7,ease:"power2.out"}},{at+0.1:.2f});')
    if kind == "insane":
        for j in range(3):
            js.append(f'tl.fromTo("#ir{i}{j}",{{opacity:0,x:-50}},{{opacity:1,x:0,duration:0.24,ease:"power3.out"}},{s+0.2+j*0.3:.2f});')
        js.append(f'tl.fromTo("#st{i}",{{opacity:0,scale:1.7,rotate:-10}},{{opacity:1,scale:1,rotate:-6,duration:0.3,ease:"back.out(2)"}},{find_after("insane", 18.0):.2f});')
    if kind == "over56":
        for j in range(3):
            js.append(f'tl.fromTo("#cb{i}{j}",{{scaleY:0}},{{scaleY:1,duration:0.6,ease:"power2.out"}},{s+0.2+j*0.35:.2f});')
        sc = find_after("scores", 23.5)
        js.append(f'tl.fromTo("#gl{i}",{{opacity:0}},{{opacity:1,duration:0.3}},{s+1.3:.2f});')
        js.append(f'tl.fromTo("#dl{i}",{{opacity:0,scale:0.6,y:20}},{{opacity:1,scale:1,y:0,duration:0.32,ease:"back.out(2)"}},{sc:.2f});')
    if kind == "leaderboard":
        for j in range(3):
            js.append(f'tl.fromTo("#lb{i}{j}",{{opacity:0,x:-70}},{{opacity:1,x:0,duration:0.26,ease:"power3.out"}},{s+0.2+j*0.5:.2f});')
    if kind == "same":
        js.append(f'tl.fromTo("#tl{i}0",{{opacity:0,y:50,scale:0.9}},{{opacity:1,y:0,scale:1,duration:0.3,ease:"back.out(1.7)"}},{32.60:.2f});')
        js.append(f'tl.fromTo("#tl{i}1",{{opacity:0,y:50,scale:0.9}},{{opacity:1,y:0,scale:1,duration:0.3,ease:"back.out(1.7)"}},{find_after("benchmark right", 34.5):.2f});')
    if kind == "surprise":
        js.append(f'tl.fromTo("#t1{i}",{{opacity:0}},{{opacity:1,duration:0.12}},{s+0.15:.2f});')
        js.append(f'tl.fromTo("#t2{i}",{{opacity:0}},{{opacity:1,duration:0.12}},{s+0.7:.2f});')
        js.append(f'tl.fromTo("#t3{i}",{{opacity:0,y:16}},{{opacity:1,y:0,duration:0.25,ease:"power3.out"}},{find_after("surprise", 46.0):.2f});')
        js.append(f'tl.to("#cu{i}",{{opacity:0,duration:0.35,yoyo:true,repeat:6,ease:"steps(1)"}},{s+0.2:.2f});')
    if kind == "free":
        js.append(f'tl.fromTo("#pn{i}",{{opacity:0,scale:0.5}},{{opacity:1,scale:1,duration:0.35,ease:"back.out(2)"}},{s+0.2:.2f});')
        js.append(f'tl.fromTo("#pb{i}",{{opacity:0,y:24}},{{opacity:1,y:0,duration:0.3,ease:"power3.out"}},{find_after("free", 59.2):.2f});')
    if kind == "cancel":
        js.append(f'tl.fromTo("#cc{i}0",{{opacity:0,x:-60}},{{opacity:1,x:0,duration:0.28,ease:"power3.out"}},{s+0.15:.2f});')
        js.append(f'tl.fromTo("#cc{i}1",{{opacity:0,x:60}},{{opacity:1,x:0,duration:0.28,ease:"power3.out"}},{s+0.45:.2f});')
        js.append(f'tl.fromTo("#xs{i}",{{opacity:0,scale:1.8,rotate:-12}},{{opacity:1,scale:1,rotate:-8,duration:0.3,ease:"back.out(2)"}},{find_after("canceling", 68.2):.2f});')
    js.append(f'tl.to("#beat{i}",{{opacity:0,duration:0.16,ease:"power2.in"}},{e-0.16:.2f});')
    tw.append("\n      ".join(js))

NP = 26
parts_html = "".join(f'<span class="pt" style="left:{(k*173+60)%1860}px;top:{(k*97+30)%1020}px;width:{5+(k%3)*3}px;height:{5+(k%3)*3}px;opacity:{0.12+0.2*((k*7)%5)/5:.2f}" id="pt{k}"></span>' for k in range(NP))
streaks_html = "".join(f'<span class="stk" id="stk{k}" style="top:{160+k*300}px"></span>' for k in range(3))
bg = ['tl.to("#glow",{x:160,y:40,scale:1.15,duration:6,yoyo:true,repeat:12,ease:"sine.inOut"},0);',
      'tl.to("#grid",{backgroundPosition:"0px 110px",duration:6,ease:"none",repeat:12},0);']
for k in range(NP):
    du = 4 + (k % 5)
    bg.append(f'tl.to("#pt{k}",{{y:-{120+(k%4)*60},duration:{du},ease:"none",repeat:{int(TOTAL/du)+1}}},0);')
    bg.append(f'tl.to("#pt{k}",{{opacity:0,duration:{du},yoyo:true,repeat:{int(TOTAL/du)+1},ease:"sine.inOut"}},0);')
for k in range(3):
    bg.append(f'tl.fromTo("#stk{k}",{{x:-2100}},{{x:2100,duration:{5+k*2},ease:"none",repeat:12}},{k*1.5});')

HTML = f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=1920, height=1080"/>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"Montserrat";src:url("assets/Montserrat-VariableFont_wght.ttf");font-weight:100 900}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Montserrat","Inter",sans-serif}}
#root{{position:relative;width:1920px;height:1080px}}
#bgz{{position:absolute;inset:0;overflow:hidden}}
#grid{{position:absolute;inset:-40px;background-image:linear-gradient(rgba(0,229,153,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,153,0.05) 1px,transparent 1px);background-size:110px 110px}}
#glow{{position:absolute;top:180px;left:620px;width:680px;height:680px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,153,0.22),transparent 65%);filter:blur(26px)}}
.pt{{position:absolute;border-radius:50%;background:{A};box-shadow:0 0 12px {A}}}
.stk{{position:absolute;left:0;width:640px;height:2px;background:linear-gradient(90deg,transparent,{A},transparent);opacity:0.3}}
.beat{{position:absolute;inset:0}}
.inner{{position:absolute;inset:0}}
.acc{{color:{A}}} .acc2{{color:{A};border-color:{AD}}}
.centerwrap{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px}}
.leftwrap{{position:absolute;top:0;bottom:0;left:110px;display:flex;flex-direction:column;justify-content:center;max-width:1280px}}
/* app window */
.win{{background:rgba(8,13,11,0.92);border:1px solid rgba(255,255,255,0.10);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,0.6),0 0 40px {GL};overflow:hidden}}
.wbig{{width:1500px}} .wmed{{width:1150px}} .wtile{{width:560px}}
.tbar{{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.07);padding:20px 28px}}
.dot{{width:20px;height:20px;border-radius:50%}} .dot.r{{background:#ff5f57}} .dot.y{{background:#febc2e}} .dot.g{{background:#28c840}}
.ttxt{{color:#8b938e;font-size:26px;font-weight:700;letter-spacing:1px;margin-left:14px}}
.wbody{{padding:44px 52px;display:flex;flex-direction:column;gap:26px}}
.paneltitle{{color:#fff;font-size:56px;font-weight:900;letter-spacing:-1px}}
.paneltitle.over{{text-align:center;font-size:64px;text-shadow:0 0 30px {GL}}}
/* release */
.relrow{{display:flex;align-items:center;gap:60px}}
.badge{{align-self:flex-start;display:inline-block;color:#06140d;background:{A};font-size:28px;font-weight:900;letter-spacing:4px;border-radius:12px;padding:10px 22px;box-shadow:0 0 24px {AD};margin-bottom:22px}}
.mega{{color:#fff;font-size:150px;font-weight:900;line-height:0.92;letter-spacing:-3px;text-shadow:0 0 40px {GL}}}
.chiprow{{display:flex;gap:16px;margin-top:26px}}
.chip{{color:#aeb6b1;border:1px solid rgba(255,255,255,0.16);border-radius:999px;font-size:26px;font-weight:800;padding:10px 24px}}
.wsvg{{width:560px;height:420px;flex:none}}
.wsvg polyline{{fill:none;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1300;filter:drop-shadow(0 0 12px {A})}}
/* bars */
.brow{{display:flex;align-items:center;gap:32px}}
.bname{{width:280px;color:#aeb6b1;font-size:42px;font-weight:900}} .bname.hot{{color:{A}}}
.btrack{{flex:1;height:52px;background:rgba(255,255,255,0.07);border-radius:26px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}}
.bfill{{height:100%;border-radius:26px;transform-origin:left;background:linear-gradient(90deg,#3a4340,#6f7a75)}}
.bfill.hot{{background:linear-gradient(90deg,{A},#7af0c8);box-shadow:0 0 22px {A}}}
.bval{{width:130px;color:#fff;font-size:42px;font-weight:900;text-align:right}}
/* insane rows */
.lrow{{display:flex;align-items:center;gap:28px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px 34px}}
.lck{{color:{A};font-size:44px;font-weight:900}} .lt{{color:#fff;font-size:44px;font-weight:800;flex:1}}
.lv{{font-size:44px;font-weight:900}}
.stamp{{align-self:flex-end;margin-top:34px;margin-right:20px;color:{RED};font-size:96px;font-weight:900;border:6px solid {RED};border-radius:20px;padding:6px 34px;text-transform:uppercase;box-shadow:0 0 34px {REDD};transform:rotate(-6deg)}}
/* over56 chart */
.chart{{position:relative;display:flex;align-items:flex-end;gap:90px;height:520px;padding:0 60px;justify-content:center}}
.col{{display:flex;flex-direction:column;align-items:center;gap:18px;height:100%;justify-content:flex-end}}
.cbarw{{width:140px;height:400px;display:flex;align-items:flex-end}}
.cbar{{width:100%;border-radius:16px 16px 6px 6px;transform-origin:bottom;background:linear-gradient(180deg,#6f7a75,#3a4340)}}
.cbar.hot{{background:linear-gradient(180deg,{A},#0a8f63);box-shadow:0 0 28px {A}}}
.cname{{color:#aeb6b1;font-size:34px;font-weight:900}} .cname.hot{{color:{A}}}
.gline{{position:absolute;left:30px;right:30px;top:100px;border-top:4px dashed {REDD}}}
.delta{{position:absolute;right:40px;top:30px;color:#06140d;background:{A};font-size:34px;font-weight:900;border-radius:14px;padding:14px 26px;box-shadow:0 0 28px {AD}}}
/* leaderboard */
.lb{{display:flex;align-items:center;gap:36px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px 36px}}
.lb.hot{{border:2px solid {A};box-shadow:0 0 26px {GL}}}
.lrk{{color:#6f776f;font-size:46px;font-weight:900;width:60px}} .lb.hot .lrk{{color:{A}}}
.lnm{{color:#fff;font-size:50px;font-weight:900;flex:1}}
.lsc{{color:#aeb6b1;font-size:44px;font-weight:800}} .lb.hot .lsc{{color:{A}}}
/* tiles */
.tilerow{{display:flex;gap:60px;justify-content:center}}
.tilerow.tight{{gap:44px;justify-content:flex-start}}
.tilebig{{font-size:150px;font-weight:900;text-align:center;text-shadow:0 0 34px {GL}}}
.tilesub{{color:#fff;font-size:44px;font-weight:900;text-align:center}}
/* terminal */
.term{{font-family:"Menlo","Consolas",monospace;display:flex;flex-direction:column;gap:24px}}
.tline{{color:#aeb6b1;font-size:40px;font-weight:600}}
.tline.big{{color:#fff;font-size:64px;font-weight:800}}
.cur{{color:{A};margin-left:8px}}
/* price */
.price{{display:flex;flex-direction:column;align-items:center;gap:22px;padding:10px 0}}
.ptitle{{color:#aeb6b1;font-size:40px;font-weight:900;letter-spacing:6px}}
.pnum{{color:#fff;font-size:210px;font-weight:900;line-height:0.9;text-shadow:0 0 50px {GL}}}
.pbtn{{color:#06140d;background:{A};font-size:40px;font-weight:900;border-radius:16px;padding:20px 44px;box-shadow:0 0 30px {AD}}}
/* subscription cards */
.subname{{color:#fff;font-size:52px;font-weight:900;text-align:center}}
.subprice{{color:#aeb6b1;font-size:110px;font-weight:900;text-align:center}} .subprice span{{font-size:44px}}
.subprice.acc{{color:{A};text-shadow:0 0 30px {GL}}}
.xstamp{{align-self:center;color:{RED};font-size:52px;font-weight:900;border:4px solid {RED};border-radius:14px;padding:4px 22px;transform:rotate(-8deg);box-shadow:0 0 24px {REDD}}}
.okstamp{{align-self:center;color:{A};font-size:52px;font-weight:900;border:4px solid {A};border-radius:14px;padding:4px 22px;box-shadow:0 0 24px {AD}}}
.wtile .wbody{{gap:18px;align-items:center}}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.2f}" data-width="1920" data-height="1080">
  <div id="bgz" data-start="0" data-duration="{TOTAL:.2f}" data-track-index="0"><div id="grid"></div><div id="glow"></div>{streaks_html}{parts_html}</div>
  {"".join(clips)}
</div>
<script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});
      {chr(10).join(bg)}
      {chr(10).join(tw)}
window.__timelines["main"]=tl;</script></body></html>'''
open("index.html", "w").write(HTML)
print(f"{len(BEATS)} cards, TOTAL={TOTAL}")
for key, s, e, kind, _ in BEATS: print(f"  {s:6.2f}-{e:6.2f}  {kind}")
