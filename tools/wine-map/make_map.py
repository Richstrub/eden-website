#!/usr/bin/env python3
"""Eden: draws an old-world engraved-style map for a wine's "About this wine" window.

Out: <out>.jpg  the terrain, painted like an antique hand-coloured map (parchment, hill shading, contour lines,
                coastline with engraved water lines, rivers)
     <out>.svg  the lettering, frame, compass rose and scale bar, drawn over the picture. The website loads this file
                into the page so the lettering uses Eden's own typeface and stays sharp at any size.

Data (fetch once, outside this script; the workspace that built the first map could not reach these sites directly):
  tiles/   AWS Terrain Tiles, Terrarium PNGs at zoom 12, named 12_<x>_<y>.png
           https://s3.amazonaws.com/elevation-tiles-prod/terrarium/12/<x>/<y>.png
  osm.json OpenStreetMap rivers from the Overpass API: way["waterway"="river"](bbox); out geom;
Map data © OpenStreetMap contributors; elevation: Mapzen / AWS Terrain Tiles.

Usage: python3 tools/wine-map/make_map.py <data folder> <out path without extension> [config name]
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

CONFIGS = {
  'raventos-de-nit': {
    'bbox': (1.30, 41.17, 2.30, 41.67),          # west, south, east, north
    'size': (2400, 1600),                         # drawing size (the SVG's viewBox); the JPG is saved at 3/4 of this
    'img_href': 'assets/images/wines/raventos-map.jpg',
    'winery': {'name': 'Raventós i Blanc', 'sub': 'Sant Sadurní d’Anoia', 'lat': 41.433574, 'lng': 1.795787},
    'cartouche': ['Conca del', 'Riu Anoia', 'Penedès · Catalunya'],
    # name, lat, lng, anchor, dx em, dy em, tier (1 always shown; 2 hidden on phones), style
    'places': [
      ('Barcelona', 41.3826, 2.1771, 'middle', 0, -0.75, 1, 'city'),
      ('Igualada', 41.5790, 1.6173, 'start', 0.55, 0.35, 2, 'town'),
      ('Vilafranca del Penedès', 41.3464, 1.6995, 'end', -0.55, 0.35, 1, 'town'),
      ('Martorell', 41.4744, 1.9307, 'start', 0.55, 0.35, 2, 'town'),
      ('Terrassa', 41.5630, 2.0100, 'end', -0.55, 0.35, 2, 'town'),
      ('Sabadell', 41.5461, 2.1083, 'start', 0.55, 0.35, 2, 'town'),
      ('Sitges', 41.2354, 1.8114, 'middle', 0, -0.7, 1, 'town'),
      ('Vilanova i la Geltrú', 41.2242, 1.7256, 'middle', 0, 1.25, 2, 'town'),
      ('el Vendrell', 41.2200, 1.5349, 'middle', 0, -0.7, 2, 'town'),
      ('Castelldefels', 41.2861, 1.9824, 'start', 0.55, 0.35, 2, 'town'),
      ('Esparreguera', 41.5389, 1.8706, 'start', 0.55, 0.35, 2, 'town'),
    ],
    'peaks': [('Montserrat', 41.6054, 1.8115, 1)],
    'regions': [('Penedès', 41.395, 1.555, 1, 0), ('Garraf', 41.300, 1.860, 2, -8), ('Vallès', 41.585, 2.000, 2, 0), ('Anoia', 41.625, 1.470, 2, 0)],
    'sea': ('Mar Mediterrani', 41.2106, 1.9167, -16),
    # river label: OSM names to match, lat to sit near, tier
    'river_labels': [(('Riu Anoia', "l'Anoia"), 41.505, 'Riu Anoia', 2), (('Riu Llobregat', 'el Llobregat'), 41.40, 'Llobregat', 2), (('Riu Foix', 'Riu de Foix', 'Foix'), 41.33, 'Foix', 2)],
    'main_rivers': ('Riu Anoia', "l'Anoia", 'Riu Llobregat', 'el Llobregat', 'Riu Foix', 'Riu de Foix', 'Foix', 'Riu de Bitlles'),
    'compass': (2185, 1245, 115),
    'scale_bar': (1690, 1528),
  }
}

PAPER = np.array([238, 226, 198], float)
INK = '#4a3424'
SEPIA = (0.43, 0.31, 0.18)
WATER_INK = (0.27, 0.37, 0.40)


def lonlat_to_tile(lng, lat, z=12):
  n = 2 ** z
  x = (lng + 180) / 360 * n
  r = np.radians(lat)
  y = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / math.pi) / 2 * n
  return x, y


def load_dem(tiles, cfg):
  W, S, E, N = cfg['bbox']; w, h = cfg['size']
  files = [f for f in os.listdir(tiles) if f.endswith('.png')]
  xs = sorted({int(f.split('_')[1]) for f in files}); ys = sorted({int(f.split('_')[2][:-4]) for f in files})
  mos = np.zeros(((ys[-1] - ys[0] + 1) * 256, (xs[-1] - xs[0] + 1) * 256), np.float32)
  for f in files:
    _, x, y = f[:-4].split('_'); x, y = int(x), int(y)
    a = np.asarray(Image.open(os.path.join(tiles, f)).convert('RGB'), np.float32)
    mos[(y - ys[0]) * 256:(y - ys[0] + 1) * 256, (x - xs[0]) * 256:(x - xs[0] + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
  lng = W + (np.arange(w) + 0.5) / w * (E - W)
  lat = N - (np.arange(h) + 0.5) / h * (N - S)
  LNG, LAT = np.meshgrid(lng, lat)
  tx, ty = lonlat_to_tile(LNG, LAT)
  return ndimage.map_coordinates(mos, [(ty - ys[0]) * 256 - 0.5, (tx - xs[0]) * 256 - 0.5], order=1, mode='nearest')


def project(cfg, lat, lng):
  W, S, E, N = cfg['bbox']; w, h = cfg['size']
  return (lng - W) / (E - W) * w, (N - lat) / (N - S) * h


def noise(h, w, seed, scales):
  rng = np.random.default_rng(seed); out = np.zeros((h, w))
  for s, amp in scales:
    n = ndimage.gaussian_filter(rng.standard_normal((h, w)), s); out += n / (n.std() + 1e-9) * amp
  return out


def paint(dem, cfg, rivers, out_jpg):
  h, w = dem.shape
  W, S, E, N = cfg['bbox']
  px_m = (E - W) * 111320 * math.cos(math.radians((S + N) / 2)) / w
  # smooth the coast so harbour walls and breakwaters don't show as jagged spikes
  land = ndimage.gaussian_filter((dem > 0.5).astype(float), 3.5) > 0.5
  land = ndimage.binary_closing(land, iterations=12)          # fills docks and harbour basins
  land = ndimage.binary_opening(land, iterations=4) | (dem > 6)
  land = ndimage.binary_fill_holes(land)
  lab, n = ndimage.label(~land)                 # drop small inland "sea" pockets
  if n > 1:
    sizes = ndimage.sum(np.ones_like(dem), lab, range(1, n + 1)); keep = 1 + int(np.argmax(sizes))
    land = land | ((lab != keep) & (lab > 0))
  # parchment
  img = np.ones((h, w, 3)) * PAPER
  grain = noise(h, w, 1, [(1, 2.0), (6, 3.0), (40, 5.0), (160, 7.0)])
  img += grain[..., None] * np.array([1.0, 0.95, 0.85])
  yy, xx = np.mgrid[0:h, 0:w]
  d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
  img *= (1 - 0.30 * np.clip(d - 0.45, 0, 1) ** 1.4)[..., None] * np.array([1.0, 0.97, 0.92])
  stains = np.clip(noise(h, w, 7, [(90, 1.0)]) - 1.2, 0, None)
  img -= (stains * 22)[..., None] * np.array([0.6, 0.8, 1.2])
  # sea: pale hand-coloured wash, stronger along the coast
  dist = ndimage.distance_transform_edt(~land)
  wash = np.where(land, 0, 0.45 + 0.55 * np.exp(-dist / 60))
  sea_col = np.array([150, 180, 172], float)
  img = img * (1 - 0.55 * wash[..., None]) + sea_col * (0.55 * wash[..., None])
  # land: hill shading in sepia ink, slightly warmer lowlands, browner heights
  z = ndimage.gaussian_filter(dem.astype(float), 1.2)
  gy, gx = np.gradient(z, px_m)
  slope = np.arctan(1.6 * np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
  az, alt = math.radians(315), math.radians(42)
  shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
  shade = np.clip(shade, 0, 1)
  dark = np.clip((np.sin(alt) - shade) / np.sin(alt), 0, 1) ** 0.9
  hl = np.clip((shade - np.sin(alt)) / (1 - np.sin(alt)), 0, 1)
  lm = land[..., None]
  sep = np.array([0.42, 0.52, 0.66])
  img = np.where(lm, img * (1 - 0.62 * dark[..., None] * sep), img)
  img = np.where(lm, img + 10 * hl[..., None], img)
  hyps = np.clip(dem / 1200, 0, 1)
  tint = np.array([-4, -10, -22]) * hyps[..., None] + np.array([2, 4, -6]) * (1 - hyps[..., None])
  img = np.where(lm, img + tint, img)
  img = np.clip(img, 0, 255)

  fig = plt.figure(figsize=(w / 100, h / 100), dpi=100)
  ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, w); ax.set_ylim(h, 0); ax.axis('off')
  ax.imshow(img.astype(np.uint8), extent=(0, w, h, 0), interpolation='bilinear')
  zc = np.where(land, z, -1)
  ax.contour(zc, levels=np.arange(100, 1300, 100), colors=[SEPIA], linewidths=0.7, alpha=0.5)
  ax.contour(zc, levels=np.arange(500, 1300, 500), colors=[SEPIA], linewidths=1.25, alpha=0.7)
  # engraved water lines parallel to the coast
  sd = ndimage.gaussian_filter(dist, 2)
  for i, dd in enumerate([6, 12, 19, 27, 36, 46, 58, 72, 90, 112, 140]):
    ax.contour(sd, levels=[dd], colors=[WATER_INK], linewidths=max(0.45, 1.25 - i * 0.08), alpha=max(0.22, 0.8 - i * 0.055))
  lf = ndimage.gaussian_filter(land.astype(float), 1.5)
  ax.contour(lf, levels=[0.5], colors=['#3a2a1c'], linewidths=2.6, alpha=0.92)
  for name, pts in rivers:
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    main = name in cfg['main_rivers']
    ax.plot(xs, ys, color=WATER_INK, linewidth=1.9 if main else 0.8, alpha=0.85 if main else 0.6, solid_capstyle='round', solid_joinstyle='round')
  fig.savefig(out_jpg + '.png', dpi=100)
  plt.close(fig)
  im = Image.open(out_jpg + '.png').convert('RGB')
  im = im.resize((w * 3 // 4, h * 3 // 4), Image.LANCZOS)
  im.save(out_jpg, quality=80, optimize=True, progressive=True)
  os.remove(out_jpg + '.png')


def river_paths(osm, cfg):
  out = []
  for e in osm['elements']:
    if e['type'] != 'way' or 'geometry' not in e: continue
    pts = [project(cfg, g['lat'], g['lon']) for g in e['geometry']]
    out.append((e['tags'].get('name', ''), pts))
  return out


def esc(s):
  return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def river_label(rivers, names, lat_target, cfg):
  best = None
  ty = project(cfg, lat_target, 0)[1]
  for name, pts in rivers:
    if name not in names: continue
    for i in range(1, len(pts) - 1):
      d = abs(pts[i][1] - ty)
      if best is None or d < best[0]: best = (d, pts, i)
  if not best: return None
  _, pts, i = best
  a, b = pts[max(0, i - 6)], pts[min(len(pts) - 1, i + 6)]
  ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
  if ang > 90: ang -= 180
  if ang < -90: ang += 180
  return pts[i][0], pts[i][1], ang


def svg(cfg, rivers):
  w, h = cfg['size']; W, S, E, N = cfg['bbox']
  o = []
  o.append(f'<svg class="wm" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of {esc(cfg["winery"]["name"])}, {esc(cfg["winery"]["sub"])}">')
  o.append(f'<image href="{cfg["img_href"]}" x="0" y="0" width="{w}" height="{h}" preserveAspectRatio="none"/>')
  # regions, sea, rivers (behind the towns)
  for name, lat, lng, tier, rot in cfg['regions']:
    x, y = project(cfg, lat, lng)
    o.append(f'<text class="wm-region t{tier}" x="{x:.0f}" y="{y:.0f}" text-anchor="middle" transform="rotate({rot} {x:.0f} {y:.0f})">{esc(name)}</text>')
  name, lat, lng, rot = cfg['sea']; x, y = project(cfg, lat, lng)
  o.append(f'<text class="wm-sea t1" x="{x:.0f}" y="{y:.0f}" text-anchor="middle" transform="rotate({rot} {x:.0f} {y:.0f})">{esc(name)}</text>')
  for names, lat, label, tier in cfg['river_labels']:
    r = river_label(rivers, names, lat, cfg)
    if not r: continue
    x, y, ang = r
    o.append(f'<text class="wm-river t{tier}" x="{x:.0f}" y="{y:.0f}" dy="-0.45em" text-anchor="middle" transform="rotate({ang:.1f} {x:.0f} {y:.0f})">{esc(label)}</text>')
  for name, lat, lng, tier in cfg['peaks']:
    x, y = project(cfg, lat, lng)
    o.append(f'<g class="t{tier}"><path class="wm-peak" d="M{x-14:.0f} {y+10:.0f} L{x:.0f} {y-14:.0f} L{x+14:.0f} {y+10:.0f} Z"/>'
             f'<text class="wm-mount" x="{x:.0f}" y="{y:.0f}" dy="-0.7em" text-anchor="middle">{esc(name)}</text></g>')
  for name, lat, lng, anchor, dx, dy, tier, style in cfg['places']:
    x, y = project(cfg, lat, lng)
    r = 9 if style == 'city' else 6.5
    o.append(f'<g class="t{tier}"><circle class="wm-dot" cx="{x:.0f}" cy="{y:.0f}" r="{r}"/>'
             f'<text class="wm-{style}" x="{x:.0f}" y="{y:.0f}" dx="{dx}em" dy="{dy}em" text-anchor="{anchor}">{esc(name)}</text></g>')
  # the winery
  wi = cfg['winery']; x, y = project(cfg, wi['lat'], wi['lng'])
  o.append(f'<g class="wm-winery"><circle cx="{x:.0f}" cy="{y:.0f}" r="22" class="wm-w-ring"/><circle cx="{x:.0f}" cy="{y:.0f}" r="8" class="wm-w-dot"/>'
           f'<text class="wm-w-name" x="{x:.0f}" y="{y:.0f}" dx="0.75em" dy="-0.15em">{esc(wi["name"])}</text>'
           f'<text class="wm-w-sub" x="{x:.0f}" y="{y:.0f}" dx="1.2em" dy="1.25em">{esc(wi["sub"])}</text></g>')
  # compass rose
  cx, cy, R = cfg['compass']
  pts = []
  for k in range(8):
    a = math.radians(k * 45 - 90); L = R if k % 2 == 0 else R * 0.55; s = R * 0.13
    tip = (cx + L * math.cos(a), cy + L * math.sin(a))
    l = (cx + s * math.cos(a - math.pi / 2), cy + s * math.sin(a - math.pi / 2))
    rr = (cx + s * math.cos(a + math.pi / 2), cy + s * math.sin(a + math.pi / 2))
    pts.append(f'<path class="wm-rose-d" d="M{cx} {cy} L{tip[0]:.1f} {tip[1]:.1f} L{l[0]:.1f} {l[1]:.1f} Z"/><path class="wm-rose-l" d="M{cx} {cy} L{tip[0]:.1f} {tip[1]:.1f} L{rr[0]:.1f} {rr[1]:.1f} Z"/>')
  o.append(f'<g class="wm-rose t2"><circle cx="{cx}" cy="{cy}" r="{R*0.78:.0f}" class="wm-rose-c"/><circle cx="{cx}" cy="{cy}" r="{R*0.7:.0f}" class="wm-rose-c thin"/>' + ''.join(pts) +
           f'<text class="wm-rose-n" x="{cx}" y="{cy - R - 16}" text-anchor="middle">N</text></g>')
  # scale bar: 0 - 5 - 10 - 20 km
  sx, sy = cfg['scale_bar']
  km = w / ((E - W) * 111.32 * math.cos(math.radians((S + N) / 2)))
  segs = [(0, 5), (5, 10), (10, 15), (15, 20)]
  bar = ''.join(f'<rect x="{sx + a * km:.1f}" y="{sy}" width="{(b - a) * km:.1f}" height="12" class="{"wm-sb-d" if i % 2 == 0 else "wm-sb-l"}"/>' for i, (a, b) in enumerate(segs))
  ticks = ''.join(f'<text class="wm-sb-t" x="{sx + k * km:.1f}" y="{sy - 14}" text-anchor="middle">{k}</text>' for k in (0, 5, 10, 20))
  o.append(f'<g class="wm-scale t2">{bar}{ticks}<text class="wm-sb-u" x="{sx + 10 * km:.1f}" y="{sy + 48}" text-anchor="middle">Kilòmetres</text></g>')
  # cartouche
  c = cfg['cartouche']
  o.append('<g class="wm-cart t2"><rect x="70" y="70" width="470" height="200" class="wm-cart-b"/><rect x="82" y="82" width="446" height="176" class="wm-cart-i"/>'
           f'<text class="wm-cart-s" x="305" y="132" text-anchor="middle">{esc(c[0])}</text>'
           f'<text class="wm-cart-t" x="305" y="196" text-anchor="middle">{esc(c[1])}</text>'
           f'<text class="wm-cart-s2" x="305" y="236" text-anchor="middle">{esc(c[2])}</text></g>')
  # frame: outer rule, checkered degree band (every 5 minutes), inner rule
  b0, b1 = 12, 32
  band = []
  def segs_along(v0, v1, step):
    a = math.floor(v0 / step) * step; out = []
    while a < v1:
      out.append((max(a, v0), min(a + step, v1), int(round(a / step)) % 2)); a += step
    return out
  for a, b_, k in segs_along(W, E, 5 / 60):
    if not k: continue
    x0 = b1 + (a - W) / (E - W) * (w - 2 * b1); x1 = b1 + (b_ - W) / (E - W) * (w - 2 * b1)
    band.append(f'<rect x="{x0:.1f}" y="{b0}" width="{x1-x0:.1f}" height="{b1-b0}"/><rect x="{x0:.1f}" y="{h-b1}" width="{x1-x0:.1f}" height="{b1-b0}"/>')
  for a, b_, k in segs_along(S, N, 5 / 60):
    if not k: continue
    y1 = b1 + (N - a) / (N - S) * (h - 2 * b1); y0 = b1 + (N - b_) / (N - S) * (h - 2 * b1)
    band.append(f'<rect x="{b0}" y="{y0:.1f}" width="{b1-b0}" height="{y1-y0:.1f}"/><rect x="{w-b1}" y="{y0:.1f}" width="{b1-b0}" height="{y1-y0:.1f}"/>')
  o.append(f'<path class="wm-band-bg" fill-rule="evenodd" d="M{b0} {b0}H{w-b0}V{h-b0}H{b0}Z M{b1} {b1}V{h-b1}H{w-b1}V{b1}Z"/>')
  o.append(f'<g class="wm-band">{"".join(band)}</g>')
  o.append(f'<rect x="{b0}" y="{b0}" width="{w-2*b0}" height="{h-2*b0}" class="wm-frame"/><rect x="{b1}" y="{b1}" width="{w-2*b1}" height="{h-2*b1}" class="wm-frame thin"/>'
           f'<rect x="3" y="3" width="{w-6}" height="{h-6}" class="wm-frame outer"/>')
  # degree labels every 10 minutes, just inside the frame
  def dm(v, pos, neg):
    d = int(abs(v)); m = int(round((abs(v) - d) * 60))
    if m == 60: d += 1; m = 0
    return f'{d}°{m:02d}′ {pos if v >= 0 else neg}'
  k = math.ceil(W * 6) / 6
  while k < E - 0.02:
    x = b1 + (k - W) / (E - W) * (w - 2 * b1)
    if x > 140 and x < w - 140: o.append(f'<text class="wm-deg t2" x="{x:.0f}" y="{b1 + 34}" text-anchor="middle">{dm(k, "E", "W")}</text>')
    k += 1 / 6
  k = math.ceil(S * 6) / 6
  while k < N - 0.02:
    y = b1 + (N - k) / (N - S) * (h - 2 * b1)
    if y > 300 and y < h - 120: o.append(f'<text class="wm-deg t2" x="{b1 + 14}" y="{y:.0f}" dy="0.35em">{dm(k, "N", "S")}</text>')
    k += 1 / 6
  o.append('</svg>')
  return '\n'.join(o)


def main():
  data, out = sys.argv[1], sys.argv[2]
  cfg = CONFIGS[sys.argv[3] if len(sys.argv) > 3 else 'raventos-de-nit']
  dem = load_dem(os.path.join(data, 'tiles'), cfg)
  osm = json.load(open(os.path.join(data, 'osm.json')))
  rivers = river_paths(osm, cfg)
  paint(dem, cfg, rivers, out + '.jpg')
  open(out + '.svg', 'w').write(svg(cfg, rivers))
  print('wrote', out + '.jpg', out + '.svg', 'elevation', float(dem.min()), float(dem.max()))


if __name__ == '__main__':
  main()
