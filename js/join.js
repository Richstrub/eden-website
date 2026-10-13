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
