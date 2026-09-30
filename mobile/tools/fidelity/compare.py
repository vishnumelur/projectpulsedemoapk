import os, sys, json
from PIL import Image, ImageChops, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
REF, SHOT, OUT = f'{ROOT}/design/approved', f'{ROOT}/design/fidelity/shots', f'{ROOT}/design/fidelity'
rows = []
for f in sorted(os.listdir(SHOT)):
    rid = f[:-4]; ref = Image.open(f'{REF}/{f}').convert('RGB'); shot = Image.open(f'{SHOT}/{f}').convert('RGB')
    ref = ref.crop((16, 16, ref.width - 16, ref.height - 16)).resize(shot.size)   # strip the 8px (×2) phone bezel
    diff = ImageChops.difference(ref, shot).convert('L')
    score = sum(1 for p in diff.getdata() if p > 40) / (shot.width * shot.height)
    canvas = Image.new('RGB', (shot.width * 3 + 40, shot.height + 40), 'white'); d = ImageDraw.Draw(canvas)
    for i, (im, label) in enumerate([(ref, 'approved'), (shot, 'app'), (diff.point(lambda p: 255 if p > 40 else 0).convert('RGB'), f'diff {score:.1%}')]):
        canvas.paste(im, (i * (shot.width + 20), 30)); d.text((i * (shot.width + 20), 8), f'{rid} · {label}', fill='black')
    canvas.save(f'{OUT}/{rid}.png'); rows.append((rid, score))
with open(f'{OUT}/report.md', 'w') as fh:
    fh.write('| screen | differing pixels |\n|---|---|\n' + '\n'.join(f'| {r} | {s:.1%} |' for r, s in rows) + '\n')
print(json.dumps({r: round(s, 3) for r, s in rows}, indent=1))
