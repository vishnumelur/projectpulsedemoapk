
// ================= page wiring =================
const warmOf = (model, on) => { const m = M.warm.clone(); m.emissiveIntensity = on; model.solid.traverse(o => { if (o.isMesh && o.material === M.warm) o.material = m; }); return m; };
const FRAME = {
  Villa: { radius: 9.2, target: [0, 1.8, 0], height: 0.5 },
  Shop: { radius: 10.2, target: [0.6, 3.2, 0], height: 0.42 },
  Tower: { radius: 17.5, target: [0, 13, 0], height: 0.22 },
  Factory: { radius: 14.2, target: [0.5, 3.0, 0], height: 0.5 },
  Renovation: { radius: 10.0, target: [0.5, 3.0, 0.5], height: 0.45 },
};
const BUILD = { Villa: buildVilla, Shop: buildShop, Tower: buildTower, Factory: buildFactory, Renovation: buildReno };
const SUB = { Villa: 'Private residence', Shop: 'Retail & F&B', Tower: 'Residential or commercial', Factory: 'Industrial & warehouse', Renovation: 'Upgrade an existing property' };
const frame = (v, name) => { const f = FRAME[name]; v.radius = f.radius; v.height = f.height; v.target.set(...f.target); };

// screen 4: cycles through all five buildings like a swipe
const names = Object.keys(BUILD), models4 = names.map(n => { const m = BUILD[n](); warmOf(m, 0.25); return m; });
const v4 = viewer(document.getElementById('cv-villa'), { radius: 9.2, target: [0, 1.8, 0] });
const nm = document.getElementById('bname'), sub = document.getElementById('bsub'), dots = [...document.querySelectorAll('#bdots i')];
let bi = 0;
function showB(i) {
  bi = i; frame(v4, names[i]); v4.show(models4[i]);
  nm.classList.add('out'); setTimeout(() => { nm.textContent = names[i]; sub.textContent = SUB[names[i]]; nm.classList.remove('out'); }, 220);
  dots.forEach((d, k) => d.classList.toggle('on', k === i));
}
showB(0); setInterval(() => showB((bi + 1) % names.length), 4200);

// screen 4b: chosen villa with lights on
const vB = buildVilla(); warmOf(vB, 0.9);
const sB = viewer(document.getElementById('cv-chosen'), { radius: 9.6, target: [0, 1.8, 0], spin: 0.25 }); sB.show(vB);

// screen 5: stage morph + picker
const v5 = villaStages(buildVilla()); const warm5 = warmOf(v5, 0);
const s5 = viewer(document.getElementById('cv-stage'), { radius: 11.2, target: [0, 3.4, 0], spin: 0.08 });
s5.scene.add(v5.root); s5.model = v5; s5.groups = [v5.solid, v5.build];
const row = document.getElementById('pick'), items = [...row.children], desc = document.getElementById('pdesc');
const DESC = ['Budget, plot and feasibility', 'Drawings and permits', 'Collecting contractor bids', 'Choosing who builds it', 'Work under way on site', 'Finishing and moving in'];
const SLOT = 118;
function setStage(n) {
  items.forEach((el, i) => el.classList.toggle('on', i === n - 1));
  row.style.transform = `translateX(${row.parentElement.clientWidth / 2 - ((n - 1) * SLOT + SLOT / 2)}px)`;
  desc.classList.add('out'); setTimeout(() => { desc.textContent = DESC[n - 1]; desc.classList.remove('out'); }, 200);
  v5.survey.visible = n === 1; v5.wire.visible = n >= 2 && n <= 4; v5.build.visible = n === 5; v5.solid.visible = n >= 5;
  warm5.emissiveIntensity = n === 6 ? 0.9 : 0;
  v5.solid.children.forEach(g => { const r = g.userData.rise; g.userData.hold = n === 5 && r != null && r >= 0.4 && r < 1.0; });
  if (n >= 5) s5.rise(v5.solid, 1.0); if (n === 5) s5.rise(v5.build, 1.0);
}
let st = 3; setStage(3);
items.forEach((b, i) => b.addEventListener('click', () => { st = i + 1; setStage(st); clearInterval(auto); }));
const auto = setInterval(() => { st = st % 6 + 1; setStage(st); }, 2800);

// gallery + hero
document.querySelectorAll('[data-model]').forEach(cv => {
  const name = cv.dataset.model, m = BUILD[name](); warmOf(m, 0.35);
  const f = FRAME[name]; const s = viewer(cv, { ...f, spin: 0.14, yaw0: -0.62 + Math.random() * 0.5 }); s.show(m);
});
const hero = buildVilla(); warmOf(hero, 0.55);
const sh = viewer(document.getElementById('cv-hero'), { radius: 8.0, target: [0.5, 2.6, 0], height: 0.32, spin: 0.06, fov: 20 }); sh.show(hero);
