/* Eden runtime adapter.
 *
 * The site was first built as a hosted Claude page, where a small runtime
 * (window.claude.use) supplies a shared database, the signed-in viewer and file
 * downloads. This file provides the same interface on ordinary web hosting
 * (GitHub Pages, Netlify, your own server), so app.js and catering.js run
 * unchanged. Which backend it uses is set in js/config.js:
 *
 *   static   — read-only; the menu comes from js/menu-data.js
 *   local    — the editor saves to this browser's localStorage
 *   firebase — the editor saves to Cloud Firestore; everyone sees changes live
 *
 * Database paths used by the site (identical in local and Firebase modes):
 *   site/menu                 { allergy, updatedAt, tabs:[{ id, label, gids:[...] }] }
 *   site/menu/groups/{gid}    { title, note, noteAfter, items:[...] }   one per menu section
 *   site/supper               the Supper Club page
 */
(function () {
  'use strict';
  if (window.claude && typeof window.claude.use === 'function') return; // hosted on Claude: keep its runtime

  var CFG = window.EDEN_CONFIG || {};
  var mode = String(CFG.backend || 'static').toLowerCase();
  var editors = (CFG.editors || []).map(function (e) { return String(e).trim().toLowerCase(); }).filter(Boolean);
  var FIREBASE_VERSION = '10.12.2';

  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function rid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

  /* ---------- downloads: a real file download ---------- */
  var downloads = {
    save: function (req) {
      return new Promise(function (resolve, reject) {
        try {
          var blob = req.data instanceof Blob ? req.data : new Blob([req.data]);
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url; a.download = req.filename || 'download';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
          resolve({ status: 'saved' });
        } catch (e) { reject({ code: 'unavailable', message: String(e && e.message || e) }); }
      });
    }
  };

  /* ---------- local mode: a tiny document store in localStorage ---------- */
  function makeLocalDb() {
    var KEY = 'eden-local-menu-db';
    var data = read(), subs = [];
    function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
    function write() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
    function fire() { subs.slice().forEach(function (f) { f(); }); }
    window.addEventListener('storage', function (e) { if (e.key === KEY) { data = read(); fire(); } }); // other tabs
    function meta() { return { fromCache: false, hasPendingWrites: false }; }
    function docSnap(p) {
      var v = data[p];
      return { id: p.split('/').pop(), exists: v !== undefined, data: function () { return clone(v); }, metadata: meta() };
    }
    function watch(f) { subs.push(f); setTimeout(f, 0); return function () { subs = subs.filter(function (x) { return x !== f; }); }; }
    function doc(p) {
      return {
        id: p.split('/').pop(), path: p,
        get: function () { return Promise.resolve(docSnap(p)); },
        set: function (b) { data[p] = clone(b); write(); setTimeout(fire, 0); return Promise.resolve(); },
        update: function (b) {
          if (data[p] === undefined) return Promise.reject({ code: 'invalid_argument', message: 'No document at ' + p });
          Object.keys(b).forEach(function (k) { data[p][k] = clone(b[k]); }); write(); setTimeout(fire, 0); return Promise.resolve();
        },
        delete: function () { delete data[p]; write(); setTimeout(fire, 0); return Promise.resolve(); },
        onSnapshot: function (next) { return watch(function () { next(docSnap(p)); }); },
        collection: function (sub) { return col(p + '/' + sub); }
      };
    }
    function col(p) {
      var depth = p.split('/').length;
      function snap() {
        var docs = Object.keys(data).filter(function (k) { return k.indexOf(p + '/') === 0 && k.split('/').length === depth + 1; }).sort().map(docSnap);
        return { docs: docs, size: docs.length, empty: !docs.length, docChanges: function () { return []; }, metadata: meta() };
      }
      return {
        path: p,
        doc: function (id) { return doc(p + '/' + (id || rid())); },
        get: function () { return Promise.resolve(snap()); },
        onSnapshot: function (next) { return watch(function () { next(snap()); }); }
      };
    }
    return { doc: doc, collection: col };
  }

  /* ---------- Firebase mode ---------- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  var fb = { db: null, auth: null, user: null };
  function initFirebase() {
    var c = CFG.firebase || {};
    if (!c.apiKey || !c.projectId) return Promise.reject(new Error('Firebase is selected in js/config.js but its settings are empty.'));
    var base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
    return loadScript(base + 'firebase-app-compat.js')
      .then(function () { return Promise.all([loadScript(base + 'firebase-auth-compat.js'), loadScript(base + 'firebase-firestore-compat.js')]); })
      .then(function () {
        /* global firebase */
        firebase.initializeApp(c);
        fb.db = firebase.firestore();
        try { fb.db.settings({ ignoreUndefinedProperties: true }); } catch (e) {}
        fb.auth = firebase.auth();
        return new Promise(function (resolve) {
          var stop = fb.auth.onAuthStateChanged(function (u) { stop(); fb.user = u; resolve(); });
        });
      });
  }
  function fbCanEdit() {
    if (!fb.user) return false;
    var email = String(fb.user.email || '').toLowerCase();
    return !editors.length || editors.indexOf(email) !== -1;
  }

  /* ---------- choose the backend ---------- */
  var db = null, canEdit = false, ready;
  if (mode === 'local') {
    db = makeLocalDb(); canEdit = true; ready = Promise.resolve();
  } else if (mode === 'firebase') {
    ready = initFirebase().then(function () { db = fb.db; canEdit = fbCanEdit(); })
      .catch(function (e) { console.warn('[Eden] Firebase unavailable, showing the built-in menu:', e && e.message || e); mode = 'static'; });
  } else {
    mode = 'static'; ready = Promise.resolve();
  }

  var user = {
    isOwner: function () { return Promise.resolve(canEdit); },
    canEdit: function () { return Promise.resolve(canEdit); },
    can: function (name) { return Promise.resolve(name === 'data.write' ? canEdit : false); },
    id: function () { return Promise.resolve(fb.user ? fb.user.uid : (mode === 'local' ? 'local' : null)); },
    me: function () {
      return Promise.resolve({ id: fb.user ? fb.user.uid : null, name: fb.user ? (fb.user.displayName || '') : '', email: fb.user ? fb.user.email : null, avatarUrl: '', color: '#b0703f', isOwner: canEdit, canEdit: canEdit });
    },
    profiles: function (ids) { var o = {}; [].concat(ids).forEach(function (i) { o[i] = { id: i, name: '', avatarUrl: '', color: '#b0703f', email: null, isMe: false, guest: false }; }); return Promise.resolve(o); }
  };

  window.claude = {
    use: function (name) {
      return ready.then(function () {
        if (name === 'db') return db;
        if (name === 'user') return user;
        if (name === 'downloads') return downloads;
        return null;
      });
    }
  };

  /* ---------- editor extras: download the menu, Firebase sign-in / sign-out ---------- */
  function assembleFrom(store) {
    return store.doc('site/menu').get().then(function (m) {
      if (!m.exists) return clone(window.EDEN_MENU_SEED);
      var meta = m.data();
      if (!meta.tabs || !meta.tabs.length || !meta.tabs[0].gids) return meta; // older single-document format
      return Promise.all([store.collection('site/menu/groups').get(), store.doc('site/supper').get()]).then(function (r) {
        var g = {}; r[0].docs.forEach(function (d) { g[d.id] = d.data(); });
        return {
          allergy: meta.allergy || '', updatedAt: meta.updatedAt,
          tabs: meta.tabs.map(function (t) {
            return { id: t.id, label: t.label, groups: (t.gids || []).filter(function (id) { return g[id]; }).map(function (id) { return Object.assign({ id: id }, g[id]); }) };
          }),
          supper: r[1].exists ? r[1].data() : (meta.supper || null)
        };
      });
    });
  }

  var css = '' +
    '.eden-auth{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,18,21,.92);color:var(--ivory,#f3eee5);font-family:var(--sans,Arial,sans-serif)}' +
    '.eden-auth[hidden]{display:none!important}' +
    '.eden-auth form{width:min(400px,100%);display:grid;gap:14px;padding:36px 32px;background:var(--ink,#0f1215);border:1px solid rgba(243,238,229,.18)}' +
    '.eden-auth h2{font-family:var(--serif,Georgia,serif);font-weight:300;font-size:2rem;letter-spacing:.06em;margin:0}' +
    '.eden-auth p{margin:0;font-size:.9rem;color:rgba(243,238,229,.68)}' +
    '.eden-auth label{display:grid;gap:6px;font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;color:rgba(243,238,229,.68)}' +
    '.eden-auth input{font:inherit;font-size:1rem;letter-spacing:0;text-transform:none;padding:10px 12px;border:1px solid rgba(243,238,229,.25);background:transparent;color:inherit}' +
    '.eden-auth button{font-family:var(--sans,Arial,sans-serif);font-size:.7rem;letter-spacing:.24em;text-transform:uppercase;padding:13px 18px;border:1px solid var(--ember,#b0703f);background:var(--ember,#b0703f);color:var(--ivory,#f3eee5);cursor:pointer}' +
    '.eden-auth .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}' +
    '.eden-auth .link{background:none;border:0;padding:0;color:var(--ember-hot,#e09a5e);text-transform:none;letter-spacing:0;font-size:.85rem}' +
    '.eden-auth .msg{min-height:1.2em;color:var(--ember-hot,#e09a5e)}';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  function setupEditorExtras() {
    if (mode === 'static') return;
    var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    var actions = document.querySelector('#editor .ed-actions');

    if (actions && db) {
      var dl = el('<button class="ed-btn ghost" type="button">Download menu.json</button>');
      dl.onclick = function () {
        assembleFrom(db).then(function (menu) {
          return downloads.save({ filename: 'menu.json', data: new Blob([JSON.stringify(menu, null, 2) + '\n'], { type: 'application/json' }) });
        }).catch(function (e) { console.error(e); });
      };
      actions.insertBefore(dl, actions.firstChild);
    }

    if (mode !== 'firebase') return;

    if (actions && fb.user) {
      var out = el('<button class="ed-btn ghost" type="button">Sign out</button>');
      out.onclick = function () { fb.auth.signOut().then(function () { location.reload(); }); };
      actions.insertBefore(out, actions.firstChild);
    }

    var box = el('<div class="eden-auth" hidden><form novalidate>' +
      '<h2>Menu Editor</h2><p class="who"></p>' +
      '<label>Email<input type="email" name="email" autocomplete="username" required></label>' +
      '<label>Password<input type="password" name="password" autocomplete="current-password" required></label>' +
      '<p class="msg" role="status"></p>' +
      '<div class="row"><button type="submit">Sign in</button><button type="button" class="link" data-act="reset">Forgot password?</button></div>' +
      '<div class="row"><button type="button" class="link" data-act="site">Back to the website</button><button type="button" class="link" data-act="signout" hidden>Sign out</button></div>' +
      '</form></div>');
    document.body.appendChild(box);
    var form = box.querySelector('form'), msg = box.querySelector('.msg'), who = box.querySelector('.who');
    if (fb.user && !canEdit) {
      who.textContent = 'You are signed in as ' + fb.user.email + ', which is not on the list of menu editors.';
      box.querySelector('[data-act="signout"]').hidden = false;
    } else {
      who.textContent = 'Sign in to edit the menu.';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); msg.textContent = 'Signing in…';
      fb.auth.signInWithEmailAndPassword(form.email.value.trim(), form.password.value)
        .then(function () { location.reload(); })
        .catch(function (err) { msg.textContent = err && err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again in a few minutes.' : 'That email and password did not work.'; });
    });
    box.addEventListener('click', function (e) {
      var act = e.target && e.target.dataset && e.target.dataset.act;
      if (act === 'site') location.hash = '#home';
      if (act === 'signout') fb.auth.signOut().then(function () { location.reload(); });
      if (act === 'reset') {
        var email = form.email.value.trim();
        if (!email) { msg.textContent = 'Enter your email first.'; return; }
        fb.auth.sendPasswordResetEmail(email).then(function () { msg.textContent = 'Check your email for a reset link.'; }, function () { msg.textContent = 'Could not send a reset email.'; });
      }
    });
    function sync() { box.hidden = !(location.hash === '#editor' && !canEdit); }
    window.addEventListener('hashchange', sync); sync();
  }

  function whenReady() { ready.then(setupEditorExtras); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', whenReady); else whenReady();
})();
