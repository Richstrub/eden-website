/* G3 continuous corners for browsers that can't draw CSS corner-shape yet (Safari, Firefox).
 * Cards and photos get an exact squircle outline (a superellipse with exponent 4, the same shape Chrome draws
 * from css/styles.css) as a clip-path, redrawn whenever their size changes. Elements with outlines or shadows keep
 * ordinary rounded corners, since a clip-path would cut those off. */
(function () {
  'use strict';
  if (window.CSS && CSS.supports && CSS.supports('corner-shape', 'superellipse(2)')) return;   // drawn natively
  if (!window.ResizeObserver) return;
  var SEL = '.member,.member .portrait,#partners .pw-wall .panel,.visit > div,.cm-wrap';
  var K = 1.32, STEPS = 10;
  function corner(cx, cy, r, a0) {   // points along a quarter superellipse |x|^4 + |y|^4 = r^4, centred on (cx, cy)
    var out = [];
    for (var i = 0; i <= STEPS; i++) {
      var t = a0 + (Math.PI / 2) * (i / STEPS), c = Math.cos(t), s = Math.sin(t);
      out.push((cx + r * Math.sign(c) * Math.sqrt(Math.abs(c))).toFixed(2) + ' ' + (cy + r * Math.sign(s) * Math.sqrt(Math.abs(s))).toFixed(2));
    }
    return out;
  }
  function shape(el) {
    var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    var R = el._g3r; if (R == null) { R = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; el._g3r = R; }
    var r = Math.min(R * K, w / 2, h / 2); if (r <= 0) return;
    var pts = [].concat(corner(w - r, r, r, -Math.PI / 2), corner(w - r, h - r, r, 0), corner(r, h - r, r, Math.PI / 2), corner(r, r, r, Math.PI));
    var d = 'M' + pts.join(' L') + ' Z';
    el.style.borderRadius = '0';
    el.style.clipPath = 'path("' + d + '")'; el.style.webkitClipPath = el.style.clipPath;
  }
  var ro = new ResizeObserver(function (es) { es.forEach(function (e) { shape(e.target); }); });
  function scan() { document.querySelectorAll(SEL).forEach(function (el) { if (!el._g3) { el._g3 = 1; ro.observe(el); shape(el); } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  window.addEventListener('load', scan);
  new MutationObserver(function () { clearTimeout(scan.t); scan.t = setTimeout(scan, 120); }).observe(document.documentElement, { childList: true, subtree: true });
})();
