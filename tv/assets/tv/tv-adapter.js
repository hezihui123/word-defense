/* 遥控器适配：方向键移动焦点、确定键点击/拖卡、返回键暂停或上层。
 * 原游戏逻辑仍由 desk.js / game.js 负责，这里只合成 pointer/key 事件。 */
(function () {
  'use strict';

  var BASE_W = 1920, BASE_H = 1080;
  var state = { focus: null, drag: null, menu: false };
  var FOCUS_SEL = 'button, a[href], .volume-book, .card, .bbtn, input, [tabindex="0"]';

  function $(id) { return document.getElementById(id); }
  function visible(el) {
    if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) return false;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.className && String(p.className).indexOf('hide') >= 0) return false;
      if (p.nodeName === 'DIALOG' && !p.hasAttribute('open')) return false;
      p = p.parentNode;
    }
    return true;
  }
  function focusables() {
    if (state.menu) {
      var mb = document.querySelectorAll('#tv-menu button');
      var out = [];
      for (var m = 0; m < mb.length; m++) if (mb[m].offsetWidth > 0) out.push(mb[m]);
      return out;
    }
    var dialog = document.querySelector('dialog[open]');
    var root = dialog || document;
    var all = root.querySelectorAll(FOCUS_SEL);
    var out = [];
    for (var i = 0; i < all.length; i++) if (visible(all[i])) out.push(all[i]);
    return out;
  }
  function setFocus(el) {
    if (state.focus && state.focus !== el) state.focus.className = state.focus.className.replace(/\s+focused/g, '');
    state.focus = el || null;
    if (el) {
      if (el.className.indexOf('focused') < 0) el.className += ' focused';
      // 不能调用 scrollIntoView：舞台已整体缩放铺满屏幕，滚动容器会把整块内容
      // 推到屏幕外，表现为弹窗/书页“显示不全”。这里只加焦点框，不滚动。
    }
  }
  function moveFocus(dx, dy) {
    var list = focusables();
    if (!list.length) return;
    if (!state.focus || list.indexOf(state.focus) < 0) { setFocus(list[0]); return; }
    var a = state.focus.getBoundingClientRect();
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var best = null, bestScore = 1e12;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el === state.focus) continue;
      var b = el.getBoundingClientRect();
      var vx = b.left + b.width / 2 - ax, vy = b.top + b.height / 2 - ay;
      var forward = dx ? vx * dx : vy * dy;
      if (forward <= 6) continue;
      var score = (dx ? Math.abs(vx) : Math.abs(vy)) + (dx ? Math.abs(vy) : Math.abs(vx)) * 4;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) setFocus(best);
  }
  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }
  /* 直接用原游戏的百分比网格反算格子中心，避免依赖 DOM 元素位置 */
  var COL0 = 7, CW = 8.8;
  function cellClient(lane, col) {
    // 与原游戏 cellAt() 完全互逆：横向按 COL0/CW 百分比，纵向把 field 四等分
    var field = $('field'), r = field.getBoundingClientRect();
    return {
      x: Math.round(r.left + (COL0 + CW * (col + 0.5)) / 100 * r.width),
      y: Math.round(r.top + r.height / 4 * (lane + 0.5))
    };
  }
  function clientToStage(c) {
    var b = document.body.getBoundingClientRect();
    var s = b.width / 1920 || 1;
    return { x: (c.x - b.left) / s, y: (c.y - b.top) / s };
  }
  function cursorEl() {
    // 预放置框必须放进了 #field，和植物同一个坐标系，才能和植物完全重合。
    var host = $('field') || document.body;
    var c = document.getElementById('tv-place-cursor');
    if (!c) {
      c = document.createElement('div');
      c.id = 'tv-place-cursor';
      // 复制原游戏 .tur 的 translate(-50%,-40%)，让框中心和植物中心完全一致。
      c.style.cssText = 'position:absolute;z-index:90;border:6px solid #ffd54f;' +
        'background:rgba(255,213,79,.22);border-radius:10px;pointer-events:none;display:none;' +
        '-webkit-transform:translate(-50%,-40%);transform:translate(-50%,-40%);' +
        '-webkit-box-sizing:border-box;box-sizing:border-box;';
      host.appendChild(c);
    } else if (c.parentNode !== host) {
      host.appendChild(c);
    }
    return c;
  }

  /* ---------- 拖卡：把原游戏的 pointer 流程完整走一遍 ---------- */
  function startDrag(card) {
    if (!card) return;
    var c = centerOf(card);
    state.drag = { card: card, lane: 0, col: 0 };
    window.__tvPointer('pointerdown', card, c.x, c.y);
    setFocus(null);
    moveDrag();
  }
  /* 统一“预览植物”和“落点框”的位置。
   * 原游戏 #ghost 是 position:fixed，位于被 body{transform:scale(s)} 缩放的容器内：
   * 游戏写入的是 client 像素，但 fixed 在 transform 容器内按舞台像素解析，s≠1 时会错行。
   * 这里在每次移动后强制用 stage 坐标改写 #ghost，使其与落点框严格重合。 */
  function placePreview(lane, col) {
    var f = $('field');
    if (!f) return;
    var W = f.clientWidth, lh = f.clientHeight / 4;
    var ts = Math.min(lh * 0.49, W * 0.075);
    var leftPct = COL0 + CW * (col + 0.5);
    var topPx = Math.round((lane + 0.59) * lh);

    // 1) 我们自己的落点框（在 #field 内，舞台坐标）
    var el = cursorEl();
    el.style.width = Math.round(ts) + 'px';
    el.style.height = Math.round(ts * 1.2) + 'px';
    el.style.left = leftPct + '%';
    el.style.top = topPx + 'px';
    el.style.display = 'block';

    // 2) 原游戏的拖动预览植物 #ghost：改成 field 内的绝对定位，舞台坐标，
    //    并直接复用 plantAt()+tur 的公式与 translate(-50%,-40%)，彻底消除错行。
    var g = $('ghost');
    if (g && String(g.className).indexOf('hide') < 0) {
      if (g.parentNode !== f) f.appendChild(g);
      g.style.position = 'absolute';
      g.style.left = leftPct + '%';
      g.style.top = topPx + 'px';
      g.style.webkitTransform = 'translate(-50%,-40%)';
      g.style.transform = 'translate(-50%,-40%)';
    }
  }
  function moveDrag() {
    if (!state.drag) return;
    var lane = state.drag.lane, col = state.drag.col;

    // 合成事件坐标固定在格子中心，与原游戏 cellAt() 互逆，决定植物真正落在哪一格。
    var c = cellClient(lane, col);
    window.__tvPointer('pointermove', document, c.x, c.y);

    // 预览与落点框统一到舞台坐标，保证“框在哪植物就在哪”。
    placePreview(lane, col);
  }
  function dropDrag() {
    if (!state.drag) return;
    var c = cellClient(state.drag.lane, state.drag.col);
    window.__tvPointer('pointerup', document, c.x, c.y);
    cursorEl().style.display = 'none';
    state.drag = null;
    refreshFocus();
  }
  function cancelDrag() {
    if (!state.drag) return;
    window.__tvKeyEvent('Escape');
    cursorEl().style.display = 'none';
    state.drag = null;
    refreshFocus();
  }
  function dragKey(k) {
    if (k === 'back') { cancelDrag(); return true; }
    if (k === 'enter') { dropDrag(); return true; }
    if (k === 'left') state.drag.col = Math.max(0, state.drag.col - 1);
    else if (k === 'right') state.drag.col = Math.min(7, state.drag.col + 1);
    else if (k === 'up') state.drag.lane = Math.max(0, state.drag.lane - 1);
    else if (k === 'down') state.drag.lane = Math.min(3, state.drag.lane + 1);
    moveDrag();
    return true;
  }
  function isBeltCard(el) {
    return !!(el && el.className && String(el.className).indexOf('card') >= 0 && el.parentNode === $('belt'));
  }
  function refreshFocus() {
    var list = focusables();
    if (list.length && (state.focus === null || list.indexOf(state.focus) < 0)) setFocus(list[0]);
    else if (!list.length) setFocus(null);
  }

  /* ---------- 舞台缩放 ---------- */
  function fit() {
    var w = document.documentElement.clientWidth || window.innerWidth || BASE_W;
    var h = document.documentElement.clientHeight || window.innerHeight || BASE_H;
    var s = Math.min(w / BASE_W, h / BASE_H);
    document.body.style.webkitTransform = 'scale(' + s + ')';
    document.body.style.transform = 'scale(' + s + ')';
    document.body.style.left = Math.floor((w - BASE_W * s) / 2) + 'px';
    document.body.style.top = Math.floor((h - BASE_H * s) / 2) + 'px';
    // 兜底：hash 导航或 focus 若产生了滚动，强制回到左上角，保证整本书一屏显示。
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollLeft = 0; document.documentElement.scrollTop = 0;
      if (document.body) { document.body.scrollLeft = 0; document.body.scrollTop = 0; }
    } catch (e) {}
  }
  window.onresize = fit;
  fit();
  // 有些 WebView 在 focus 之后才完成滚动，延迟再校正一次。
  window.setTimeout(fit, 120);

  /* ---------- 返回键菜单：暂停 / 继续 / 退出 ---------- */
  function menuButtons() {
    var m = document.getElementById('tv-menu');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tv-menu';
      m.className = 'tv-menu';
      m.innerHTML = '<div class="panel"><h3>游戏菜单</h3>' +
        '<button type="button" data-act="pause">暂停</button>' +
        '<button type="button" data-act="resume">继续</button>' +
        '<button type="button" data-act="quit">退出</button></div>';
      document.body.appendChild(m);
      var bs = m.getElementsByTagName('button');
      bs[0].onclick = function () { closeMenu(); var p = $('pause'); if (p) p.click(); };
      bs[1].onclick = function () {
        closeMenu();
        // 已是暂停状态时再点一次隐藏的暂停按钮，真正恢复游戏。
        var g = $('game');
        if (g && String(g.className).indexOf('paused') >= 0) {
          var p = $('pause'); if (p) p.click();
        }
      };
      bs[2].onclick = function () { window.location.href = 'index.html'; };
    }
    return m;
  }
  function openMenu() {
    if (state.drag) cancelDrag();
    state.menu = true;
    var m = menuButtons();
    m.className = 'tv-menu on';
    setFocus(null);
    refreshFocus();
  }
  function closeMenu() {
    state.menu = false;
    var m = document.getElementById('tv-menu');
    if (m) m.className = 'tv-menu';
    refreshFocus();
  }

  /* ---------- 主界面“关于”弹窗 ---------- */
  function initAbout() {
    var btn = document.getElementById('about-btn');
    var dlg = document.getElementById('about-dialog');
    if (!btn || !dlg) return;
    if (window.__patchDialogs) window.__patchDialogs();
    btn.onclick = function () {
      dlg.showModal();
      refreshFocus();
    };
    var close = dlg.querySelector('.about-close');
    if (close) close.onclick = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      dlg.close();
      refreshFocus();
    };
  }

  /* ---------- 对外入口：TvActivity 调用 ---------- */
  // 认读弹窗翻页后重设焦点到本页第一个可选项
  window.tvRefreshFocus = function () {
    state.focus = null;
    refreshFocus();
  };
  window.tvKey = function (k) {
    if (window.__patchDialogs) window.__patchDialogs();
    if (state.drag) return dragKey(k);

    if (state.menu) {
      if (k === 'back') { closeMenu(); return true; }
      // 菜单按钮竖排：用索引循环切换，不依赖坐标计算，遥控器必然能选中。
      var mb = focusables();
      if (!mb.length) return true;
      var idx = state.focus ? mb.indexOf(state.focus) : -1;
      if (k === 'enter') {
        if (idx < 0) idx = 0;
        setFocus(mb[idx]);
        if (mb[idx].click) mb[idx].click();
        return true;
      }
      if (k === 'up' || k === 'left') idx = (idx <= 0 ? mb.length - 1 : idx - 1);
      else if (k === 'down' || k === 'right') idx = (idx + 1) % mb.length;
      else return true;
      setFocus(mb[idx]);
      return true;
    }

    if (k === 'back') {
      var game = $('game'), home = $('home');
      if (game && home && home.className.match(/\bhide\b/) && !game.className.match(/\bhide\b/)) {
        openMenu();
        return true;
      }
      var dialog = document.querySelector('dialog[open]');
      if (dialog) { if (dialog.close) dialog.close(); refreshFocus(); return true; }
      return false;
    }

    // 选中传送带卡片后，只有按确定键才拿起植物进入落点模式；
    // 上/下键只用于在卡片间移动焦点，不会再误触进入放置状态。
    if (k === 'enter') {
      if (!state.focus) refreshFocus();
      if (!state.focus) return true;
      if (isBeltCard(state.focus)) {
        startDrag(state.focus);
      } else if (state.focus.click) {
        state.focus.click();
        refreshFocus();
      }
      return true;
    }

    moveFocus(k === 'left' ? -1 : (k === 'right' ? 1 : 0), k === 'up' ? -1 : (k === 'down' ? 1 : 0));
    return true;
  };

  window.setTimeout(function () {
    window.__patchDialogs && window.__patchDialogs();
    initAbout();
    fit();
    refreshFocus();
  }, 0);
})();
