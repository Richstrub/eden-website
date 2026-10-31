/* Eden website: "Join our list" in the footer. Sends the address to the staff site, which adds it to the
 * guest list for Eden's promotional emails (Office > Promotional emails). Every email has an unsubscribe link. */
(function () {
  'use strict';
  var CF = window.EDEN_CONFIG || {}, base = CF.staffSite ? String(CF.staffSite).replace(/\/?$/, '/') : '';
  var form = document.getElementById('joinForm'), msg = document.getElementById('joinMsg');
  if (!form) return;
  if (!base) { form.parentNode.hidden = true; return; }
  var started = 0;
  form.addEventListener('focusin', function () { if (!started) started = Date.now(); });
  function say(t, err) { msg.textContent = t; msg.className = 'foot-join-msg' + (err ? ' err' : ' ok'); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    if (!/^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[a-z]{2,}$/i.test(email)) { say('Please check your email address.', true); form.email.focus(); return; }
    var btn = form.querySelector('button'); btn.disabled = true; say('');
    fetch(base + 'promo/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email, website: form.website.value, t: started || Date.now() - 60000 }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        btn.disabled = false;
        if (x.ok) { form.reset(); say(x.j.already ? 'You’re already on our list. Thank you!' : 'Thank you! You’re on our list.'); return; }
        say(x.j.error === 'email' ? 'Please check your email address.' : x.j.error === 'busy' ? 'Please try again a little later.' : 'Sorry, that didn’t work. Please try again later.', true);
      }, function () { btn.disabled = false; say('Sorry, that didn’t work. Please try again later.', true); });
  });
})();

/* "Join the Supper Club" / "Join our list" lightbox: opened by any [data-join] button (home page hero, Supper Club
 * page), and once on its own on the Supper Club page for visitors who haven't joined or closed it lately.
 * Signs people up to the same guest list as the footer box (with their first name). */
(function () {
  'use strict';
  var CF = window.EDEN_CONFIG || {}, base = CF.staffSite ? String(CF.staffSite).replace(/\/?$/, '/') : '';
  var box = document.getElementById('joinBox'); if (!box) return;
  var form = document.getElementById('jbForm'), msg = document.getElementById('jbMsg'), go = document.getElementById('jbGo');
  var KEY = 'eden-join', opened = 0, lastFocus = null, timer = null;
  var COPY = {
    supper: { eye: 'Eden Supper Club', title: 'Join the Supper Club', lede: 'Be the first to hear about our next Supper Club dinner: intimate tasting menus cooked over the hearth, plus cooking classes and wine and spirit tasting dinners. Members hear before seats go public.', go: 'Join' },
    list: { eye: 'Eden', title: 'Join our list', lede: 'Seasonal menus, Supper Club dinners, cooking classes and wine and spirit tasting dinners, a few times a season. Be the first to know when the fire is lit for something special.', go: 'Join' }
  };
  function mem(v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(KEY) || '{}'); localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { return {}; } }
  function say(t, err) { msg.textContent = t; msg.className = 'jb-msg' + (t ? (err ? ' err' : ' ok') : ''); }
  function open(kind) {
    var c = COPY[kind] || COPY.list;
    document.getElementById('jbEye').textContent = c.eye; document.getElementById('jbTitle').textContent = c.title;
    document.getElementById('jbLede').textContent = c.lede; go.textContent = c.go;
    form.hidden = false; say(''); box.classList.remove('done');
    lastFocus = document.activeElement; opened = Date.now();
    box.hidden = false; document.documentElement.classList.add('jb-lock');
    requestAnimationFrame(function () { box.classList.add('on'); });
    setTimeout(function () { var f = document.getElementById('jbName'); if (f && !('ontouchstart' in window)) f.focus(); }, 260);
  }
  function close() {
    if (box.hidden) return;
    box.classList.remove('on'); document.documentElement.classList.remove('jb-lock');
    var m = mem(); if (!m.joined) { m.closed = Date.now(); mem(m); }
    setTimeout(function () { box.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-join]');
    if (b) { e.preventDefault(); open(b.getAttribute('data-join')); }
  });
  document.getElementById('jbClose').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (!box.hidden && e.key === 'Escape') close(); });
  box.querySelector('.jb-fine a').addEventListener('click', function () { close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.email.value.trim(), name = form.name.value.trim();
    if (!/^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[a-z]{2,}$/i.test(email)) { say('Please check your email address.', true); form.email.focus(); return; }
    if (!base) { say('Sorry, sign-ups aren’t open right now.', true); return; }
    go.disabled = true; say('');
    fetch(base + 'promo/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email, name: name, website: form.website.value, t: opened || Date.now() - 60000 }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        go.disabled = false;
        if (x.ok) {
          var m = mem(); m.joined = Date.now(); mem(m);
          form.reset(); form.hidden = true; box.classList.add('done');
          say(x.j.already ? 'You’re already on the list. Thank you!' : 'You’re in' + (name ? ', ' + name.split(' ')[0] : '') + '. Watch your inbox for the next dinner.');
          return;
        }
        say(x.j.error === 'email' ? 'Please check your email address.' : x.j.error === 'busy' ? 'Please try again a little later.' : 'Sorry, that didn’t work. Please try again later.', true);
      }, function () { go.disabled = false; say('Sorry, that didn’t work. Please try again later.', true); });
  });

  // on the Supper Club page, offer it once after a few seconds (not on the in-restaurant iPad, not to people who
  // already joined, and not again for two weeks after someone closes it)
  function maybeAuto() {
    clearTimeout(timer);
    if (location.hash !== '#supper' && location.hash !== '#supper-menu') return;
    if (document.body.classList.contains('on-ipad')) return;
    var m = mem(); if (m.joined || (m.closed && Date.now() - m.closed < 14 * 864e5)) return;
    timer = setTimeout(function () { if ((location.hash === '#supper' || location.hash === '#supper-menu') && box.hidden && !document.querySelector('.wd')) open('supper'); }, 7000);
  }
  window.addEventListener('hashchange', maybeAuto); maybeAuto();
})();
