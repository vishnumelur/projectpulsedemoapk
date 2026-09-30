#!/usr/bin/env python3
"""D8 check: does the 3D model on the Stage screen (05) change with the stage, for every building type?

Compares the model region of the six stage screenshots per type that 41-45-building-*.yaml take
(D8-<type>-3-stage-<n>-<name>.png). The model spins, so a same-stage pair still differs a little. A stage change must
differ clearly more. Expected per spec: Planning (survey plot) != Design/Tender/Contractor (wireframe) != Construction
(scaffold + crane) != Handover (complete, lights on).

usage: stage-diff.py <run dir>   (searches recursively)
"""
import glob, os, sys
from PIL import Image, ImageChops, ImageStat

run = sys.argv[1] if len(sys.argv) > 1 else '.'
# model area on a 1080x2400 screen: below the title, above the stage picker
BOX = (0, 620, 1080, 1700)
GROUPS = [('1-planning',), ('2-design', '3-tender', '4-contractor'), ('5-construction',), ('6-handover',)]

def load(path):
    return Image.open(path).convert('L').crop(BOX).resize((270, 270))

def diff(a, b):
    return ImageStat.Stat(ImageChops.difference(a, b)).mean[0]

ok = True
for t in ['villa', 'shop', 'tower', 'factory', 'reno']:
    shots = {}
    for p in glob.glob(os.path.join(run, '**', f'D8-{t}-3-stage-*.png'), recursive=True):
        key = os.path.basename(p).split('-stage-')[1][:-4]
        shots[key] = load(p)
    if len(shots) < 6:
        print(f'{t:8s} NOT RUN ({len(shots)}/6 stage screenshots)'); ok = False; continue
    within = max(diff(shots['2-design'], shots['3-tender']), diff(shots['3-tender'], shots['4-contractor']))
    between = [diff(shots[GROUPS[i][-1]], shots[GROUPS[i + 1][0]]) for i in range(3)]
    changes = [b > max(4.0, within * 2.5) for b in between]
    verdict = 'PASS' if all(changes) else 'FAIL'
    ok &= verdict == 'PASS'
    print(f'{t:8s} {verdict}  same-group noise {within:5.2f} | planning->design {between[0]:5.2f}  '
          f'contractor->construction {between[1]:5.2f}  construction->handover {between[2]:5.2f}')
sys.exit(0 if ok else 1)
