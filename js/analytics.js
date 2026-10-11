/* Eden website: visit counter for the staff site's Analytics page.
 * Sends one tiny, anonymous note per page view (which page, the site the visitor came from, and any
 * campaign tag on the link) to the staff site, which adds the approximate location and stores it.
 * No cookies, nothing stored in the browser, no personal information. Visitors whose browser asks
 * not to be tracked (Do Not Track / Global Privacy Control) are not counted, and neither is the
 * in-restaurant iPad menu. */
(function () {
  'use strict';
  var CF = window.EDEN_CONFIG || {};
  var url = CF.analytics || (CF.staffSite ? String(CF.staffSite).replace(/\/?$/, '/') + 't' : '');
  if (!url || !navigator.sendBeacon) return;
  if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === 'file:') return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;

  function onIpad() {
    var h = location.hash;
    if (h === '#ipad' || h === '#editor' || h === '#exit-ipad') return true;
    try { return localStorage.getItem('eden-ipad-menu') === '1'; } catch (e) { return false; }
  }
  function page() {
    var h = location.hash;
    if (h === '#supper' || h === '#supper-menu') return '/supper';
    if (h === '#catering') return '/catering';
    return '/';
  }
  var q = new URLSearchParams(location.search), last = '', first = true;
  function send() {
    if (onIpad()) return;
    var p = page();
    if (p === last) return;   // scrolling between sections of the same page isn't a new page view
    last = p;
    var data = { p: p, r: first ? document.referrer : '' };
    if (first) { data.s = q.get('utm_source') || ''; data.m = q.get('utm_medium') || ''; data.c = q.get('utm_campaign') || ''; }
    first = false;
    try { navigator.sendBeacon(url, new Blob([JSON.stringify(data)], { type: 'text/plain' })); } catch (e) { /* never get in the way */ }
  }
  if (document.readyState === 'complete') setTimeout(send, 300);
  else window.addEventListener('load', function () { setTimeout(send, 300); });
  window.addEventListener('hashchange', function () { setTimeout(send, 50); });
})();
