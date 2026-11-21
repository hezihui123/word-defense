/* Android 4.4 WebView (Chrome 30) 兼容层：ES6 内置对象、DOM API、PointerEvent、dialog。 */
(function () {
  'use strict';

  /* ---- Symbol / 迭代器（Babel 的展开与 for-of 辅助函数需要） ---- */
  if (typeof window.Symbol !== 'function') {
    window.Symbol = function (desc) { return '@@' + desc; };
  }
  var ITER = window.Symbol.iterator;
  if (!Array.prototype[ITER]) {
    Array.prototype[ITER] = function () {
      var i = 0, a = this;
      return { next: function () { return i < a.length ? { value: a[i++], done: false } : { value: undefined, done: true }; } };
    };
  }
  function same(a, b) { return a === b || (a !== a && b !== b); }

  if (!window.Map) {
    window.Map = function () { this._a = []; };
    window.Map.prototype.set = function (k, v) {
      for (var i = 0; i < this._a.length; i++) if (same(this._a[i][0], k)) { this._a[i][1] = v; return this; }
      this._a.push([k, v]); return this;
    };
    window.Map.prototype.get = function (k) { for (var i = 0; i < this._a.length; i++) if (same(this._a[i][0], k)) return this._a[i][1]; };
    window.Map.prototype.has = function (k) { for (var i = 0; i < this._a.length; i++) if (same(this._a[i][0], k)) return true; return false; };
    window.Map.prototype.delete = function (k) { for (var i = 0; i < this._a.length; i++) if (same(this._a[i][0], k)) { this._a.splice(i, 1); return true; } return false; };
    window.Map.prototype.clear = function () { this._a = []; };
    window.Map.prototype.forEach = function (f, ctx) { for (var i = 0; i < this._a.length; i++) f.call(ctx, this._a[i][1], this._a[i][0], this); };
    window.Map.prototype.values = function () { var out = []; for (var i = 0; i < this._a.length; i++) out.push(this._a[i][1]); return out[ITER](); };
    window.Map.prototype.keys = function () { var out = []; for (var i = 0; i < this._a.length; i++) out.push(this._a[i][0]); return out[ITER](); };
    window.Map.prototype.entries = function () { return this._a[ITER](); };
    window.Map.prototype[ITER] = function () { return this._a[ITER](); };
  }

  if (!window.Set) {
    window.Set = function (a) { this._a = []; if (a) for (var i = 0; i < a.length; i++) this.add(a[i]); };
    window.Set.prototype.add = function (v) { if (!this.has(v)) this._a.push(v); return this; };
    window.Set.prototype.has = function (v) { for (var i = 0; i < this._a.length; i++) if (same(this._a[i], v)) return true; return false; };
    window.Set.prototype.delete = function (v) { for (var i = 0; i < this._a.length; i++) if (same(this._a[i], v)) { this._a.splice(i, 1); return true; } return false; };
    window.Set.prototype.clear = function () { this._a = []; };
    window.Set.prototype.forEach = function (f, ctx) { for (var i = 0; i < this._a.length; i++) f.call(ctx, this._a[i], this._a[i], this); };
    window.Set.prototype.values = function () { return this._a[ITER](); };
    window.Set.prototype[ITER] = function () { return this._a[ITER](); };
  }

  if (!Object.assign) {
    Object.assign = function (t) {
      for (var i = 1; i < arguments.length; i++) {
        var s = arguments[i];
        if (!s) continue;
        for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k];
      }
      return t;
    };
  }
  if (!Array.from) {
    Array.from = function (a, f, ctx) {
      var out = [], it = a && a[ITER];
      if (it) { it = it.call(a); var r; while (!(r = it.next()).done) out.push(r.value); }
      else for (var i = 0; i < a.length; i++) out.push(a[i]);
      return f ? out.map(f, ctx) : out;
    };
  }
  if (!Array.prototype.find) {
    Array.prototype.find = function (f, ctx) { for (var i = 0; i < this.length; i++) if (f.call(ctx, this[i], i, this)) return this[i]; };
  }
  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (f, ctx) { for (var i = 0; i < this.length; i++) if (f.call(ctx, this[i], i, this)) return i; return -1; };
  }
  if (!Array.prototype.includes) {
    Array.prototype.includes = function (v) { for (var i = 0; i < this.length; i++) if (same(this[i], v)) return true; return false; };
  }
  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (f, ctx) {
      var out = [];
      for (var i = 0; i < this.length; i++) { var v = f.call(ctx, this[i], i, this); out = out.concat(v); }
      return out;
    };
  }
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (s, n) { return this.indexOf(s, n || 0) === (n || 0); };
  }
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (s, n) { var e = n === undefined ? this.length : n; return this.slice(e - s.length, e) === s; };
  }
  if (!String.prototype.repeat) {
    String.prototype.repeat = function (n) { var out = ''; for (var i = 0; i < n; i++) out += this; return out; };
  }
  if (!Math.hypot) {
    Math.hypot = function () { var s = 0; for (var i = 0; i < arguments.length; i++) s += arguments[i] * arguments[i]; return Math.sqrt(s); };
  }
  if (!window.performance) window.performance = {};
  if (!window.performance.now) window.performance.now = function () { return Date.now(); };
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (f) { return window.setTimeout(function () { f(Date.now()); }, 16); };
    window.cancelAnimationFrame = function (id) { window.clearTimeout(id); };
  }
  if (!window.matchMedia) {
    window.matchMedia = function () {
      return { matches: false, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {} };
    };
  }
  if (window.Element) {
    if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.webkitMatchesSelector || Element.prototype.msMatchesSelector;
    if (!Element.prototype.closest) {
      Element.prototype.closest = function (sel) {
        var e = this;
        while (e && e.nodeType === 1) {
          if (e.matches(sel)) return e;
          e = e.parentElement;
        }
        return null;
      };
    }
    /* TV 舞台是 1920x1080 整体缩放铺满屏幕，任何“滚动到元素”都会把画面推出屏幕。
     * 典型触发：从单单元页“换一个单元”回到 index.html#volume-x-x 时，
     * desk.js 自动打开书页弹窗并 focus 关闭按钮，4.4 忽略 preventScroll 而横向滚动。
     * 这里让 scrollIntoView 失效，并在 focus 后恢复原滚动位置。 */
    Element.prototype.scrollIntoView = function () {};
    if (window.HTMLElement && HTMLElement.prototype.focus) {
      var nativeFocus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function () {
        var x = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        try { nativeFocus.apply(this, arguments); } catch (e) {}
        try {
          window.scrollTo(x, y);
          document.documentElement.scrollLeft = x; document.documentElement.scrollTop = y;
          if (document.body) { document.body.scrollLeft = x; document.body.scrollTop = y; }
        } catch (e) {}
      };
    }
  }

  /* ---- PointerEvent 合成：原游戏用 pointerdown/move/up，4.4 只有 touch/mouse ---- */
  window.__tvPointer = function (type, target, x, y) {
    if (!target) return;
    var ev = document.createEvent('MouseEvents');
    ev.initMouseEvent(type, true, true, window, 0, 0, 0, x || 0, y || 0, false, false, false, false, 0, null);
    try { ev.pointerId = 1; ev.pointerType = 'mouse'; ev.isPrimary = true; } catch (e) {}
    target.dispatchEvent(ev);
    return ev;
  };
  window.__tvKeyEvent = function (key) {
    var ev = document.createEvent('Event');
    ev.initEvent('keydown', true, true);
    try { ev.key = key; } catch (e) {}
    document.dispatchEvent(ev);
  };
  window.__patchDialogs = function () {
    var ds = document.getElementsByTagName('dialog');
    for (var i = 0; i < ds.length; i++) {
      var d = ds[i];
      // 始终覆盖为普通 DOM 弹窗：原生 <dialog> 会进入 top layer，
      // 脱离 body 的缩放容器，导致非 1920x1080 分辨率下弹窗错位/显示不全。
      d.showModal = function () {
        this.setAttribute('open', '');
        if (this.className.indexOf('open') < 0) this.className += ' open';
      };
      d.show = d.showModal;
      d.close = function () {
        this.removeAttribute('open');
        this.className = this.className.replace(/\s+open/g, '');
        if (this.onclose) this.onclose();
      };
    }
  };

  /* ---- 触摸转 pointer：让原项目在带触摸的电视盒子上也能直接玩 ---- */
  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length) {
      var t = e.touches[0];
      window.__tvPointer('pointerdown', e.target, t.clientX, t.clientY);
    }
  }, false);
  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length) {
      var t = e.touches[0];
      window.__tvPointer('pointermove', e.target, t.clientX, t.clientY);
    }
  }, false);
  document.addEventListener('touchend', function (e) {
    var t = e.changedTouches && e.changedTouches[0];
    window.__tvPointer('pointerup', e.target, t ? t.clientX : 0, t ? t.clientY : 0);
  }, false);
})();
