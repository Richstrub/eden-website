/* The fire line: today's date, the wood in the hearth, and which fire this is.
 *
 * Eden opened on Wednesday, August 14, 2019 and lights the hearth four nights a week
 * (Wednesday to Saturday). It closes two weeks a year, so 8 nights a year are taken off,
 * spread evenly over the time since opening. The number goes up at the start of each
 * Wednesday, Thursday, Friday and Saturday.
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

  function render() {
    var now = new Date(), n = fireNumber(now);
    var date = document.getElementById('hxDate'), wood = document.getElementById('hxWood'), no = document.getElementById('hxNo');
    if (!date || !wood || !no) return;
    date.textContent = DAYS[now.getDay()] + ', ' + MONTHS[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    wood.textContent = woodFor(n);
    no.textContent = 'Fire No. ' + n.toLocaleString('en-US');
  }
  render();
  setInterval(render, 60000);
  window.EDEN_FIRE = { fireNumber: fireNumber, woodFor: woodFor };
})();
