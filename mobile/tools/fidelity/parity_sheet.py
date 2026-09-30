"""Contact sheet of the parity captures: models as rows, screens as columns -> design/fidelity/3d-parity.png"""
import os
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
SRC, OUT = f'{ROOT}/design/fidelity/parity', f'{ROOT}/design/fidelity/3d-parity.png'
MODELS = ['villa', 'shop', 'tower', 'factory', 'reno']
COLS = ['building', 'chosen', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'home', 'project']
W, H, PAD, TOP, LEFT = 254, 554, 10, 30, 70
sheet = Image.new('RGB', (LEFT + len(COLS) * (W + PAD), TOP + len(MODELS) * (H + PAD)), 'white')
d = ImageDraw.Draw(sheet)
for c, name in enumerate(COLS): d.text((LEFT + c * (W + PAD) + 4, 10), name, fill='black')
for r, m in enumerate(MODELS):
    d.text((8, TOP + r * (H + PAD) + H // 2), m, fill='black')
    for c, name in enumerate(COLS):
        p = f'{SRC}/{m}-{name}.png'
        if os.path.exists(p): sheet.paste(Image.open(p).convert('RGB').resize((W, H)), (LEFT + c * (W + PAD), TOP + r * (H + PAD)))
sheet.save(OUT); print(OUT, sheet.size)
