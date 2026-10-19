#!/usr/bin/env python3
"""Eden wine maps: one engraved, old-world style map per wine or spirits region, in the website's charcoal, ivory and ember.

For each region in regions.json it writes <out>/<id>.jpg (terrain: hill shading, contour lines, coast and lake shores
with engraved water lines, rivers) and <out>/<id>.svg (towns, lakes, sea and region names, title box, compass rose and
scale bar, set in the website's own typefaces). The website loads the SVG into the page and adds the producer's marker
itself from the bottle's coordinates (the SVG's data-bbox gives the area), so one map serves every bottle from that region.

Region fields: id, title, sub (line under the title), bbox [west, south, east, north] in a 3:2 shape (see clusters.py),
optional: sea (name for open water), sea_level (metres; land below it counts as sea, default 0.5), regions
[[name, lat, lng]], skip [town names to leave off], add [[name, lat, lng, "town"]].

Usage: python3 tools/wine-map/region_maps.py regions.json <data folder from fetch_data.py> <out folder> [ids…]
Needs numpy, scipy, matplotlib and Pillow.
"""
import json, os, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

W_PX, H_PX = 2400, 1600
IV = (243 / 255, 238 / 255, 229 / 255)
IMG_HREF = 'assets/images/wines/maps/'


def tile_xy(lng, lat, z):
  n = 2 ** z
  return (lng + 180) / 360 * n, (1 - np.log(np.tan(np.radians(lat)) + 1 / np.cos(np.radians(lat))) / math.pi) / 2 * n


def load_dem(d, r):
  W, S, E, N = r['bbox']; z = r['z']
  files = [f for f in os.listdir(os.path.join(d, 'tiles')) if f.startswith(f'{z}_')]
  xs = sorted({int(f.split('_')[1]) for f in files}); ys = sorted({int(f.split('_')[2][:-4]) for f in files})
  mos = np.zeros(((ys[-1] - ys[0] + 1) * 256, (xs[-1] - xs[0] + 1) * 256), np.float32)
  for f in files:
    _, x, y = f[:-4].split('_'); x, y = int(x), int(y)
    try: a = np.asarray(Image.open(os.path.join(d, 'tiles', f)).convert('RGB'), np.float32)
    except Exception: continue
    mos[(y - ys[0]) * 256:(y - ys[0] + 1) * 256, (x - xs[0]) * 256:(x - xs[0] + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
  LNG, LAT = np.meshgrid(W + (np.arange(W_PX) + 0.5) / W_PX * (E - W), N - (np.arange(H_PX) + 0.5) / H_PX * (N - S))
  tx, ty = tile_xy(LNG, LAT, z)
  return ndimage.map_coordinates(mos, [(ty - ys[0]) * 256 - 0.5, (tx - xs[0]) * 256 - 0.5], order=1, mode='nearest')


def proj(r, lat, lng):
  W, S, E, N = r['bbox']
  return (lng - W) / (E - W) * W_PX, (N - lat) / (N - S) * H_PX


def noise(seed, scales):
  rng = np.random.default_rng(seed); out = np.zeros((H_PX, W_PX))
  for s, amp in scales:
    n = ndimage.gaussian_filter(rng.standard_normal((H_PX, W_PX)), s); out += n / (n.std() + 1e-9) * amp
  return out


def rings(ways):
  """Stitch OSM way segments into closed rings."""
  segs = [list(w) for w in ways if len(w) > 1]; out = []
  while segs:
    ring = segs.pop(0)
    changed = True
    while ring[0] != ring[-1] and changed:
      changed = False
      for i, s in enumerate(segs):
        if s[0] == ring[-1]: ring += s[1:]
        elif s[-1] == ring[-1]: ring += s[::-1][1:]
        elif s[-1] == ring[0]: ring = s + ring[1:]
        elif s[0] == ring[0]: ring = s[::-1] + ring[1:]
        else: continue
        segs.pop(i); changed = True; break
    if len(ring) > 3: out.append(ring)
  return out


def read_osm(d, r):
  try: osm = json.load(open(os.path.join(d, 'osm.json')))
  except Exception: osm = {'elements': []}
  rivers, places, lakes = [], [], []
  for e in osm['elements']:
    t = e.get('tags', {})
    if e['type'] == 'node':
      if t.get('place') in ('city', 'town', 'village'):
        try: pop = int(str(t.get('population', '0')).replace(',', '').split(';')[0].split('.')[0] or 0)
        except ValueError: pop = 0
        places.append({'name': t.get('name:en') if t.get('name:en') and r.get('english') else t['name'], 'place': t['place'], 'pop': pop, 'lat': e['lat'], 'lng': e['lon']})
    elif e['type'] == 'way' and t.get('waterway') == 'river' and 'geometry' in e:
      rivers.append((t.get('name', ''), [proj(r, g['lat'], g['lon']) for g in e['geometry']]))
    elif t.get('natural') == 'water':
      if e['type'] == 'way' and 'geometry' in e:
        pts = [(g['lat'], g['lon']) for g in e['geometry']]
        if pts[0] == pts[-1]: lakes.append((t.get('name', ''), [pts]))
      elif e['type'] == 'relation':
        outer = [[(g['lat'], g['lon']) for g in m['geometry']] for m in e.get('members', []) if m.get('role') == 'outer' and m.get('geometry')]
        rs = rings(outer)
        if rs: lakes.append((t.get('name', ''), rs))
  return rivers, places, lakes


def paint(r, dem, rivers, lakes_raw, out_jpg):
  W, S, E, N = r['bbox']
  px_m = (E - W) * 111320 * math.cos(math.radians((S + N) / 2)) / W_PX
  sl = r.get('sea_level', 0.5)
  P = 40   # work on an edge-padded copy so the map's border doesn't read as a coastline
  dp = np.pad(dem, P, mode='edge')
  land = ndimage.gaussian_filter((dp > sl).astype(float), 3.5) > 0.5
  ci, oi = r.get('close', 10), r.get('open', 4)   # smaller numbers keep narrow sea lochs and fjords open
  land = ndimage.binary_closing(land, iterations=ci) if ci else land
  land = (ndimage.binary_opening(land, iterations=oi) if oi else land) | (dp > sl + 6)
  land = ndimage.binary_fill_holes(land)[P:-P, P:-P]
  lab, n = ndimage.label(~land)
  if n > 1:   # keep only open water that is big or touches the edge; the rest is land below sea level
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    sizes = ndimage.sum(np.ones_like(dem), lab, range(1, n + 1))
    for k in range(1, n + 1):
      if k not in edge and sizes[k - 1] < 0.01 * W_PX * H_PX: land[lab == k] = True
  sea = ~land
  if r.get('sea_mask') and os.path.exists(r['sea_mask']):   # coastline from OpenStreetMap (tmp/coast.py)
    sea = np.load(r['sea_mask']); land = ~sea
  # lakes (named OSM water bigger than a speck at this scale)
  lake_mask = Image.new('L', (W_PX, H_PX), 0); dr = ImageDraw.Draw(lake_mask); lakes = []
  for name, rs in lakes_raw:
    polys = [[proj(r, la, ln) for la, ln in ring] for ring in rs]
    area = sum(abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2 for p in polys)
    if area < 0.0012 * W_PX * H_PX: continue
    one = Image.new('L', (W_PX, H_PX), 0); d1 = ImageDraw.Draw(one)
    for p in polys:
      if len(p) > 2: dr.polygon(p, fill=255); d1.polygon(p, fill=255)
    lakes.append({'name': name, 'area': area, 'mask': np.asarray(one) > 0})
  lake = np.asarray(lake_mask) > 0
  water = sea | lake
  land = ~water
  yy, xx = np.mgrid[0:H_PX, 0:W_PX]
  dist = ndimage.distance_transform_edt(~land)
  img = np.where(land[..., None], np.array([35, 38, 41], float), np.array([15, 18, 21], float))
  img = img + (np.where(land, 0, np.exp(-dist / 90))[..., None] * np.array([7, 8, 9]))
  img += noise(1, [(1, 1.6), (5, 1.2), (60, 2.2), (220, 3.0)])[..., None] * np.array([1.0, 0.98, 0.94])
  d = np.sqrt(((xx - W_PX / 2) / (W_PX / 2)) ** 2 + ((yy - H_PX / 2) / (H_PX / 2)) ** 2)
  img *= (1 - 0.35 * np.clip(d - 0.5, 0, 1) ** 1.3)[..., None]
  z = ndimage.gaussian_filter(dem.astype(float), 1.2)
  relief = max(150.0, float(np.percentile(z[land], 99.5)) if land.any() else 150.0)
  gy, gx = np.gradient(z, px_m)
  ex = 1.6 * (1 + 1.4 * max(0, 1 - relief / 800))           # gentle country gets more exaggeration so it still reads
  slope = np.arctan(ex * np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
  az, alt = math.radians(315), math.radians(42)
  shade = np.clip(np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)
  dark = np.clip((np.sin(alt) - shade) / np.sin(alt), 0, 1) ** 0.9
  hl = np.clip((shade - np.sin(alt)) / (1 - np.sin(alt)), 0, 1) ** 0.8
  lm = land[..., None]; hyps = np.clip((dem - max(0, sl)) / max(relief, 1), 0, 1)[..., None]
  light = np.array([243, 238, 229]) * (1 - hyps * 0.35) + np.array([224, 168, 118]) * (hyps * 0.35)
  img = np.where(lm, img * (1 - 0.55 * dark[..., None]) + light * (0.16 * hl[..., None]), img)
  img = np.clip(np.where(lm, img + hyps * np.array([10, 7, 3]), img), 0, 255)

  fig = plt.figure(figsize=(W_PX / 100, H_PX / 100), dpi=100)
  ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, W_PX); ax.set_ylim(H_PX, 0); ax.axis('off')
  ax.imshow(img.astype(np.uint8), extent=(0, W_PX, H_PX, 0), interpolation='bilinear')
  step = [s for s in (20, 50, 100, 200, 250, 500) if relief / s <= 16][0]
  zc = np.where(land, z, -9999)
  ax.contour(zc, levels=np.arange(step, relief * 1.2 + step, step), colors=[IV], linewidths=0.6, alpha=0.13)
  ax.contour(zc, levels=np.arange(step * 5, relief * 1.2 + step, step * 5), colors=[IV], linewidths=1.0, alpha=0.26)
  sd = ndimage.gaussian_filter(dist, 2)
  if sea.any():
    sea_d = np.where(sea, sd, 0)
    for i, dd in enumerate([6, 12, 19, 27, 36, 46, 58, 72, 90, 112, 140]):
      ax.contour(sea_d, levels=[dd], colors=[IV], linewidths=max(0.45, 1.0 - i * 0.05), alpha=max(0.05, 0.3 - i * 0.025))
  if lake.any():
    lake_d = np.where(lake, sd, 0)
    for i, dd in enumerate([5, 10, 16, 23]):
      ax.contour(lake_d, levels=[dd], colors=[IV], linewidths=0.7, alpha=0.24 - i * 0.045)
  for name, pts in rivers:
    ax.plot([p[0] for p in pts], [p[1] for p in pts], color=IV, linewidth=0.75, alpha=0.24, solid_capstyle='round', solid_joinstyle='round')
  for nm in main_rivers(rivers):
    for name, pts in rivers:
      if name == nm: ax.plot([p[0] for p in pts], [p[1] for p in pts], color=IV, linewidth=1.7, alpha=0.5, solid_capstyle='round', solid_joinstyle='round')
  lf = ndimage.gaussian_filter(land.astype(float), 1.5)
  ax.contour(lf, levels=[0.5], colors=[IV], linewidths=2.0, alpha=0.72)
  fig.savefig(out_jpg + '.png', dpi=100); plt.close(fig)
  im = Image.open(out_jpg + '.png').convert('RGB').resize((W_PX * 3 // 4, H_PX * 3 // 4), Image.LANCZOS)
  im.save(out_jpg, quality=80, optimize=True, progressive=True); os.remove(out_jpg + '.png')
  return land, sea, lakes


def river_len(pts):
  return sum(math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) for i in range(1, len(pts)))


def main_rivers(rivers, n=4):
  tot = {}
  for name, pts in rivers:
    if name: tot[name] = tot.get(name, 0) + river_len([p for p in pts if 0 <= p[0] <= W_PX and 0 <= p[1] <= H_PX] or [(0, 0)])
  return [k for k, v in sorted(tot.items(), key=lambda kv: -kv[1])[:n] if v > W_PX * 0.25]


def esc(s):
  return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


class Boxes:
  def __init__(self): self.b = []
  def hit(self, q, pad=10):
    return any(q[0] - pad < b[2] and q[2] + pad > b[0] and q[1] - pad < b[3] and q[3] + pad > b[1] for b in self.b)
  def add(self, q): self.b.append(q)


def text_box(x, y, txt, fs, anchor, dx, dy, k=0.5, spacing=0.0):
  w = len(txt) * fs * (k + spacing); x0 = x + dx * fs
  if anchor == 'end': x0 -= w
  elif anchor == 'middle': x0 -= w / 2
  yb = y + dy * fs
  return (x0, yb - fs * 0.78, x0 + w, yb + fs * 0.22)


def svg(r, land, sea, lakes, rivers, places):
  W, S, E, N = r['bbox']
  km_px = W_PX / ((E - W) * 111.32 * math.cos(math.radians((S + N) / 2)))
  boxes = Boxes(); o = []; labels = []
  inside = lambda q: q[0] > 50 and q[2] < W_PX - 50 and q[1] > 50 and q[3] < H_PX - 50
  # reserved: title box (top left), compass and scale bar (bottom right)
  title = r['title']; tw = max(470, len(title) * 66 * 0.42 + 90, len(r.get('sub', '')) * 20.5 + 90)
  cart = (70, 70, 70 + tw, 270); boxes.add(cart)
  bar_km = [k for k in (1, 2, 4, 10, 20, 40, 50, 100, 200) if k * km_px >= W_PX * 0.16][0]
  bar_w = bar_km * km_px; sx, sy = W_PX - 95 - bar_w, H_PX - 78
  boxes.add((sx - 30, sy - 50, W_PX - 60, H_PX - 20))
  cx, cy, R = W_PX - 95 - bar_w / 2, sy - 230, 105
  boxes.add((cx - R - 30, cy - R - 60, cx + R + 30, cy + R + 30))
  # sea name in the most open water, wherever it fits whole
  if r.get('sea') and sea.sum() > 0.04 * W_PX * H_PX:
    dt = ndimage.distance_transform_edt(np.pad(sea, 1, constant_values=False))[1:-1, 1:-1]
    mx = ndimage.maximum_filter(dt, size=41)
    ys_, xs_ = np.nonzero((dt == mx) & (dt > 36))
    order = np.argsort(-dt[ys_, xs_])
    for fs in (54, 44, 36):
      done = False
      for k in order[:400]:
        y, x = int(ys_[k]), int(xs_[k])
        q = text_box(x, y, r['sea'], fs, 'middle', 0, 0.3, 0.46, 0.3)
        if not inside(q) or boxes.hit(q, 16): continue
        corners = [(q[0], q[1]), (q[2], q[1]), (q[0], q[3]), (q[2], q[3]), ((q[0] + q[2]) / 2, q[1])]
        if not all(sea[int(min(H_PX - 1, max(0, cy_))), int(min(W_PX - 1, max(0, cx_)))] for cx_, cy_ in corners): continue
        labels.append(f'<text class="wmap-sea t1" x="{x}" y="{y}" dy="0.3em" text-anchor="middle" style="font-size:{fs}px">{esc(r["sea"])}</text>'); boxes.add(q); done = True; break
      if done: break
  # lake names along each lake's length
  for lk in sorted(lakes, key=lambda l: -l['area']):
    if not lk['name']: continue
    ys, xs = np.nonzero(lk['mask'])
    if len(xs) < 50: continue
    cxl, cyl = xs.mean(), ys.mean()
    cov = np.cov(np.vstack([xs - cxl, ys - cyl])); ev, evec = np.linalg.eigh(cov)
    major = evec[:, 1]; ang = math.degrees(math.atan2(major[1], major[0]))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    length = 4 * math.sqrt(ev[1]); width = 4 * math.sqrt(max(ev[0], 1))
    name = lk['name']; fs = 40
    if len(name) * fs * 0.48 > length * 0.85:
      name = name.replace(' Lake', '').replace('Lake ', '').replace('Lago di ', '').replace('Lac ', '')
      if len(name) * fs * 0.48 > length * 0.85: continue
    tier = 1 if lk['area'] > 0.01 * W_PX * H_PX else 2
    if width < 26 or abs(ang) > 60:   # a long thin lake: write it beside the water, upright along its length
      off = width / 2 + 26
      nx, ny = -major[1], major[0]
      lx, ly = cxl + nx * off, cyl + ny * off
    else:
      lx, ly = cxl, cyl
    labels.append(f'<text class="wmap-lake t{tier}" x="{lx:.0f}" y="{ly:.0f}" dy="0.35em" text-anchor="middle" transform="rotate({ang:.1f} {lx:.0f} {ly:.0f})">{esc(name)}</text>')
    hw = len(name) * fs * 0.25; boxes.add((lx - hw * abs(math.cos(math.radians(ang))) - 20, ly - hw * abs(math.sin(math.radians(ang))) - 24, lx + hw * abs(math.cos(math.radians(ang))) + 20, ly + hw * abs(math.sin(math.radians(ang))) + 24))
  # region names
  for nm, la, ln in r.get('regions', []):
    x, y = proj(r, la, ln)
    labels.append(f'<text class="wmap-region t2" x="{x:.0f}" y="{y:.0f}" text-anchor="middle">{esc(nm)}</text>')
  # towns: biggest first, spaced out, each label where it fits
  skip = set(r.get('skip', []))
  cand = [p for p in places if p['name'] not in skip]
  for a in r.get('add', []): cand.append({'name': a[0], 'lat': a[1], 'lng': a[2], 'place': a[3] if len(a) > 3 else 'town', 'pop': 10 ** 6})
  rank = {'city': 3, 'town': 2, 'village': 1}
  cand.sort(key=lambda p: -(rank[p['place']] * 2 + math.log10(p['pop'] + 10)))
  dots = []; placed = 0; max_n = r.get('towns', 13)
  pops = sorted([p['pop'] for p in cand if 90 < proj(r, p['lat'], p['lng'])[0] < W_PX - 90 and 90 < proj(r, p['lat'], p['lng'])[1] < H_PX - 90], reverse=True)
  top_pop = pops[0] if pops else 0
  for p in cand:
    if placed >= max_n: break
    x, y = proj(r, p['lat'], p['lng'])
    if not (90 < x < W_PX - 90 and 90 < y < H_PX - 90): continue
    if not land[int(y), int(x)]: continue
    big = p['pop'] >= 600000 or (p['pop'] == top_pop and p['pop'] >= 40000)
    if any(math.hypot(x - a, y - b) < (300 if (big or bg) else 170) for a, b, bg in dots): continue
    style = 'city' if big else ('town' if p['place'] != 'village' or placed < 6 else 'village')
    fs = {'city': 54, 'town': 44, 'village': 36}[style]; k, sp = (0.62, 0.26) if style == 'city' else (0.47, 0)
    for anchor, dx, dy in (('start', 0.55, 0.35), ('end', -0.55, 0.35), ('middle', 0, -0.75), ('middle', 0, 1.3)):
      q = text_box(x, y, p['name'], fs, anchor, dx, dy, k, sp)
      if inside(q) and not boxes.hit(q) and not boxes.hit((x - 12, y - 12, x + 12, y + 12), 0): break
    else: continue
    boxes.add(q); boxes.add((x - 14, y - 14, x + 14, y + 14)); dots.append((x, y, big))
    tier = 1 if placed < 5 else 2; placed += 1
    labels.append(f'<g class="t{tier}"><circle class="wmap-dot" cx="{x:.0f}" cy="{y:.0f}" r="{9 if style == "city" else 6.5}"/>'
                  f'<text class="wmap-{style}" x="{x:.0f}" y="{y:.0f}" dx="{dx}em" dy="{dy}em" text-anchor="{anchor}">{esc(p["name"])}</text></g>')
  # river names (the longest two)
  for nm in main_rivers(rivers, 2):
    best = None
    for name, pts in rivers:
      if name != nm: continue
      for i in range(6, len(pts) - 6):
        x, y = pts[i]
        if not (200 < x < W_PX - 200 and 200 < y < H_PX - 200): continue
        a, b = pts[i - 6], pts[i + 6]; ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        if ang > 90: ang -= 180
        if ang < -90: ang += 180
        q = (x - len(nm) * 10, y - 40, x + len(nm) * 10, y + 10)
        if boxes.hit(q): continue
        score = -abs(ang) - abs(x - W_PX / 2) / 40
        if best is None or score > best[0]: best = (score, x, y, ang, q)
    if best:
      _, x, y, ang, q = best; boxes.add(q)
      labels.append(f'<text class="wmap-river t2" x="{x:.0f}" y="{y:.0f}" dy="-0.45em" text-anchor="middle" transform="rotate({ang:.1f} {x:.0f} {y:.0f})">{esc(nm)}</text>')

  o.append(f'<svg class="wmap" viewBox="0 0 {W_PX} {H_PX}" data-bbox="{W:.5f} {S:.5f} {E:.5f} {N:.5f}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of {esc(title)}">')
  o.append('<defs><radialGradient id="wmap-glow"><stop offset="0" stop-color="#e09a5e" stop-opacity=".34"/><stop offset=".45" stop-color="#b0703f" stop-opacity=".12"/><stop offset="1" stop-color="#b0703f" stop-opacity="0"/></radialGradient></defs>')
  o.append(f'<image href="{IMG_HREF}{r["id"]}.jpg" x="0" y="0" width="{W_PX}" height="{H_PX}" preserveAspectRatio="none"/>')
  o.append('<g class="wmap-labels">' + ''.join(labels) + '</g>')
  # compass rose
  pts = []
  for k in range(8):
    a = math.radians(k * 45 - 90); L = R if k % 2 == 0 else R * 0.55; s_ = R * 0.13
    tip = (cx + L * math.cos(a), cy + L * math.sin(a))
    l = (cx + s_ * math.cos(a - math.pi / 2), cy + s_ * math.sin(a - math.pi / 2)); rr = (cx + s_ * math.cos(a + math.pi / 2), cy + s_ * math.sin(a + math.pi / 2))
    pts.append(f'<path class="wmap-rose-d" d="M{cx:.1f} {cy:.1f} L{tip[0]:.1f} {tip[1]:.1f} L{l[0]:.1f} {l[1]:.1f} Z"/><path class="wmap-rose-l" d="M{cx:.1f} {cy:.1f} L{tip[0]:.1f} {tip[1]:.1f} L{rr[0]:.1f} {rr[1]:.1f} Z"/>')
  o.append(f'<g class="wmap-rose t2"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R*0.78:.0f}" class="wmap-rose-c"/><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R*0.7:.0f}" class="wmap-rose-c thin"/>' + ''.join(pts) +
           f'<text class="wmap-rose-n" x="{cx:.1f}" y="{cy - R - 16:.1f}" text-anchor="middle">N</text></g>')
  # scale bar
  q4 = bar_km / 4
  bar = ''.join(f'<rect x="{sx + i * q4 * km_px:.1f}" y="{sy}" width="{q4 * km_px:.1f}" height="12" class="{"wmap-sb-d" if i % 2 == 0 else "wmap-sb-l"}"/>' for i in range(4))
  fmt = lambda v: ('%g' % v)
  ticks = ''.join(f'<text class="wmap-sb-t" x="{sx + v * km_px:.1f}" y="{sy - 14}" text-anchor="middle">{fmt(v)}</text>' for v in (0, bar_km / 2, bar_km))
  unit = 'Kilometres' if r.get('km_word') is None else r['km_word']
  o.append(f'<g class="wmap-scale t2">{bar}{ticks}<text class="wmap-sb-u" x="{sx + bar_w / 2:.1f}" y="{sy + 48}" text-anchor="middle">{esc(unit)}</text></g>')
  # title box
  mid = 70 + tw / 2
  o.append(f'<g class="wmap-cart t2"><rect x="70" y="70" width="{tw:.0f}" height="200" class="wmap-cart-b"/><rect x="82" y="82" width="{tw-24:.0f}" height="176" class="wmap-cart-i"/>'
           f'<text class="wmap-cart-s" x="{mid:.0f}" y="132" text-anchor="middle">{esc(r.get("eyebrow", "Where it’s made"))}</text>'
           f'<text class="wmap-cart-t" x="{mid:.0f}" y="196" text-anchor="middle">{esc(title)}</text>'
           f'<text class="wmap-cart-s2" x="{mid:.0f}" y="236" text-anchor="middle">{esc(r.get("sub", ""))}</text></g>')
  o.append('</svg>')
  return '\n'.join(o)


def main():
  regions = json.load(open(sys.argv[1])); data, out = sys.argv[2], sys.argv[3]
  only = set(sys.argv[4:]); os.makedirs(out, exist_ok=True)
  for r in regions:
    if only and r['id'] not in only: continue
    d = os.path.join(data, r['id'])
    if not r.get('z'):
      try: r['z'] = {x['id']: x['z'] for x in json.load(open(os.path.join(data, 'regions-z.json')))}[r['id']]
      except Exception: pass
    try:
      dem = load_dem(d, r)
      rivers, places, lakes_raw = read_osm(d, r)
      land, sea, lakes = paint(r, dem, rivers, lakes_raw, os.path.join(out, r['id'] + '.jpg'))
      open(os.path.join(out, r['id'] + '.svg'), 'w').write(svg(r, land, sea, lakes, rivers, places))
      print('ok', r['id'], len(places), 'places', len(lakes), 'lakes', len(rivers), 'rivers')
    except Exception as e:
      import traceback; traceback.print_exc(); print('FAILED', r['id'], e)


if __name__ == '__main__':
  main()
