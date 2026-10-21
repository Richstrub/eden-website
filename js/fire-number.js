/* The fire line: today's date, the wood in the hearth, and which fire this is.
 *
 * Eden opened on Wednesday, August 14, 2019 and lights the hearth four nights a week
 * (Wednesday to Saturday). It closes two weeks a year, so 8 nights a year are taken off,
 * spread evenly over the time since opening. The number goes up at the start of each
 * Wednesday, Thursday, Friday and Saturday. From Wednesday at 3 pm to Saturday at 11 pm the line
 * shows tonight's fire and its wood; the rest of the week it shows the next fire, its date, and "Banked".
 * Ash is always in the hearth; maple, hickory and cherry rotate alongside it, so each fire
 * gets its own mix, always the same mix for the same fire number.
 */
(function () {
  var OPENED = new Date(2019, 7, 14);          // August 14, 2019
  var FIRE_NIGHTS = [3, 4, 5, 6];              // Wednesday to Saturday
  var CLOSED_NIGHTS_PER_YEAR = 2 * FIRE_NIGHTS.length;
  var LIT_HOUR = 0;                            // a fire night counts from the start of the day
  var WOODS = ['Ash', 'Maple', 'Hickory', 'Cherry'];

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function isFireNight(d) { return FIRE_NIGHTS.indexOf(d.getDay()) !== -1; }

  // Fire nights from opening night through `last`, inclusive
  function fireNightsThrough(last) {
    var days = Math.round((dayStart(last) - OPENED) / 86400000) + 1;
    if (days <= 0) return 0;
    var weeks = Math.floor(days / 7), n = weeks * FIRE_NIGHTS.length;
    for (var i = weeks * 7; i < days; i++) {
      var d = new Date(OPENED.getFullYear(), OPENED.getMonth(), OPENED.getDate() + i);
      if (isFireNight(d)) n++;
    }
    return n;
  }

  // The most recent night the fire was lit, as of `now`
  function lastFire(now) {
    var d = dayStart(now);
    if (isFireNight(d) && now.getHours() >= LIT_HOUR) return d;
    do { d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1); } while (!isFireNight(d));
    return d;
  }

  function fireNumber(now) {
    var last = lastFire(now);
    var years = (last - OPENED) / (365.2425 * 86400000);
    return Math.max(1, fireNightsThrough(last) - Math.floor(CLOSED_NIGHTS_PER_YEAR * years));
  }

  // Ash plus every combination of the other woods, in a fixed order
  var MIXES = [];
  (function () {
    var others = WOODS.slice(1), n = others.length;
    for (var mask = 1; mask < (1 << n); mask++) {
      var mix = [WOODS[0]];
      for (var i = 0; i < n; i++) if (mask & (1 << i)) mix.push(others[i]);
      MIXES.push(mix);
    }
  })();
  // Every run of fires burns each mix once, in a shuffled order, so the wood never repeats two nights running
  function orderFor(cycle) {
    var s = (cycle * 9301 + 49297) % 233280, order = MIXES.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      var j = Math.floor(s / 233280 * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t;
    }
    return order;
  }
  function mixIndex(n) {
    var L = MIXES.length, cycle = Math.floor((n - 1) / L), pos = (n - 1) % L, order = orderFor(cycle);
    if (cycle > 0) {
      var prev = orderFor(cycle - 1)[L - 1];
      if (order[0] === prev) { var t = order[0]; order[0] = order[1]; order[1] = t; }
    }
    return order[pos];
  }
  function woodFor(n) {
    var mix = MIXES[mixIndex(n)];
    return mix.length === 2 ? mix[0] + ' & ' + mix[1] : mix.slice(0, -1).join(', ') + ' & ' + mix[mix.length - 1];
  }

  // The fire is shown as burning from Wednesday at 3 pm until Saturday at 11 pm.
  // Outside that stretch the hearth is banked, and the line shows the next fire and its date.
  var BURN_FROM = { day: 3, hour: 15 }, BURN_UNTIL = { day: 6, hour: 23 };
  function burning(now) {
    var dow = now.getDay(), h = now.getHours();
    if (dow === BURN_FROM.day) return h >= BURN_FROM.hour;
    if (dow === BURN_UNTIL.day) return h < BURN_UNTIL.hour;
    return dow > BURN_FROM.day && dow < BURN_UNTIL.day;
  }
  // The first night of the next burning stretch (the coming Wednesday, or today if it is Wednesday before 3 pm)
  function nextFireDay(now) {
    var d = dayStart(now);
    if (d.getDay() === BURN_FROM.day && now.getHours() < BURN_FROM.hour) return d;
    do { d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); } while (d.getDay() !== BURN_FROM.day);
    return d;
  }
  function longDate(d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function shortDate(d) { return DAYS[d.getDay()].slice(0, 3) + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); }
  // Always one line: if the full line doesn't fit, use short dates, then shrink the type until it does
  function fit(el, full, short, dateEl) {
    el.style.fontSize = ''; el.style.letterSpacing = '';
    dateEl.textContent = full;
    if (el.scrollWidth <= el.clientWidth + 1) return;
    dateEl.textContent = short;
    var size = parseFloat(getComputedStyle(el).fontSize), ls = 0.14;
    for (var i = 0; i < 40 && el.scrollWidth > el.clientWidth + 1 && size > 6; i++) {
      size -= 0.25; ls = Math.max(0.04, ls - 0.006);
      el.style.fontSize = size + 'px'; el.style.letterSpacing = ls + 'em';
    }
  }

  function render() {
    var now = new Date();
    var date = document.getElementById('hxDate'), wood = document.getElementById('hxWood'), no = document.getElementById('hxNo');
    if (!date || !wood || !no) return;
    var full, short;
    if (burning(now)) {
      var n = fireNumber(now);
      full = longDate(now); short = shortDate(now);
      wood.textContent = woodFor(n);
      no.textContent = 'Fire No. ' + n.toLocaleString('en-US');
    } else {
      var next = nextFireDay(now), m = fireNumber(new Date(next.getFullYear(), next.getMonth(), next.getDate(), BURN_FROM.hour));
      full = 'Next fire · ' + longDate(next); short = 'Next fire · ' + shortDate(next);
      wood.textContent = 'Banked';
      no.textContent = 'Fire No. ' + m.toLocaleString('en-US');
    }
    var box = document.getElementById('hxStatus');
    if (box) { fit(box, full, short, date); LAST = [box, full, short, date]; } else date.textContent = full;
  }
  var LAST = null;
  render();
  setInterval(render, 60000);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (LAST) fit.apply(null, LAST); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (LAST) fit.apply(null, LAST); });
  window.EDEN_FIRE = { fireNumber: fireNumber, woodFor: woodFor, burning: burning, nextFireDay: nextFireDay };
})();
