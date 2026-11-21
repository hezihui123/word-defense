/* 单词保卫战 TV 版：仅使用 ES5 / DOM Level 2 / CSS2，兼容 Android 4.4 WebView。
 * 遥控器：方向键移动金色焦点，确定键确认，返回键上层/暂停。 */
(function () {
  'use strict';

  var BOOKS = window.BOOKS || [];
  var AUDIO = window.WT_AUDIO || {};
  var ICONS = window.wordIcons || {};
  var stage = document.getElementById('stage');
  var WAVES = [3, 5, 7, 9];
  var CROSS = [26, 19, 14];
  var CELL_W = 182;
  var COL0 = 340;
  var LANE_H = 190;
  var FIELD_LEFT = 340;
  var FIELD_SPAN = 1430; // 100% 时怪物刚好完整出现在屏幕右边缘内

  function $(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function keyOf(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_'); }
  function groupOf(w) { return String(w.same || w.id || w.w).toLowerCase(); }

  /* ---------- 1920x1080 固定舞台缩放 ---------- */
  function fit() {
    var w = document.documentElement.clientWidth || window.innerWidth || 1920;
    var h = document.documentElement.clientHeight || window.innerHeight || 1080;
    var s = Math.min(w / 1920, h / 1080);
    stage.style.webkitTransform = 'scale(' + s + ')';
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = Math.floor((w - 1920 * s) / 2) + 'px';
    stage.style.top = Math.floor((h - 1080 * s) / 2) + 'px';
  }
  fit();
  window.onresize = fit;

  /* ---------- 存档 ---------- */
  var save = { speed: 1, best: {} };
  try {
    var raw = window.localStorage.getItem('word-defense-tv');
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.speed === 'number') save.speed = clamp(parsed.speed, 0, 2);
        if (parsed.best && typeof parsed.best === 'object') save.best = parsed.best;
      }
    }
  } catch (e) {}
  function persist() { try { window.localStorage.setItem('word-defense-tv', JSON.stringify(save)); } catch (e) {} }

  /* ---------- 声音与图片 ---------- */
  var ac = null;
  function tone(f1, f2, dur, type, vol, delay) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (!ac) return;
      var t = ac.currentTime + (delay || 0);
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f1, t);
      o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(vol || 0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  function sfx(kind) {
    if (kind === 'plant') tone(200, 420, 0.12, 'triangle', 0.12);
    else if (kind === 'shoot') tone(380, 760, 0.07, 'triangle', 0.05);
    else if (kind === 'hit') tone(880, 1320, 0.10, 'sine', 0.12);
    else if (kind === 'bad') tone(180, 130, 0.12, 'square', 0.07);
    else if (kind === 'kill') tone(700, 200, 0.22, 'square', 0.06);
    else if (kind === 'win') { tone(523, 523, 0.18, 'triangle', 0.12, 0); tone(659, 659, 0.18, 'triangle', 0.12, 0.14); tone(784, 784, 0.28, 'triangle', 0.12, 0.28); }
    else if (kind === 'lose') { tone(392, 300, 0.30, 'triangle', 0.12, 0); tone(300, 220, 0.36, 'triangle', 0.12, 0.24); }
  }
  function playKey(key) {
    if (!key || !AUDIO[key]) return;
    try {
      var a = new Audio('audio/' + key + '.mp3');
      a.volume = 0.95;
      a.play();
    } catch (e) {}
  }
  function sayWord(w) { if (w) playKey('w-' + keyOf(w.w)); }
  function sayPhrase(k) { playKey('p-' + k); }

  function picHTML(pic) {
    if (pic.indexOf('color:') === 0) {
      return '<div style="width:100%;height:100%;background:' + pic.slice(6) + '"></div>';
    }
    if (pic.indexOf('num:') === 0) {
      return '<div style="width:100%;height:100%;text-align:center;font-size:78px;line-height:110px;color:#1b5e20;font-weight:bold">' + parseInt(pic.slice(4), 10) + '</div>';
    }
    return '<div class="emo" style="width:100%;height:100%;text-align:center;font-size:74px;line-height:110px">' + esc(pic) + '</div>';
  }
  function wordIcon(w) {
    var id = String(w.id || w.w || '').toLowerCase();
    var icon = ICONS[id] || w.pic || '?';
    if (String(icon).indexOf('<svg') === 0) return icon;
    return picHTML(String(icon));
  }

  /* ---------- 通用焦点导航 ---------- */
  var state = {
    screen: 'home', focus: null, list: [], backTo: 'home',
    book: 0, unit: null, selected: 0, placing: false,
    place: { lane: 0, col: 0 }, shovel: false, overlay: false, ovList: []
  };

  function visible(el) {
    if (!el || el.offsetWidth === 0 || el.offsetHeight === 0) return false;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.className && String(p.className).indexOf('hide') >= 0) return false;
      p = p.parentNode;
    }
    return true;
  }
  function collect(screen) {
    var root = $(screen);
    var all = root.getElementsByTagName('*');
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].className && String(all[i].className).indexOf('focusable') >= 0 && visible(all[i])) out.push(all[i]);
    }
    return out;
  }
  function setFocus(el) {
    if (state.focus && state.focus !== el) state.focus.className = state.focus.className.replace(/\s+focused/g, '');
    state.focus = el || null;
    if (el) {
      if (el.className.indexOf('focused') < 0) el.className += ' focused';
      try { el.scrollIntoView(false); } catch (e) {}
    }
  }
  function moveFocus(dx, dy) {
    if (!state.focus || !state.list.length) { if (state.list.length) setFocus(state.list[0]); return; }
    var a = state.focus.getBoundingClientRect();
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var best = null, bestScore = 1e12;
    for (var i = 0; i < state.list.length; i++) {
      var el = state.list[i];
      if (el === state.focus) continue;
      var b = el.getBoundingClientRect();
      var bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var vx = bx - ax, vy = by - ay;
      var forward = dx ? vx * dx : vy * dy;
      if (forward <= 6) continue;
      var primary = dx ? Math.abs(vx) : Math.abs(vy);
      var cross = dx ? Math.abs(vy) : Math.abs(vx);
      var score = primary + cross * 4;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) setFocus(best);
  }
  function refreshFocus() {
    state.list = state.overlay ? state.ovList : collect('screen-' + state.screen);
    if (!state.focus || state.list.indexOf(state.focus) < 0) setFocus(state.list.length ? state.list[0] : null);
  }
  function enter() {
    if (!state.focus) return;
    if (state.focus.onclick) state.focus.onclick();
  }

  /* ---------- 屏幕切换 ---------- */
  function show(name) {
    state.screen = name;
    var screens = document.getElementsByTagName('div');
    for (var i = 0; i < screens.length; i++) {
      if (screens[i].className && String(screens[i].className).indexOf('screen') >= 0 && screens[i].id.indexOf('screen-') === 0) {
        screens[i].className = 'screen' + (screens[i].id === 'screen-' + name ? ' on' : '');
      }
    }
    state.focus = null;
    if (name === 'home') renderBooks();
    else if (name === 'units') renderUnits();
    else if (name === 'mode') renderMode();
    else if (name === 'learn') renderLearn();
    refreshFocus();
  }

  /* ---------- 弹层 ---------- */
  function openOverlay(title, msg, b1, b2, f1, f2) {
    state.overlay = true;
    $('ov-title').textContent = title;
    $('ov-msg').innerHTML = msg;
    $('ov-b1').textContent = b1;
    $('ov-b2').textContent = b2;
    $('ov-b1').onclick = f1;
    $('ov-b2').onclick = f2;
    $('ov-b2').className = 'btn blue focusable b2';
    state.focus = null;
    $('overlay').className = 'on';
    state.ovList = [$('ov-b1'), $('ov-b2')];
    setFocus($('ov-b1'));
  }
  function closeOverlay() {
    state.overlay = false;
    $('overlay').className = '';
    state.ovList = [];
    refreshFocus();
  }
  function overlayKey(k) {
    if (k === 'back') { closeOverlay(); return true; }
    if (k === 'enter') { enter(); return true; }
    if (k === 'left' || k === 'right') {
      setFocus(state.focus === $('ov-b1') ? $('ov-b2') : $('ov-b1'));
      return true;
    }
    if (k === 'up' || k === 'down') moveFocus(0, k === 'up' ? -1 : 1);
    return true;
  }

  /* ---------- 首页：课本 ---------- */
  function renderBooks() {
    var box = $('books');
    box.innerHTML = '';
    for (var i = 0; i < BOOKS.length; i++) {
      var d = document.createElement('div');
      d.className = 'card book focusable';
      d.style.left = (60 + (i % 4) * 460) + 'px';
      d.style.top = (190 + Math.floor(i / 4) * 260) + 'px';
      d.style.width = '420px';
      d.style.height = '190px';
      var grade = ['三', '四', '五', '六'][Math.floor(i / 2)];
      d.innerHTML = '<div class="cover"><span>' + grade + '</span></div>' +
        '<div class="info"><b>' + esc(BOOKS[i].name) + '</b><i>' + esc(BOOKS[i].note || ('共 ' + BOOKS[i].units.length + ' 个单元')) + '</i></div>';
      (function (idx) { d.onclick = function () { state.book = idx; state.unit = null; show('units'); }; })(i);
      box.appendChild(d);
    }
    // 跨 8 册超级大混战：全部 952 词 / 46 单元
    var mega = document.createElement('div');
    mega.className = 'card book focusable';
    mega.style.left = '750px';
    mega.style.top = '700px';
    mega.style.width = '420px';
    mega.style.height = '160px';
    mega.innerHTML = '<div class="cover"><span>★</span></div><div class="info"><b>8册超级大混战</b><i>跨年级 · 46 单元 · 952 词全收录</i></div>';
    mega.onclick = function () { state.book = -1; state.unit = 'mega'; state.backTo = 'home'; show('mode'); };
    box.appendChild(mega);
  }

  /* ---------- 单元选择 ---------- */
  function unitKey(u) { return state.unit === 'mega' ? 'wd_mega' : ('wd_' + state.book + '_' + u); }
  function bookName() { return state.book === -1 ? '全 8 册' : BOOKS[state.book].name; }
  function exitToLevelList() { show(state.unit === 'mega' ? 'home' : 'units'); }
  function stars(u) { return parseInt(save.best[unitKey(u)] || '0', 10) || 0; }
  function renderUnits() {
    var book = BOOKS[state.book];
    $('units-title').textContent = book.name + ' · 选择单元';
    var box = $('units');
    box.innerHTML = '';
    var items = [];
    for (var i = 0; i < book.units.length; i++) items.push({ id: 'u' + book.units[i].no, u: book.units[i] });
    items.push({ id: 'all', u: { no: '★', en: 'All units', zh: '全册大混战', words: allWords(book) } });
    for (var j = 0; j < items.length; j++) {
      (function (item, n) {
        var d = document.createElement('div');
        d.className = 'card unit focusable';
        d.style.left = (60 + (n % 4) * 460) + 'px';
        d.style.top = (170 + Math.floor(n / 4) * 270) + 'px';
        d.style.width = '420px';
        d.style.height = '210px';
        var st = stars(item.id);
        var star = '';
        for (var s = 0; s < 3; s++) star += (s < st ? '★' : '☆');
        d.innerHTML = '<div class="no">' + item.u.no + '</div><div class="nm">' + esc(item.u.en) +
          '</div><div class="zh">' + esc(item.u.zh) + ' · ' + item.u.words.length + ' 词</div><div class="st">' + star + '</div>';
        d.onclick = function () { state.unit = item.id; show('mode'); };
        box.appendChild(d);
      })(items[j], j);
    }
  }
  function allWords(book) {
    var out = [];
    for (var i = 0; i < book.units.length; i++) out = out.concat(book.units[i].words);
    return out;
  }
  function allMegaWords() {
    var out = [];
    for (var b = 0; b < BOOKS.length; b++) out = out.concat(allWords(BOOKS[b]));
    return out;
  }
  function currentUnit() {
    if (state.unit === 'mega') return { no: '★', en: '8-Book Mega Battle', zh: '跨 8 册超级大混战', words: allMegaWords() };
    var book = BOOKS[state.book];
    if (state.unit === 'all') return { no: '★', en: 'All units', zh: '全册大混战', words: allWords(book) };
    for (var i = 0; i < book.units.length; i++) {
      if ('u' + book.units[i].no === state.unit) return book.units[i];
    }
    return book.units[0];
  }

  /* ---------- 认读 ---------- */
  function learnList() {
    return currentUnit().words;
  }
  function renderMode() {
    var u = currentUnit();
    var battle = 0;
    for (var i = 0; i < u.words.length; i++) if (!u.words[i].learnOnly) battle++;
    $('mode-title').textContent = bookName() + ' · ' + (state.unit === 'mega' ? '超级大混战' : (state.unit === 'all' ? '全册大混战' : 'Unit ' + u.no));
    $('mode-name').textContent = u.en;
    $('mode-info').textContent = u.zh + ' · 共 ' + u.words.length + ' 个单词（对战 ' + battle + ' 个 · 认读 ' + (u.words.length - battle) + ' 个，可翻页查看全部）';
    $('btn-learn').onclick = function () { state.backTo = 'mode'; show('learn'); };
    $('btn-play').onclick = function () { startGame(u); };
  }
  function learnPageCount() { return Math.max(1, Math.ceil(state.learnWords.length / 24)); }
  function buildLearnPage() {
    var words = state.learnWords;
    var start = state.learnPage * 24;
    var end = Math.min(start + 24, words.length);
    $('learn-grid').innerHTML = '';
    state.focus = null;
    for (var i = start; i < end; i++) {
      (function (idx, pos) {
        var d = document.createElement('div');
        d.className = 'wordcell focusable';
        d.style.left = (620 + (pos % 8) * 158) + 'px';
        d.style.top = (490 + Math.floor(pos / 8) * 82) + 'px';
        d.style.width = '148px';
        d.style.height = '66px';
        d.textContent = words[idx].w;
        d.onclick = function () { showLearnWord(idx); refreshFocus(); };
        $('learn-grid').appendChild(d);
      })(i, i - start);
    }
    $('learn-page').textContent = '第 ' + (state.learnPage + 1) + ' / ' + learnPageCount() + ' 页 · 本词表共 ' + words.length + ' 词';
    $('learn-prev').onclick = function () {
      if (state.learnPage > 0) { state.learnPage--; buildLearnPage(); refreshFocus(); }
    };
    $('learn-next').onclick = function () {
      if (state.learnPage < learnPageCount() - 1) { state.learnPage++; buildLearnPage(); refreshFocus(); }
    };
    showLearnWord(start);
  }
  function renderLearn() {
    state.learnWords = learnList();
    state.learnPage = 0;
    $('learn-play').onclick = function () { if (state.learnIndex >= 0) sayWord(state.learnWords[state.learnIndex]); };
    buildLearnPage();
    refreshFocus();
  }
  function showLearnWord(i) {
    if (!state.learnWords || !state.learnWords[i]) return;
    state.learnIndex = i;
    var w = state.learnWords[i];
    $('learn-pic').innerHTML = wordIcon(w);
    $('learn-word').innerHTML = esc(w.w) + '<small>' + esc(w.zh || '') + '</small>';
    sayWord(w);
  }

  /* ---------- 游戏画面 ---------- */
  var G = null;
  function cellX(c) { return COL0 + c * CELL_W; }
  function laneY(l) { return l * LANE_H; }
  function monX(pct) { return FIELD_LEFT + pct / 100 * FIELD_SPAN; }
  function banner(text, ms) {
    var b = $('banner');
    b.textContent = text;
    b.style.display = 'block';
    if (banner.timer) clearTimeout(banner.timer);
    banner.timer = setTimeout(function () { b.style.display = 'none'; }, ms || 1200);
  }
  function buildField() {
    var f = $('field');
    f.innerHTML = '<div id="banner"></div>';
    for (var l = 0; l < 4; l++) {
      var lane = document.createElement('div');
      lane.className = 'lane';
      lane.style.top = (l * LANE_H) + 'px';
      for (var c = 0; c < 8; c++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.left = (cellX(c) + 4) + 'px';
        cell.style.top = '28px';
        lane.appendChild(cell);
      }
      var cart = document.createElement('div');
      cart.className = 'cart';
      cart.id = 'cart' + l;
      cart.style.top = (l * LANE_H + 34) + 'px';
      cart.textContent = '小车';
      lane.appendChild(cart);
      f.appendChild(lane);
    }
  }
  function shuffleBag() {
    G.bag = G.words.slice();
    for (var i = G.bag.length - 1; i > 0; i--) {
      var j = rnd(i + 1), t = G.bag[i];
      G.bag[i] = G.bag[j]; G.bag[j] = t;
    }
  }
  function pickBattleWord(used) {
    for (var tries = 0; tries < 2; tries++) {
      if (!G.bag.length) shuffleBag();
      for (var i = 0; i < G.bag.length; i++) {
        if (!used[groupOf(G.bag[i])]) return G.bag.splice(i, 1)[0];
      }
      G.bag = [];
    }
    return G.words[rnd(G.words.length)];
  }
  function makeCard() {
    var used = {}, i;
    for (i = 0; i < G.cards.length; i++) if (G.cards[i] && G.cards[i].word) used[groupOf(G.cards[i].word)] = 1;
    for (i = 0; i < G.monsters.length; i++) used[groupOf(G.monsters[i].word)] = 1;
    // 优先给场上僵尸需要的词，同时避开已经出现在传送带/场上的同图组
    if (G.activeWords.length && Math.random() < 0.35) {
      var need = [];
      for (i = 0; i < G.activeWords.length; i++) {
        if (!used[groupOf(G.activeWords[i])]) need.push(G.activeWords[i]);
      }
      if (need.length) return need[rnd(need.length)];
    }
    var avail = [];
    for (i = 0; i < G.words.length; i++) if (!used[groupOf(G.words[i])]) avail.push(G.words[i]);
    return (avail.length ? avail : G.words)[rnd(avail.length ? avail.length : G.words.length)];
  }
  function renderCard(i, forced) {
    var item = G.cards[i];
    if (!item || !item.el) return;
    item.word = forced || makeCard();
    item.el.innerHTML = '<div class="cardicon">' + wordIcon(item.word) + '</div><div class="cw">' + esc(item.word.w) + '</div>';
  }
  function setCardWord(i, w) {
    if (!G || !G.cards[i]) return;
    G.cards[i].word = w;
    renderCard(i, w);
  }
  // 场上每只僵尸的单词，传送带上至少保证有一张对应卡，否则玩家无法应对
  function ensureBeltCovers() {
    if (!G || !G.monsters.length || !G.cards.length) return;
    var beltGroups = {}, i, j, k;
    for (i = 0; i < G.cards.length; i++) {
      if (G.cards[i] && G.cards[i].word) beltGroups[groupOf(G.cards[i].word)] = 1;
    }
    var order = G.monsters.slice().sort(function (a, b) { return a.pct - b.pct; });
    for (i = 0; i < order.length; i++) {
      var g = groupOf(order[i].word);
      if (beltGroups[g]) continue;
      var idx = -1;
      for (j = 0; j < G.cards.length; j++) {
        var cg = groupOf(G.cards[j].word);
        var needed = false;
        for (k = 0; k < G.monsters.length; k++) {
          if (groupOf(G.monsters[k].word) === cg) { needed = true; break; }
        }
        if (!needed) { idx = j; break; }
      }
      if (idx < 0) {
        // 超过 5 只僵尸时，替换掉最靠右（最不紧急）那只的卡
        var worst = -1, worstPct = -1;
        for (j = 0; j < G.cards.length; j++) {
          var cg2 = groupOf(G.cards[j].word), p2 = -1;
          for (k = 0; k < G.monsters.length; k++) {
            if (groupOf(G.monsters[k].word) === cg2 && G.monsters[k].pct > p2) p2 = G.monsters[k].pct;
          }
          if (p2 > worstPct) { worstPct = p2; worst = j; }
        }
        idx = worst >= 0 ? worst : G.cards.length - 1;
      }
      setCardWord(idx, order[i].word);
      beltGroups[g] = 1;
    }
    if (window.__beltDebug) window.__beltDebug.push({ m: G.monsters.map(function (x) { return x.word.w; }), c: G.cards.map(function (x) { return x.word.w; }) });
  }
  function updateTargets() {
    if (!G) return;
    var words = [];
    for (var i = 0; i < G.monsters.length; i++) words.push(G.monsters[i].word.w);
    $('game-targets').textContent = words.length ? ('场上目标：' + words.join('   ')) : '场上目标：等待僵尸出现…';
  }
  function buildBelt() {
    var belt = $('belt');
    var label = belt.getElementsByTagName('div')[0];
    belt.innerHTML = '';
    belt.appendChild(label);
    G.cards = [];
    for (var i = 0; i < 5; i++) {
      var d = document.createElement('div');
      d.className = 'carditem focusable';
      d.style.left = (250 + i * 290) + 'px';
      (function (idx, el) {
        el.onclick = function () {
          state.selected = idx;
          refreshFocus();
          setFocus(el);
          sayWord(G.cards[idx].word);
        };
      })(i, d);
      belt.appendChild(d);
      G.cards.push({ el: d, word: null });
      renderCard(i);
    }
  }
  function startGame(unit) {
    // 与原网页版一致：对战词库取全部非认读词，同图不同词（mum/mother）都保留，
    // 只在同屏出现时按 group 避让，不全局删除。
    var pool = [];
    var words = unit.words;
    for (var i = 0; i < words.length; i++) if (!words[i].learnOnly) pool.push(words[i]);
    if (!pool.length) pool = words.slice(0, 4);
    G = {
      unit: unit, words: pool, bag: [], activeWords: [], wave: 0, spawnLeft: WAVES[0], spawnTimer: 2.0,
      waveGap: 0, monsters: [], plants: [], peas: [], carts: [1, 1, 1, 1], kills: 0,
      mistakes: 0, time: 0, over: false, paused: false, last: 0, cards: [], beltTick: 1
    };
    state.placing = false;
    state.shovel = false;
    state.selected = 0;
    $('placement').className = '';
    $('btn-shovel').className = 'btn orange focusable btnbar shovel';
    $('game-title').textContent = bookName() + ' · ' + (state.unit === 'mega' ? '超级大混战' : (state.unit === 'all' ? '全册大混战' : 'Unit ' + unit.no + ' ' + unit.en));
    updateBar();
    buildField();
    buildBelt();
    updateTargets();
    show('game');
    state.focus = null;
    refreshFocus();
    setFocus(G.cards[0].el);
    sayPhrase('go');
    G.last = 0;
    requestAnimationFrame(loop);
  }
  function updateBar() {
    if (!G) return;
    $('game-wave').textContent = '第 ' + (G.wave + 1) + ' / 4 波 · 击倒 ' + G.kills;
    var n = 0;
    for (var i = 0; i < 4; i++) n += G.carts[i];
    $('game-cart').textContent = '小车 ' + n + ' / 4';
    for (var j = 0; j < 4; j++) {
      var c = $('cart' + j);
      if (c) c.className = G.carts[j] ? 'cart' : 'cart used';
    }
  }
  function spawn() {
    var used = {};
    for (var k = 0; k < G.monsters.length; k++) used[groupOf(G.monsters[k].word)] = 1;
    var w = pickBattleWord(used);
    var lane = rnd(4);
    var d = document.createElement('div');
    d.className = 'monster';
    var icon = wordIcon(w);
    d.innerHTML = '<div class="art">' + icon + '</div><div class="word">' + esc(w.w) + '</div>';
    $('field').appendChild(d);
    var m = {
      word: w, lane: lane, pct: 100, hp: 2, rage: 0, el: d,
      speed: 100 / CROSS[save.speed] * (1 + G.wave * 0.10)
    };
    G.monsters.push(m);
    G.activeWords.push(w);
    placeMonster(m);
    ensureBeltCovers();
    updateTargets();
  }
  function placeMonster(m) {
    m.el.style.left = Math.round(monX(m.pct)) + 'px';
    m.el.style.top = (laneY(m.lane) + 8) + 'px';
  }
  function plantAt(lane, col) {
    var occupied = false;
    for (var i = 0; i < G.plants.length; i++) {
      if (G.plants[i].lane === lane && G.plants[i].col === col) { occupied = true; break; }
    }
    if (occupied) { banner('这里已经有植物了'); return; }
    var card = G.cards[state.selected];
    if (!card || !card.word) return;
    if (state.shovel) {
      for (var j = 0; j < G.plants.length; j++) {
        if (G.plants[j].lane === lane && G.plants[j].col === col) {
          var el = G.plants[j].el;
          if (el && el.parentNode) el.parentNode.removeChild(el);
          G.plants.splice(j, 1);
          sfx('bad');
          break;
        }
      }
    } else {
      var d = document.createElement('div');
      d.className = 'plant';
      d.innerHTML = wordIcon(card.word) + '<div class="word">' + esc(card.word.w) + '</div>';
      d.style.left = (cellX(col) + 2) + 'px';
      d.style.top = (laneY(lane) + 22) + 'px';
      $('field').appendChild(d);
      G.plants.push({ word: card.word, lane: lane, col: col, x: cellX(col), el: d, cd: 0.8 });
      sfx('plant');
      sayWord(card.word);
      renderCard(state.selected);
      ensureBeltCovers();
    }
    state.placing = false;
    $('placement').className = '';
    refreshFocus();
    setFocus(G.cards[state.selected].el);
  }
  function removeMonster(m) {
    if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
    var i = G.monsters.indexOf(m);
    if (i >= 0) G.monsters.splice(i, 1);
    i = G.activeWords.indexOf(m.word);
    if (i >= 0) G.activeWords.splice(i, 1);
    updateTargets();
  }
  function fire(p) {
    var target = null, best = 1e9;
    for (var i = 0; i < G.monsters.length; i++) {
      var m = G.monsters[i];
      if (m.lane !== p.lane) continue;
      var mx = monX(m.pct);
      if (mx < p.x - 20 || mx > p.x + 760) continue;
      if (mx < best) { best = mx; target = m; }
    }
    if (!target) return;
    var d = document.createElement('div');
    d.className = 'pea';
    d.style.left = (p.x + 86) + 'px';
    d.style.top = (laneY(p.lane) + 92) + 'px';
    $('field').appendChild(d);
    G.peas.push({ el: d, x: p.x + 86, lane: p.lane, word: p.word });
    sfx('shoot');
  }
  function removePea(p) {
    if (p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
    var i = G.peas.indexOf(p);
    if (i >= 0) G.peas.splice(i, 1);
  }
  function fx(x, y, text) {
    var d = document.createElement('div');
    d.className = 'fx';
    d.textContent = text;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    $('field').appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 800);
  }
  function hit(m, p) {
    if (m.word.w.toLowerCase() === p.word.w.toLowerCase()) {
      m.hp--;
      sfx(m.hp <= 0 ? 'kill' : 'hit');
      if (m.hp <= 0) {
        G.kills++;
        fx(monX(m.pct) - 20, laneY(m.lane) + 40, '打倒!');
        removeMonster(m);
        updateBar();
      } else {
        fx(monX(m.pct) - 20, laneY(m.lane) + 40, '命中!');
      }
    } else {
      m.rage = 2;
      m.el.className = 'monster rage';
      G.mistakes++;
      sfx('bad');
      fx(monX(m.pct) - 20, laneY(m.lane) + 40, '错词! 加速');
    }
    removePea(p);
  }
  function breach(m) {
    if (G.carts[m.lane]) {
      G.carts[m.lane] = 0;
      sfx('bad');
      banner('第 ' + (m.lane + 1) + ' 行小车救急！', 1500);
      removeMonster(m);
      updateBar();
    } else {
      removeMonster(m);
      endGame(false);
    }
  }
  function step(dt) {
    G.time += dt;
    var i, j;
    G.beltTick -= dt;
    if (G.beltTick <= 0) { G.beltTick = 1.0; ensureBeltCovers(); }
    if (G.spawnLeft > 0) {
      G.spawnTimer -= dt;
      if (G.spawnTimer <= 0) {
        spawn();
        G.spawnLeft--;
        G.spawnTimer = [3.4, 2.7, 2.1][save.speed] * (1 - G.wave * 0.08);
      }
    }
    for (i = G.monsters.length - 1; i >= 0; i--) {
      var m = G.monsters[i];
      if (m.rage > 0) m.rage -= dt;
      else if (m.el.className.indexOf('rage') >= 0) m.el.className = 'monster';
      m.pct -= m.speed * (m.rage > 0 ? 1.8 : 1) * dt;
      if (m.pct <= -2) { breach(m); if (G.over) return; continue; }
      placeMonster(m);
    }
    for (i = 0; i < G.plants.length; i++) {
      var p = G.plants[i];
      p.cd -= dt;
      if (p.cd <= 0) { fire(p); p.cd = 1.5; }
    }
    for (i = G.peas.length - 1; i >= 0; i--) {
      var q = G.peas[i];
      q.x += 520 * dt;
      q.el.style.left = Math.round(q.x) + 'px';
      var eaten = false;
      for (j = 0; j < G.monsters.length; j++) {
        var t = G.monsters[j];
        if (t.lane !== q.lane) continue;
        if (Math.abs(monX(t.pct) - q.x) < 42) { hit(t, q); eaten = true; break; }
      }
      if (!eaten && q.x > 1950) removePea(q);
    }
    if (G.spawnLeft === 0 && G.monsters.length === 0) {
      G.waveGap += dt;
      if (G.waveGap > 1.0) {
        G.waveGap = 0;
        if (G.wave < 3) {
          G.wave++;
          G.spawnLeft = WAVES[G.wave];
          G.spawnTimer = 1.0;
          banner('第 ' + (G.wave + 1) + ' 波来了！', 1400);
        } else endGame(true);
      }
    }
  }
  var loop = function (now) {
    if (!G || G.over) return;
    if (!G.last) G.last = now;
    var dt = Math.min((now - G.last) / 1000, 0.05);
    G.last = now;
    if (!G.paused && !state.overlay) step(dt);
    requestAnimationFrame(loop);
  };
  function endGame(won) {
    if (G.over) return;
    G.over = true;
    var u = G.unit;
    var key = unitKey(state.unit);
    var starsN = won ? (G.mistakes === 0 && G.carts[0] + G.carts[1] + G.carts[2] + G.carts[3] === 4 ? 3 : (G.mistakes <= 3 ? 2 : 1)) : 0;
    if (starsN > stars(state.unit)) { save.best[key] = starsN; persist(); }
    sfx(won ? 'win' : 'lose');
    var star = '';
    for (var i = 0; i < 3; i++) star += (i < starsN ? '★' : '☆');
    if (won) {
      openOverlay('守住了！' + star, '击倒 ' + G.kills + ' 只僵尸 · 用时 ' + Math.round(G.time) + ' 秒<br>选错 ' + G.mistakes + ' 次',
        '再来一局', state.unit === 'mega' ? '返回首页' : '返回单元',
        function () { closeOverlay(); startGame(u); },
        function () { closeOverlay(); exitToLevelList(); });
    } else {
      openOverlay('僵尸冲进来了', '击倒 ' + G.kills + ' 只僵尸 · 选错 ' + G.mistakes + ' 次<br>再试一次，注意选对单词！',
        '重新挑战', state.unit === 'mega' ? '返回首页' : '返回单元',
        function () { closeOverlay(); startGame(u); },
        function () { closeOverlay(); exitToLevelList(); });
    }
  }
  function pauseGame() {
    if (!G || G.over) return;
    G.paused = true;
    openOverlay('暂停', '单词保卫战已暂停', '继续游戏', state.unit === 'mega' ? '返回首页' : '返回单元',
      function () { G.paused = false; closeOverlay(); },
      function () { G.paused = false; G.over = true; closeOverlay(); exitToLevelList(); });
  }

  /* ---------- 种卡模式 ---------- */
  function updateCursor() {
    var d = $('place-cursor');
    d.style.left = (cellX(state.place.col) - 4) + 'px';
    d.style.top = (laneY(state.place.lane) + 16) + 'px';
  }
  function enterPlace() {
    if (!G || G.over) return;
    state.placing = true;
    updateCursor();
    $('placement').className = 'on';
  }
  function exitPlace() {
    state.placing = false;
    $('placement').className = '';
    refreshFocus();
    if (G && G.cards[state.selected]) setFocus(G.cards[state.selected].el);
  }
  function placeKey(k) {
    if (k === 'back') { exitPlace(); return true; }
    if (k === 'enter') { plantAt(state.place.lane, state.place.col); return true; }
    if (k === 'left') state.place.col = clamp(state.place.col - 1, 0, 7);
    else if (k === 'right') state.place.col = clamp(state.place.col + 1, 0, 7);
    else if (k === 'up') state.place.lane = clamp(state.place.lane - 1, 0, 3);
    else if (k === 'down') state.place.lane = clamp(state.place.lane + 1, 0, 3);
    updateCursor();
    return true;
  }

  /* ---------- 返回与按键 ---------- */
  function goBack() {
    if (state.screen === 'game') { pauseGame(); return true; }
    if (state.screen === 'learn') { show(state.backTo || 'mode'); return true; }
    if (state.screen === 'mode') {
      if (state.unit === 'mega') show('home');
      else show('units');
      return true;
    }
    if (state.screen === 'units') { show('home'); return true; }
    return false;
  }
  window.tvKey = function (k) {
    if (state.overlay) return overlayKey(k);
    if (k === 'back') return goBack();
    if (state.screen === 'game') {
      if (state.placing) return placeKey(k);
      if (k === 'up') {
        var f = state.focus;
        for (var i = 0; i < G.cards.length; i++) {
          if (f === G.cards[i].el) { state.selected = i; enterPlace(); return true; }
        }
      }
      if (k === 'enter') { enter(); return true; }
      moveFocus(k === 'left' ? -1 : (k === 'right' ? 1 : 0), k === 'up' ? -1 : (k === 'down' ? 1 : 0));
      return true;
    }
    if (k === 'enter') { enter(); return true; }
    moveFocus(k === 'left' ? -1 : (k === 'right' ? 1 : 0), k === 'up' ? -1 : (k === 'down' ? 1 : 0));
    return true;
  };
  $('btn-shovel').onclick = function () {
    state.shovel = !state.shovel;
    this.className = state.shovel ? 'btn red focusable btnbar shovel on' : 'btn orange focusable btnbar shovel';
    this.textContent = state.shovel ? '铲除中' : '铲除';
    banner(state.shovel ? '铲除模式：按上键选格子拔掉植物' : '已退出铲除模式', 1400);
  };
  $('btn-quit').onclick = function () { pauseGame(); };

  show('home');
})();
