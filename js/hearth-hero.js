/* Eden homepage hero, the hearth: embers and smoke rising from the coals, heat shimmer, firelight on the wordmark,
   and the logo's two embers on the first E. Markup in index.html (#home), styles in css/styles.css. */
(function () {
  var hero = document.getElementById('home'), cv = document.getElementById('hxFx'), inner = document.getElementById('heroInner');
  if (!hero || !cv) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), sparks = [], smoke = [], last = 0, on = true;
  function size() { var r = hero.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); window.addEventListener('resize', size);
  // a soft glowing dot, drawn once and reused for every ember
  var dot = document.createElement('canvas'); dot.width = dot.height = 64;
  (function () { var g = dot.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,236,200,1)'); r.addColorStop(.18, 'rgba(255,180,96,.95)'); r.addColorStop(.45, 'rgba(240,110,40,.35)'); r.addColorStop(1, 'rgba(200,60,20,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); })();
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function spawn() {
    sparks.push({ x: W / 2 + gauss() * W * .34, y: H + 10, vx: gauss() * 12, vy: -(24 + Math.random() * 52), life: 0, max: 4.5 + Math.random() * 5.5,
      r: .7 + Math.random() * Math.random() * 2.6, ph: Math.random() * 6.3, fl: 2 + Math.random() * 4, sway: 6 + Math.random() * 14 });
  }
  function puff() { smoke.push({ x: W / 2 + gauss() * W * .3, y: H * (.82 + Math.random() * .12), r: 80 + Math.random() * 120, vy: -(8 + Math.random() * 10), vx: gauss() * 4, life: 0, max: 9 + Math.random() * 6 }); }
  var acc = 0, sacc = 0;
  function frame(t) {
    if (!on) return;
    var dt = Math.min(.05, last ? (t - last) / 1000 : .016); last = t;
    var rate = Math.max(9, Math.min(30, W / 48));   // embers per second
    acc += dt * rate; while (acc > 1) { spawn(); acc--; }
    sacc += dt * .45; while (sacc > 1) { puff(); sacc--; }
    ctx.clearRect(0, 0, W, H);
    // smoke: slow, faint, behind the embers
    ctx.globalCompositeOperation = 'source-over';
    for (var j = smoke.length - 1; j >= 0; j--) {
      var m = smoke[j]; m.life += dt; if (m.life > m.max) { smoke.splice(j, 1); continue; }
      m.y += m.vy * dt; m.x += m.vx * dt + Math.sin(t / 2400 + j) * .12; m.r += dt * 9;
      var a = Math.sin(Math.PI * m.life / m.max) * .045, g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      g.addColorStop(0, 'rgba(150,140,130,' + a + ')'); g.addColorStop(1, 'rgba(150,140,130,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    }
    // embers: rise, sway in the draft, flicker and cool as they climb
    ctx.globalCompositeOperation = 'lighter';
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i]; s.life += dt; if (s.life > s.max || s.y < -20) { sparks.splice(i, 1); continue; }
      var k = s.life / s.max;
      s.vy *= (1 - dt * .12); s.vx += Math.sin(s.ph + s.life * 1.2) * s.sway * dt * .5;
      s.x += s.vx * dt; s.y += s.vy * dt;
      var fl = .65 + .35 * Math.sin(s.ph + s.life * s.fl), alpha = (k < .12 ? k / .12 : 1 - (k - .12) / .88) * fl, sz = s.r * (1 - k * .55) * 7;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.drawImage(dot, s.x - sz / 2, s.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
    // firelight on the wordmark: a slow, uneven flicker
    var lit = .5 + .22 * Math.sin(t / 900) + .14 * Math.sin(t / 370 + 1.3) + .08 * Math.sin(t / 133 + 4.1);
    inner.style.setProperty('--lit', lit.toFixed(3));
    // heat shimmer: the noise drifts upward
    var tb = document.getElementById('hxTurb'); if (tb) tb.setAttribute('baseFrequency', (0.010 + 0.002 * Math.sin(t / 2100)).toFixed(4) + ' ' + (0.040 + 0.008 * Math.sin(t / 1300)).toFixed(4));
    requestAnimationFrame(frame);
  }
  // pause when the hero is off screen or the tab is hidden
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { var v = e[0].isIntersecting; if (v && !on) { on = true; last = 0; requestAnimationFrame(frame); } else if (!v) on = false; }).observe(hero);
  document.addEventListener('visibilitychange', function () { if (document.hidden) on = false; else if (!on) { on = true; last = 0; requestAnimationFrame(frame); } });
  requestAnimationFrame(frame);

  /* the two embers from the logo, on the first E: each glows in its spot, flickering like a coal, then lifts off on a
     wandering draft, cools from gold to deep orange and goes out; a pause of its own, and it comes back.
     Now and then a tiny third spark breaks off between them. */
  var E = document.querySelector('.hx-e');
  if (E) {
    var fs = function () { return parseFloat(getComputedStyle(E).fontSize) || 100; };
    function ember(el, o) {
      var st = null;
      function next(t, first) {
        st = { t0: t + (first ? o.firstDelay : o.pause[0] + Math.random() * (o.pause[1] - o.pause[0])), glow: o.glow[0] + Math.random() * (o.glow[1] - o.glow[0]),
          rise: o.rise[0] + Math.random() * (o.rise[1] - o.rise[0]), dy: o.dy * (.8 + Math.random() * .5), dx: o.dx * (.4 + Math.random() * 1.2) * (Math.random() < .2 ? -1 : 1),
          sway: .006 + Math.random() * .01, swf: .6 + Math.random() * .8, ph: Math.random() * 6.28, fl: 2.2 + Math.random() * 1.6, fl2: 5 + Math.random() * 3 };
      }
      return function (t) {
        if (!st) next(t, true);
        var u = (t - st.t0) / 1000; if (u < 0) { el.style.opacity = 0; return; }
        var L = st.glow + st.rise; if (u > L) { next(t); el.style.opacity = 0; return; }
        var f = fs(), x = 0, y = 0, op, sc = 1, warm;
        var flick = .74 + .1 * Math.sin(st.ph + u * st.fl) + .05 * Math.sin(st.ph * 2 + u * st.fl2);   // slow, coal-like breathing
        if (u < st.glow) {   // glowing in its logo spot: kindles, then breathes
          var k = Math.min(1, u / 1.6); op = k * k * flick; warm = 0;
          x = Math.sin(u * 3.1 + st.ph) * .002 * f; y = Math.sin(u * 2.3 + st.ph) * .002 * f;
        } else {   // lifting off: eases up, sways in the draft, shrinks and cools, then winks out
          var r = (u - st.glow) / st.rise, e = r * r * (3 - 2 * r) * .55 + r * .45;
          y = -st.dy * f * e; x = st.dx * f * e + Math.sin(st.ph + r * st.swf * 6.28) * st.sway * f * r;
          op = flick * (r < .55 ? 1 : 1 - (r - .55) / .45) * (1 - r * .3); sc = 1 - r * .4; warm = r;
        }
        el.style.opacity = Math.max(0, op).toFixed(3);
        el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + sc.toFixed(3) + ')';
        el.style.background = 'rgb(255,' + Math.round(205 - 95 * warm) + ',' + Math.round(140 - 100 * warm) + ')';
      };
    }
    var embers = [
      ember(E.querySelector('.hx-spark-1'), { firstDelay: 2.2, pause: [2.5, 5], glow: [4, 6.5], rise: [5, 7], dy: .24, dx: .035 }),
      ember(E.querySelector('.hx-spark-2'), { firstDelay: 3.4, pause: [3, 6], glow: [5, 8], rise: [5.5, 7.5], dy: .3, dx: .05 }),
      ember(E.querySelector('.hx-spark-3'), { firstDelay: 12, pause: [14, 26], glow: [.6, 1.2], rise: [3.5, 4.5], dy: .22, dx: .06 })
    ];
    (function tick(t) { if (on) embers.forEach(function (f) { f(t); }); requestAnimationFrame(tick); })(performance.now());
  }
})();
