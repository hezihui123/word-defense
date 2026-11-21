var _bookDialog$querySele;
function _callSpread(a, e, l) { return a.apply(e, l); }
function _slicedToArray(e, i) { return _iterableToArrayLimit(e, i) || _unsupportedIterableToArray(e, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, t) { var e = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { var l, n, i, a, u = [], o = !0, f = !1; try { if (i = (e = e.call(r)).next, 0 === t) { if (Object(e) !== e) return; o = !1; } else for (; !(o = (l = i.call(e)).done) && (u.push(l.value), u.length !== t); o = !0); } catch (r) { f = !0, n = r; } finally { try { if (!o && null != e.return && (a = e.return(), Object(a) !== a)) return; } finally { if (f) throw n; } } return u; } }
function _createForOfIteratorHelper(e, t) { var _n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"]; if (!_n) { if (Array.isArray(e) || (_n = _unsupportedIterableToArray(e)) || t && e && "number" == typeof e.length) { _n && (e = _n); var o = 0, F = function F() {}; return { s: F, n: function n() { return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var a, u, i = !0; return { s: function s() { _n = _n.call(e); }, n: function n() { i = !0; var r = _n.next(); return r.done ? { done: !0 } : { value: r.value, done: i = !1 }; }, e: function e(r) { a = !0, u = r; }, f: function f() { try { i || null == _n.return || _n.return(); } finally { if (a) throw u; } } }; }
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(t, e) { if (t) { if ("string" == typeof t) return _arrayLikeToArray(t, e); var o = {}.toString.call(t).slice(8, -1); return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(t, e) : void 0; } }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var desk = document.querySelector('.desk');
var bookDialog = document.querySelector('#book-dialog');
var reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
var volumes = document.querySelectorAll('.fallback .unit-volume');
(_bookDialog$querySele = bookDialog.querySelector('.volumes')).append.apply(_bookDialog$querySele, _toConsumableArray(volumes));
var _iterator = _createForOfIteratorHelper(volumes),
  _step;
try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var volume = _step.value;
    volume.hidden = true;
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
var _iterator2 = _createForOfIteratorHelper(document.querySelectorAll('.volume-book')),
  _step2;
try {
  var _loop = function _loop() {
    var book = _step2.value;
    book.addEventListener('click', function () {
      var target = document.getElementById('tv-' + book.dataset.volume);
      var _iterator3 = _createForOfIteratorHelper(volumes),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _volume = _step3.value;
          _volume.hidden = _volume !== target;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      bookDialog.style.setProperty('--book-color', book.style.getPropertyValue('--book'));
      bookDialog.querySelector('#current-volume').textContent = target.querySelector('h3').textContent;
      if (!bubble.hidden) closeBubble(false);
      bookDialog.showModal();
      bookDialog.querySelector('.book-close').focus({
        preventScroll: true
      });
    });
  };
  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
    _loop();
  }
} catch (err) {
  _iterator2.e(err);
} finally {
  _iterator2.f();
}
bookDialog.addEventListener('click', function (event) {
  if (event.target === bookDialog) bookDialog.close();
});
var pea = document.querySelector('#pea');
var bubble = document.querySelector('#pea-guide');
var audio = document.querySelector('#pea-audio');
var letters = document.querySelector('#pea-letters');
var line = document.querySelector('#pea-line');
var play = document.querySelector('#pea-play');
var cues = [[0, 'ABC', '你好呀，我是小豌豆！选一本英语课本，再挑一个单元。'], [6.23, 'APPLE', '僵尸举着英文单词走来了！'], [9.13, 'APPLE', '点传送带上的图片卡，听听单词怎么读。'], [13.92, 'APPLE', '找到对应的图片卡，拖到僵尸那一行的空地上。'], [20.81, 'MATCH', '射手会自动开火。单词对上，两枪打倒僵尸！'], [26.33, 'OOPS', '选错会让僵尸加速。每行的小车只能救急一次。'], [32.46, 'GO', '小车用完后，再有僵尸冲进来，这局就输了。'], [37.21, 'GO', '准备好了？选个单元开始吧！']];
// Mouth openings measured from the narration at 20 samples per second, including pauses.
var mouthFrames = atob('AAAAAAAMJCQVJCQkJCQkJAgAAAAAAAojGw0NGAwMGQ8YJCQQDiQkJAoAAAAAAAAAAAAAAAAdJBkPCwsiJBoOEBIQJBMaGRQSFxYADRgkJAAcGyQkDwAAAAAAABIZGAwAECQkJBITCCQkJCQkGA0kJCQkCAAAAAAAAAAAAAAAICQeExANDREbJAAZJBkACA8SDiQVHBwQGSQiDCQkIQoAABskCwokFA0AEiQkJCQkJCAAAAgAAAAKHyQVEBATCSQkJCQAChckJAoUJBgMJCQkDh8kEiQKCAsYCRgkJAoPEiQkJBYAAAAAAAANECQXEQ4JAAsRCgoJJCQjCQAAAA8JJBwAEhQfJBYkJB0NAAkAAAAAAAAAAAAAJCAcGg8kJCQhAAwkJAAdJBsODAwaCyQkJAsAAA8YExUkHR0YEAkkJAAIDiMJACQkJAgLEBMUJCQLAAAAAAAAAAAiJB4WCBAkJAAJIyQkJCQkJA8AJCQXDQsMGCETABMiGAAkJCQQJCQkERIQDCQXCyQdAAkVEQ0LChgVHiQaFhQkJBkAAAAAAAAICg4kJB8RCiIkJCQNACQgFAAAJCQeDCQkDAsWJCQkCggeJCQkAAAAAAAAAAAkJB0KAAoWCSAfGBQkJCQNAAAAAAAQHSQcCgwJAAkkJAwSABokJBwkCyQkJA4kJBkQJCQkAAAAAAAAAAAAAAAAAAkcJCQfCw0SCQ4kJBEKChYkJCQVAAAAAAAAGyQaCg0NDRUkJBAUJCIAGg4AGCQkJAAAJCQWCQAAAAAAAAAAESQcGhQPFB0SGB0JGCQkGgkOEiQkJBUAAAAAChIdCxUXDAsAJCQWAAgYHhcQDyIkAAAkJCQRAAAAAAAAAAAAABoTEw0LESQkGiQhJCQkIQkkJCQeAAAAAAAAHCQkIiEeJB4JFSQbDQsUEwsVGQoNESMkJCQkJAoAAAAAAAsZJCQAABMcCCQfDggJJCQkJCQkDgAAAAAAAAAAAAAAACQkDiQkECIkJCQkJCQAAAAACBcbFAkTHxANDggkJBkkJBYTJCQLJCQkDQAAAAAAAAAAAAAAAAAAAAAAAAAA');
var activeCue = -1;
var frame = 0;
function updateBubble() {
  var next = cues.length - 1;
  while (next > 0 && audio.currentTime < cues[next][0]) next--;
  if (next === activeCue) return;
  activeCue = next;
  var _cues$next = _slicedToArray(cues[next], 3),
    word = _cues$next[1],
    text = _cues$next[2];
  if (letters.textContent !== word) {
    _callSpread(letters.replaceChildren, letters, _toConsumableArray(Array.from(word, function (letter, index) {
      var tile = document.createElement('span');
      tile.textContent = letter;
      tile.style.setProperty('--i', index);
      return tile;
    })));
    letters.setAttribute('aria-label', word);
  }
  line.textContent = text;
}
function closeMouth() {
  cancelAnimationFrame(frame);
  pea.removeAttribute('data-mouth-open');
}
function speak() {
  updateBubble();
  var opening = reducedMotion.matches ? 0 : mouthFrames.charCodeAt(Math.floor(audio.currentTime * 20)) || 0;
  pea.toggleAttribute('data-mouth-open', opening > 0);
  pea.style.setProperty('--mouth', opening / 32);
  frame = requestAnimationFrame(speak);
}
function playNarration() {
  var restart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  if (restart) {
    audio.currentTime = 0;
    activeCue = -1;
    updateBubble();
  }
  audio.play().catch(function () {
    if (bubble.hidden || !audio.paused) return;
    line.textContent = '点播放，再听小豌豆讲玩法。';
    play.textContent = '播放';
  });
}
function closeBubble() {
  var restoreFocus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  bubble.hidden = true;
  pea.setAttribute('aria-expanded', 'false');
  audio.pause();
  closeMouth();
  if (restoreFocus) pea.focus({
    preventScroll: true
  });
}
pea.addEventListener('click', function () {
  if (!bubble.hidden) {
    closeBubble();
    return;
  }
  bubble.hidden = false;
  pea.setAttribute('aria-expanded', 'true');
  playNarration(true);
});
document.querySelector('#pea-close').addEventListener('click', function () {
  return closeBubble();
});
desk.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !bubble.hidden) closeBubble();
});
play.addEventListener('click', function () {
  if (audio.paused) playNarration(audio.ended || audio.currentTime === 0);else audio.pause();
});
audio.addEventListener('playing', function () {
  closeMouth();
  activeCue = -1;
  play.textContent = '暂停';
  speak();
});
audio.addEventListener('waiting', closeMouth);
audio.addEventListener('timeupdate', updateBubble);
audio.addEventListener('pause', function () {
  closeMouth();
  play.textContent = audio.ended ? '再听一遍' : '继续';
});
audio.addEventListener('ended', function () {
  closeMouth();
  play.textContent = '再听一遍';
});
function resetView() {
  desk.style.setProperty('--pan-x', '0px');
  desk.style.setProperty('--pan-y', '0px');
}
desk.addEventListener('pointermove', function (event) {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  var rect = desk.getBoundingClientRect();
  desk.style.setProperty('--pan-x', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'px');
  desk.style.setProperty('--pan-y', ((event.clientY - rect.top) / rect.height - .5) * 16 + 'px');
});
desk.addEventListener('pointerleave', resetView);
reducedMotion.addEventListener('change', resetView);
document.body.classList.add('desk-ready');
var selectedVolume = location.hash.slice(1);
if (/^volume-[0-3]-[01]$/.test(selectedVolume)) {
  var _document$querySelect;
  (_document$querySelect = document.querySelector('.volume-book[data-volume="' + selectedVolume + '"]')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.click();
}