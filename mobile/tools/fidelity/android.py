"""Android fidelity capture: deep-links every gallery screen into Expo Go on the connected
device/emulator, screencaps it, and writes a side-by-side (approved screen area | Android).

usage: python3 tools/fidelity/android.py [comma-separated ids] [--wait SECONDS] [--no-capture]
env:   EXP_URL (default exp://192.168.100.83:8083), ADB (default ~/Android/Sdk/platform-tools/adb)
out:   design/fidelity/android/shots/<id>.png (raw, gitignored), design/fidelity/android/<id>.png
"""
import os, re, subprocess, sys, time
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
REF = f'{ROOT}/design/approved'
OUT = f'{ROOT}/design/fidelity/android'
SHOTS = f'{OUT}/shots'
ADB = os.environ.get('ADB', os.path.expanduser('~/Android/Sdk/platform-tools/adb'))
EXP = os.environ.get('EXP_URL', 'exp://192.168.100.83:8083')

def gallery():
    src = open(f'{HERE}/../../src/nav/gallery.ts').read()
    return [dict(id=i, href=h) for i, h in re.findall(r"id: '([^']+)'.*?href: '([^']+)'", src)]

def adb(*a, out=False):
    r = subprocess.run([ADB, *a], capture_output=True)
    return r.stdout if out else None

def dev_menu_open():
    adb('shell', 'uiautomator', 'dump', '/sdcard/ui.xml')
    xml = adb('exec-out', 'cat', '/sdcard/ui.xml', out=True).decode('utf8', 'ignore')
    return 'Toggle element inspector' in xml or 'Go home' in xml

def dismiss_dev_menu():
    for _ in range(3):
        if not dev_menu_open(): return
        adb('shell', 'input', 'keyevent', '4'); time.sleep(1.5)

def open_href(href, cold=True):
    # Cold start per screen: a warm deep link to the same route only merges params into the mounted screen (and a growing
    # stack keeps every GL view alive). The demo store persists in AsyncStorage, so seeded state carries over.
    if 'stay=' not in href: href += ('&' if '?' in href else '?') + 'stay=1'
    if cold: adb('shell', 'am', 'force-stop', 'host.exp.exponent'); time.sleep(1)
    # one quoted string: adb shell runs it through the device's sh, where an unquoted & would cut the URL
    adb('shell', f"am start -a android.intent.action.VIEW -d '{EXP}/--{href}'")

def wait_device():
    for _ in range(120):
        if b'\tdevice' in adb('devices', out=True): return
        time.sleep(5)
    raise SystemExit('device gone')

def wait_for(i, default):
    if i in ('08-home', '11-experts', '12-expert-profile') or i.startswith('17') or i.startswith('04') or i.startswith('05'): return default + 6
    return default

def loading(png):
    # Expo Go's cold-start splash (its blue logo in the centre) or a blank white loading screen
    import io
    im = Image.open(io.BytesIO(png)).convert('RGB'); w, h = im.size
    isblue = lambda p: p[2] > 200 and p[0] < 90 and p[1] < 190
    logo = all(isblue(im.getpixel((int(w * f), int(h * 0.47)))) for f in (0.36, 0.5, 0.64))
    blank = all(all(v > 250 for v in im.getpixel((x, y))) for x in (w // 10, w // 2, w - w // 10) for y in (int(h * 0.3), int(h * 0.8)))
    return logo or blank

def wait_loaded(extra=45):
    png = adb('exec-out', 'screencap', '-p', out=True)
    for _ in range(extra // 3):
        if png and not loading(png): break
        time.sleep(3); png = adb('exec-out', 'screencap', '-p', out=True)
    return png

def side_by_side(i):
    ref = Image.open(f'{REF}/{i}.png').convert('RGB')
    ref = ref.crop((16, 16, ref.width - 16, ref.height - 16))           # strip the 8px (x2) bezel -> 508x1108
    shot = Image.open(f'{SHOTS}/{i}.png').convert('RGB')
    shot = shot.resize((ref.width, round(shot.height * ref.width / shot.width)), Image.LANCZOS)
    h = max(ref.height, shot.height)
    canvas = Image.new('RGB', (ref.width * 2 + 20, h + 30), 'white'); d = ImageDraw.Draw(canvas)
    canvas.paste(ref, (0, 30)); canvas.paste(shot, (ref.width + 20, 30))
    d.text((0, 8), f'{i} - approved', fill='black'); d.text((ref.width + 20, 8), f'{i} - android', fill='black')
    canvas.save(f'{OUT}/{i}.png')

def main():
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument('ids', nargs='?'); ap.add_argument('--wait', type=int, default=14)
    ap.add_argument('--no-capture', action='store_true')
    ap.add_argument('--reseed', action='store_true', help='reset the demo data before every screen (simulations from one screen change later ones)')
    o = ap.parse_args()
    wait, capture, only = o.wait, not o.no_capture, (o.ids.split(',') if o.ids else None)
    items = [g for g in gallery() if not only or g['id'] in only]
    os.makedirs(SHOTS, exist_ok=True)
    if capture:
        open_href('/dev/gallery'); time.sleep(14); dismiss_dev_menu()      # seeds the demo state
    for g in items:
        if capture:
            if o.reseed: open_href('/dev/gallery'); time.sleep(8); wait_loaded(); time.sleep(3)
            open_href(g['href']); time.sleep(wait_for(g['id'], wait)); dismiss_dev_menu()
            wait_device(); png = wait_loaded()
            if not png: print('no screenshot for', g['id'], flush=True); continue
            open(f"{SHOTS}/{g['id']}.png", 'wb').write(png)
        side_by_side(g['id']); print('captured', g['id'], flush=True)

if __name__ == '__main__':
    main()
