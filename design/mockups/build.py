import re, sys, pathlib
S = pathlib.Path(__file__).parent
OUT = pathlib.Path("/home/vmj/projects/Projectpulse appdemo/.superpowers/brainstorm/47853-1790745597/content")

def orb(m):
    size, cls = m.group(1), m.group(2) or "br"
    return (f'<div class="orb {cls}" style="width:{size}px;height:{size}px">'
            '<div class="core"><div class="b b1"></div><div class="b b2"></div><div class="b b3"></div><div class="b b4"></div></div><div class="sh"></div></div>')

def logo(m):
    size, col = m.group(1), m.group(2) or "#0000FE"
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 100 100"><path d="M0 100V22Q0 0 22 0H72V20L34 40V100Z" fill="{col}"/>'
            f'<path d="M50 100V50L72 39V100Z" fill="{col}"/></svg>')

def build(name):
    src = (S / f"{name}.body.html").read_text()
    src = re.sub(r'<orb (\d+)(?: ([\w ]+))?/>', orb, src)
    src = re.sub(r'<logo (\d+)(?: (#\w+))?/>', logo, src)
    src = src.replace("<motion/>", (S / "motion.html").read_text())
    src = src.replace("<sb/>", '<div class="island"></div><div class="sb"><span>9:41</span><span>5G ▮</span></div>')
    src = src.replace("<aur/>", '<div class="aur a-c"></div><div class="aur a-b"></div>')
    src = src.replace("<aur3/>", '<div class="aur a-c"></div><div class="aur a-b"></div><div class="aur a-v"></div>')
    src = src.replace("<edge/>", '<div class="edge bl"><div class="spin"></div><div class="mask"></div></div><div class="edge"><div class="spin"></div><div class="mask"></div></div>')
    if name.endswith("-full"):
        scr = (S / f"{name}.js").read_text()
        doc = ('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
               '<title>Project Pulse</title><style>body{margin:0;background:#f3f4f8;padding:28px 36px;font-family:Hanken Grotesk,system-ui}'
               '.subtitle{color:#666;font-size:15px;line-height:1.5;max-width:1100px}h2{font-size:26px;color:#16205A;margin:0 0 6px}</style>'
               + (S / "common.html").read_text() + '</head><body><div class="pp">' + src + '</div>'
               '<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",'
               '"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>'
               '<script type="module">' + scr + '</script></body></html>')
        (OUT / f"{name}.html").write_text(doc)
        return
    (OUT / f"{name}.html").write_text((S / "common.html").read_text() + '<div class="pp">' + src + '</div>')

build(sys.argv[1])
