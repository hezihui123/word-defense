function _createForOfIteratorHelper(e, t) { var _n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"]; if (!_n) { if (Array.isArray(e) || (_n = _unsupportedIterableToArray(e)) || t && e && "number" == typeof e.length) { _n && (e = _n); var o = 0, F = function F() {}; return { s: F, n: function n() { return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var a, u, i = !0; return { s: function s() { _n = _n.call(e); }, n: function n() { i = !0; var r = _n.next(); return r.done ? { done: !0 } : { value: r.value, done: i = !1 }; }, e: function e(r) { a = !0, u = r; }, f: function f() { try { i || null == _n.return || _n.return(); } finally { if (a) throw u; } } }; }
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(t, e) { if (t) { if ("string" == typeof t) return _arrayLikeToArray(t, e); var o = {}.toString.call(t).slice(8, -1); return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(t, e) : void 0; } }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var $ = function $(s) {
  return document.querySelector(s);
};
var CFG = window.GAME_CONFIG || {};
var BOOK_ID = CFG.bookId || window.BOOK_ID || 'g3a';
var BOOK = window.BOOKS.find(function (b) {
  return b.id === BOOK_ID;
});
var UNIT_ID = CFG.unitId !== undefined ? CFG.unitId : window.UNIT_ID || null;
var UNIT = UNIT_ID ? BOOK.units.find(function (u) {
  return 'u' + u.no === UNIT_ID;
}) : null;
var NEXT_URL = CFG.nextUrl || null;
var HOME_HASH = CFG.homeHash || null;
if (UNIT) document.title = '单词保卫战 · ' + BOOK.name + ' Unit ' + UNIT.no + ' ' + UNIT.en;else if (BOOK) document.title = '单词保卫战 · ' + BOOK.name;
BOOK.units.forEach(function (u) {
  return u.words.forEach(function (w) {
    w.id = w.id || w.w;
    w.group = w.same || w.id;
  });
});

/* ---------- 认读页家谱图例（uncle / aunt / cousin） ---------- */
var KIN = new Set(['uncle', 'aunt', 'cousin']);
var LEGEND = {
  gold: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#ffe082" stroke="#ffa000" stroke-width="2.6"/></svg>',
  me: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#e53935" stroke-width="2.2" stroke-dasharray="3.5 2.5"/></svg>'
};

/* ---------- 可调参数 ---------- */
var LANES = 4,
  COLS = 8,
  COL0 = 7,
  CW = 8.8; // 4 行 × 8 格土，格子从 7% 开始，每格 8.8% 宽
var END_X = 4; // 僵尸走到这里算冲到底
var HP = 10,
  DMG_OK = 6; // 对上 2 枪倒；对不上打不动（0 伤害）
var RAGE_TIME = 2,
  RAGE_SPEED = 1.8; // 被错的豆子打中：僵尸加速 1.8 倍冲 2 秒
var WILT_AFTER = 2; // 种错的射手打错 2 次就枯萎，格子空出来
// 立过功（打中过自己的词）的射手：只打自己的词，不累计打错、不枯萎，别的词僵尸绕过它
var CART_X = 4; // 小车停放位置（%宽），车身完整显示
var HINT_MAX = 3,
  HINT_IDLE = 6,
  HINT_WRONG = 2; // 提示：每局最多 3 次；6 秒没种对 或 连错 2 次 就提示
var RANGE = CW * 4; // 射程：4 格
var CARD_EXTRA = [6, 4, 3, 2]; // 卡片走到左端后还能留几秒（按波数，越来越快）
var FIRE_CD = 1.5,
  PEA_SPEED = 55; // 射速（秒/发）、豆子速度（%宽/秒）
var EAT_TIME = 3; // 僵尸啃掉对的射手要几秒
var WRONG_EAT = .5; // 错的射手挡不住僵尸，半秒就踩扁
var SPEEDS = [{
  name: '🐢 慢慢来',
  cross: 70,
  gap: 11,
  card: 3.4,
  belt: 16
}, {
  name: '🐇 正常',
  cross: 52,
  gap: 8.5,
  card: 3.0,
  belt: 13
}, {
  name: '🚀 挑战',
  cross: 38,
  gap: 6.5,
  card: 2.6,
  belt: 10
}];
var WAVES = [3, 5, 7, 9];
var SKINS = ['#9ccc65', '#aed581', '#8bc34a', '#a5c78a', '#b2c99a'];
var CLOTHES = ['#5d7fa3', '#7b6a58', '#6d5f8d', '#4f7a6a', '#8a5a4a'];
var SAVE_KEY = 'word-defense-v3';
var save = {
  speed: 0,
  best: {}
};
try {
  Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'));
} catch (e) {}
if (!save.best || _typeof(save.best) !== 'object') save.best = {};
var store = function store() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {}
};
var bestKey = function bestKey(id) {
  return BOOK_ID + '_' + id;
};
var getBest = function getBest(id) {
  return save.best[bestKey(id)] || (BOOK_ID === 'g3a' ? save.best[id] || 0 : 0);
};
function picHTML(pic) {
  if (pic.startsWith('color:')) return "<span class=\"paint\" style=\"background:".concat(pic.slice(6), "\"></span>");
  if (pic.startsWith('num:')) {
    var n = +pic.slice(4);
    return "<span class=\"num\"><b>".concat(n, "</b><i>").concat('<s></s>'.repeat(n), "</i></span>");
  }
  return "<span class=\"emo\">".concat(pic, "</span>");
}

/* ---------- 声音 ---------- */
var audioCache = {};
var keyOf = function keyOf(word) {
  return 'w-' + word.toLowerCase().replace(/[^a-z0-9]+/g, '_');
};
var playing = null,
  lastSay = 0;
function playFile(key, text) {
  if (playing) {
    try {
      playing.pause();
    } catch (e) {}
  }
  lastSay = performance.now();
  if (window.WT_AUDIO && window.WT_AUDIO[key]) {
    var a = audioCache[key];
    if (!a) a = audioCache[key] = new Audio('audio/' + key + '.mp3');
    try {
      a.currentTime = 0;
    } catch (e) {}
    playing = a;
    a.play().catch(function () {
      return speak(text);
    });
  } else speak(text);
}
/* 没有 mp3 的词用浏览器朗读兜底，优先选英语音色 */
var enVoice = null;
function pickVoice() {
  try {
    var vs = speechSynthesis.getVoices();
    enVoice = vs.find(function (v) {
      return /^en[-_]US/i.test(v.lang) && v.localService;
    }) || vs.find(function (v) {
      return /^en[-_]US/i.test(v.lang);
    }) || vs.find(function (v) {
      return /^en/i.test(v.lang);
    }) || null;
  } catch (e) {}
}
try {
  pickVoice();
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
} catch (e) {}
function speak(text) {
  try {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = .85;
    if (enVoice) u.voice = enVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {}
}
var sayWord = function sayWord(w) {
  return playFile(keyOf(w.w), w.w);
};
var sayPhrase = function sayPhrase(k) {
  return playFile('p-' + k, window.PHRASES[k]);
};
function preload(words) {
  words.forEach(function (w) {
    var k = keyOf(w.w);
    if (!audioCache[k] && window.WT_AUDIO && window.WT_AUDIO[k]) {
      var a = new Audio('audio/' + k + '.mp3');
      a.preload = 'auto';
      audioCache[k] = a;
    }
  });
}
var ac = null;
function tone(f1, f2, dur) {
  var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'sine';
  var vol = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : .18;
  var delay = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    var t = ac.currentTime + delay,
      o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}
var sfx = {
  shoot: function shoot() {
    return tone(380, 900, .08, 'triangle', .06);
  },
  okhit: function okhit() {
    tone(880, 1320, .1, 'sine', .16);
    tone(1320, 1760, .12, 'sine', .12, .07);
  },
  badhit: function badhit() {
    return tone(180, 140, .09, 'square', .06);
  },
  kill: function kill() {
    tone(700, 200, .25, 'square', .07);
  },
  plant: function plant() {
    tone(200, 420, .12, 'triangle', .14);
  },
  pick: function pick() {
    return tone(660, 880, .06, 'sine', .08);
  },
  eat: function eat() {
    return tone(150, 90, .1, 'square', .08);
  },
  cart: function cart() {
    tone(120, 240, .8, 'sawtooth', .07);
  },
  wave: function wave() {
    return [523, 659, 784].forEach(function (f, i) {
      return tone(f, f, .18, 'triangle', .15, i * .12);
    });
  },
  win: function win() {
    return [523, 659, 784, 1047].forEach(function (f, i) {
      return tone(f, f * 1.01, .25, 'triangle', .16, i * .14);
    });
  },
  lose: function lose() {
    return [392, 330, 262].forEach(function (f, i) {
      return tone(f, f * .98, .3, 'triangle', .14, i * .2);
    });
  }
};

/* ---------- 选关页 ---------- */
function renderHome() {
  $('#speed').innerHTML = SPEEDS.map(function (s, i) {
    return "<button data-s=\"".concat(i, "\" class=\"").concat(save.speed === i ? 'on' : '', "\">").concat(s.name, "</button>");
  }).join('');
  var lv = BOOK.units.map(function (u) {
    return {
      id: 'u' + u.no,
      no: u.no,
      en: u.en,
      zh: u.zh,
      words: u.words
    };
  });
  if (UNIT) lv = lv.filter(function (l) {
    return l.id === UNIT_ID;
  });else lv.push({
    id: 'all',
    no: '★',
    en: 'All units',
    zh: '全册大混战',
    words: BOOK.units.flatMap(function (u) {
      return u.words;
    })
  });
  document.body.classList.toggle('single', !!UNIT);
  $('#levels').innerHTML = lv.map(function (l) {
    var b = getBest(l.id);
    var battle = l.words.filter(function (w) {
        return !w.learnOnly;
      }),
      extra = l.words.length - battle.length;
    var uniq = _toConsumableArray(new Map(battle.map(function (w) {
      return [w.group, w];
    })).values());
    var pics = UNIT ? uniq.map(function (w) {
      return "<span>".concat(wordPic(w), "</span>");
    }).join('') : uniq.slice(0, 9).map(function (w) {
      return w.pic.startsWith('color:') ? '🎨' : w.pic.startsWith('num:') ? '🔢' : w.pic;
    }).join('');
    return "<div class=\"lv\"><div class=\"top\"><div class=\"no ".concat(l.id === 'all' ? 'all' : '', "\">").concat(l.no, "</div>\n      <div class=\"nm\">").concat(l.id === 'all' ? '' : 'Unit ' + l.no + ' ').concat(l.en, "<small>").concat(l.zh, " \xB7 ").concat(battle.length, " \u4E2A\u8BCD").concat(extra ? ' + ' + extra + ' 个认读词' : '', "</small></div>\n      <div class=\"stars emo\">").concat('⭐'.repeat(b)).concat('<span style="opacity:.25">⭐</span>'.repeat(3 - b), "</div></div>\n      <div class=\"pics emo\">").concat(pics, "</div>\n      <div class=\"btns\"><button class=\"b-learn\" data-learn=\"").concat(l.id, "\">\uD83D\uDC42 \u5148\u8BA4\u4E00\u8BA4</button><button class=\"b-play\" data-play=\"").concat(l.id, "\">\u25B6 \u5F00\u59CB\u5B88\u536B</button></div></div>");
  }).join('');
  window._levels = lv;
  var sw = $('#switch');
  if (sw) {
    sw.style.display = UNIT ? '' : 'none';
    var a = sw.querySelector('a');
    if (a && HOME_HASH) a.href = 'index.html#' + HOME_HASH;
  }
}
$('#speed').onclick = function (e) {
  var b = e.target.closest('button');
  if (!b) return;
  save.speed = +b.dataset.s;
  store();
  renderHome();
};
$('#levels').onclick = function (e) {
  var b = e.target.closest('button');
  if (!b) return;
  var l = window._levels.find(function (x) {
    return x.id === (b.dataset.learn || b.dataset.play);
  });
  if (b.dataset.learn) showLearn(l);else startGame(l);
};
function showLearn(l, advancing) {
  preload(l.words);
  var PAGE = 4;
  var idx = l.words.map(function (w, i) {
    return i;
  });
  var kin = idx.filter(function (i) {
    return KIN.has(l.words[i].w);
  });
  var rest = idx.filter(function (i) {
    return !KIN.has(l.words[i].w);
  });
  var order = rest.concat(kin);
  var pages = Math.max(1, Math.ceil(order.length / PAGE));
  var page = 0;
  var tile = function tile(i) {
    var w = l.words[i];
    return '<button class="tile" data-i="' + i + '"><span class="p">' + wordPic(w) + '</span><b>' + w.w + '</b><small>' + w.zh + '</small>' + (w.learnOnly ? '<span class="tag">认读</span>' : '') + '</button>';
  };
  function render() {
    var slice = order.slice(page * PAGE, (page + 1) * PAGE);
    var note = l.words.some(function (w) {
      return w.learnOnly;
    }) ? '（灰标的词只认读，不上战场）' : '';
    if (kin.length) note += ' · 含亲属词';
    modal('<h2>' + (advancing ? '下一关 · 先认一认' : '先认一认') + '</h2><p class="sub">第 ' + (page + 1) + '/' + pages + ' 页 · 看单词、看图、点一下听读音' + note + '</p>' + '<div class="tiles">' + slice.map(tile).join('') + '</div>' + '<div class="row learn-nav"><button class="b-prev" data-prev' + (page === 0 ? ' disabled' : '') + '>◀ 上一页</button>' + '<span class="pageno">' + (page + 1) + ' / ' + pages + '</span>' + '<button class="b-next" data-next' + (page >= pages - 1 ? ' disabled' : '') + '>下一页 ▶</button></div>' + '<div class="row"><button class="b-sub" data-x>返回</button><button class="b-main" data-go>' + (advancing ? '跳过，直接开始' : '▶ 开始守卫') + '</button></div>');
    if (window.tvRefreshFocus) window.tvRefreshFocus();
  }
  $('#mbox').onclick = function (e) {
    var t = e.target.closest('[data-i]');
    if (t) {
      if (advancing) {
        var g = $('#mbox').querySelector('[data-go]');
        if (g) g.textContent = '▶ 开始守卫';
      }
      return sayWord(l.words[+t.dataset.i]);
    }
    if (e.target.closest('[data-prev]') && page > 0) {
      page--;
      render();
      return;
    }
    if (e.target.closest('[data-next]') && page < pages - 1) {
      page++;
      render();
      return;
    }
    if (e.target.closest('[data-x]')) closeModal();
    if (e.target.closest('[data-go]')) {
      closeModal();
      startGame(l);
    }
  };
  render();
}
function modal(html) {
  $('#mbox').innerHTML = html;
  $('#modal').classList.remove('hide');
}
function closeModal() {
  $('#modal').classList.add('hide');
  $('#mbox').onclick = null;
}

/* ---------- 游戏 ---------- */
var G = null;
var field = $('#field'),
  belt = $('#belt');
var rnd = function rnd(n) {
  return Math.floor(Math.random() * n);
};
var shuffle = function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = rnd(i + 1);
    var _ref = [a[j], a[i]];
    a[i] = _ref[0];
    a[j] = _ref[1];
  }
  return a;
};
var colX = function colX(c) {
  return COL0 + CW * (c + .5);
};
function startGame(level) {
  closeModal();
  cancelPick();
  var sp = SPEEDS[save.speed];
  G = {
    level: level,
    sp: sp,
    words: level.words.filter(function (w) {
      return !w.learnOnly;
    }),
    wave: 0,
    spawned: 0,
    killed: 0,
    total: WAVES.reduce(function (a, b) {
      return a + b;
    }, 0),
    mons: [],
    plants: [],
    peas: [],
    cards: [],
    carts: [],
    grid: _toConsumableArray(Array(LANES)).map(function () {
      return Array(COLS).fill(null);
    }),
    t: 0,
    last: 0,
    paused: false,
    over: false,
    bag: [],
    lastLane: -1,
    spawnAt: 5,
    cardAt: .2,
    sinceNeed: 0,
    shovel: false,
    hints: 0,
    idle: 0,
    wrongStreak: 0,
    hintWant: null,
    forceWord: null
  };
  preload(G.words);
  $('#home').classList.add('hide');
  $('#game').classList.remove('hide');
  $('#game').classList.remove('paused');
  field.querySelectorAll('.lane,.mon,.pea,.fx,.cart,.tur').forEach(function (n) {
    return n.remove();
  });
  belt.innerHTML = '';
  for (var i = 0; i < LANES; i++) {
    var d = document.createElement('div');
    d.className = 'lane';
    d.dataset.l = i;
    d.innerHTML = "<div class=\"house\"></div><div class=\"soil\" style=\"left:".concat(COL0, "%;width:").concat(CW * COLS, "%\"></div>") + _toConsumableArray(Array(COLS)).map(function (_, c) {
      return "<div class=\"cell\" data-c=\"".concat(c, "\"></div>");
    }).join('');
    field.insertBefore(d, $('#banner'));
    var cart = document.createElement('div');
    cart.className = 'cart ready';
    cart.innerHTML = '<div class="bx"></div><div class="wh a"></div><div class="wh b"></div>';
    field.appendChild(cart);
    G.carts.push({
      lane: i,
      x: CART_X,
      state: 'ready',
      delay: 0,
      el: cart
    });
  }
  setShovel(false);
  requestAnimationFrame(function () {
    layout();
    updateBar();
  });
  banner('僵尸要来了！', 1600);
  sfx.wave();
  setTimeout(function () {
    return sayPhrase('go');
  }, 300);
  G.last = performance.now();
  requestAnimationFrame(loop);
}
function layout() {
  if (!G) return;
  var H = field.clientHeight,
    W = field.clientWidth,
    lh = H / LANES;
  Object.assign(G, {
    W: W,
    H: H,
    lh: lh,
    size: Math.min(lh * 1.15, W * .13),
    bw: belt.clientWidth,
    bh: belt.clientHeight
  });
  G.cw = G.bh * .82;
  field.querySelectorAll('.lane').forEach(function (d, i) {
    d.style.top = i * lh + 'px';
    d.style.height = lh + 'px';
    d.querySelectorAll('.cell').forEach(function (c, k) {
      c.style.left = COL0 + CW * k + .18 + '%';
      c.style.width = CW - .36 + '%';
    });
  });
  G.ts = Math.min(lh * .49, W * .075);
  G.bs = Math.min(Math.max(18, G.ts * .45), lh * .24, W * CW / 100 * .65);
  G.plants.forEach(function (p) {
    sizeTur(p.el);
    p.el.style.top = (p.lane + .59) * lh + 'px';
  });
  G.carts.forEach(placeCart);
  G.mons.forEach(placeMon);
  G.cards.forEach(function (c) {
    c.el.style.width = G.cw + 'px';
    c.el.style.height = G.cw + 'px';
    c.el.querySelector('.p').style.fontSize = G.cw * .62 + 'px';
  });
}
window.addEventListener('resize', layout);
function placeCart(c) {
  c.el.style.fontSize = Math.min(G.lh * .5, G.W * .05) + 'px';
  c.el.style.left = c.x / 100 * G.W + 'px';
  c.el.style.top = (c.lane + .5) * G.lh + 'px';
}
var turHTML = function turHTML(w) {
  return "<div class=\"badge\">".concat(wordPic(w), "</div><div class=\"hd\"></div><div class=\"st\"></div><div class=\"lf a\"></div><div class=\"lf b\"></div>");
};
function sizeTur(el) {
  el.style.fontSize = G.ts + 'px';
  el.style.setProperty('--bs', G.bs + 'px');
}

/* ---------- 传送带 ---------- */
function neededWords() {
  return alive().sort(function (a, b) {
    return a.x - b.x;
  }).filter(function (m) {
    return !G.plants.some(function (p) {
      return p.lane === m.lane && p.word.group === m.word.group && p.x < m.x;
    }) && !G.cards.some(function (c) {
      return c.word.group === m.word.group;
    });
  }).map(function (m) {
    return m.word;
  });
}
function makeCard() {
  var need = neededWords();
  var w;
  var fw = G.forceWord;
  G.forceWord = null;
  if (fw && !G.cards.some(function (c) {
    return c.word.group === fw.group;
  })) {
    w = fw;
    G.sinceNeed = 0;
  } else if (need.length && (G.sinceNeed >= 2 || Math.random() < .35)) {
    w = need[0];
    G.sinceNeed = 0;
  } else {
    var onBelt = new Set(G.cards.map(function (c) {
      return c.word.group;
    }));
    var pool = G.words.filter(function (x) {
      return !onBelt.has(x.group);
    });
    w = (pool.length ? pool : G.words)[rnd((pool.length ? pool : G.words).length)];
    G.sinceNeed++;
  }
  var el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = "<span class=\"p\">".concat(wordPic(w), "</span><span class=\"sp\"></span>");
  el.style.width = G.cw + 'px';
  el.style.height = G.cw + 'px';
  el.querySelector('.p').style.fontSize = G.cw * .62 + 'px';
  var c = {
    word: w,
    x: G.bw + 4,
    el: el,
    born: G.t
  };
  el.style.left = c.x + 'px';
  el.addEventListener('pointerdown', function (e) {
    return startPick(e, c);
  });
  belt.appendChild(el);
  G.cards.push(c);
}
function stepBelt(dt) {
  var pace = 1 + .2 * Math.min(G.wave, WAVES.length - 1);
  G.bw = belt.clientWidth;
  var v = G.bw * pace / G.sp.belt,
    gap = 12;
  G.cards.sort(function (a, b) {
    return a.x - b.x;
  });
  var minX = 10;
  var _iterator = _createForOfIteratorHelper(G.cards),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var c = _step.value;
      c.x = Math.max(minX, c.x - v * dt);
      minX = c.x + (c.el.offsetWidth || G.cw) + gap;
      c.el.style.left = c.x + 'px';
      var life = G.sp.belt + CARD_EXTRA[Math.min(G.wave, CARD_EXTRA.length - 1)],
        age = G.t - c.born;
      if (pick && pick.card === c) continue;
      if (age > life) c.gone = true;else c.el.classList.toggle('dying', age > life - 2);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  G.cards.filter(function (c) {
    return c.gone;
  }).forEach(function (c) {
    c.el.classList.add('vanish');
    setTimeout(function () {
      return c.el.remove();
    }, 300);
  });
  G.cards = G.cards.filter(function (c) {
    return !c.gone;
  });
  var lastX = G.cards.length ? G.cards[G.cards.length - 1].x : -1e9;
  if (G.t >= G.cardAt && lastX < G.bw - G.cw - gap && G.cards.length * (G.cw + gap) < G.bw - G.cw) {
    makeCard();
    G.cardAt = G.t + G.sp.card / pace;
  }
}

/* ---------- 选卡、拖动、种植 ---------- */
var pick = null;
function startPick(e, c) {
  if (!G || G.paused || G.over) return;
  e.preventDefault();
  if (G.shovel) setShovel(false);
  if (pick && pick.card !== c) pick.card.el.classList.remove('sel');
  pick = {
    card: c,
    sx: e.clientX,
    sy: e.clientY,
    dragging: false
  };
  c.el.classList.add('sel');
  document.body.classList.add('planting');
  sayWord(c.word);
  sfx.pick();
}
document.addEventListener('pointermove', function (e) {
  if (!pick) return;
  if (!pick.dragging && Math.hypot(e.clientX - pick.sx, e.clientY - pick.sy) > 10 && pick.sx !== null) {
    pick.dragging = true;
    pick.card.el.classList.add('drag');
    var g = $('#ghost');
    g.className = '';
    g.innerHTML = "<div class=\"tur\" style=\"position:relative;transform:none\">".concat(turHTML(pick.card.word), "</div>");
    sizeTur(g.firstChild);
  }
  if (pick.dragging) {
    var _g = $('#ghost');
    _g.style.left = e.clientX + 'px';
    _g.style.top = e.clientY + 'px';
    hlCell(cellAt(e.clientX, e.clientY));
  }
});
document.addEventListener('pointerup', function (e) {
  if (!pick) return;
  if (pick.dragging) {
    var cell = cellAt(e.clientX, e.clientY);
    $('#ghost').className = 'hide';
    pick.card.el.classList.remove('drag');
    hlCell(null);
    if (cell && plantAt(cell)) return;
    pick.sx = null;
  } else pick.sx = null;
});
field.addEventListener('pointerdown', function (e) {
  if (!G || G.paused || G.over) return;
  var cell = cellAt(e.clientX, e.clientY);
  if (G.shovel) {
    if (cell && G.grid[cell.lane][cell.col]) removePlant(G.grid[cell.lane][cell.col], true);
    setShovel(false);
    return;
  }
  if (pick && pick.sx === null && cell) plantAt(cell);
});
function cellAt(cx, cy) {
  var r = field.getBoundingClientRect();
  if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
  var xp = (cx - r.left) / r.width * 100,
    lane = Math.floor((cy - r.top) / (r.height / LANES)),
    col = Math.floor((xp - COL0) / CW);
  if (col < 0 || col >= COLS || lane < 0 || lane >= LANES) return null;
  return {
    lane: lane,
    col: col
  };
}
var hlEl = null;
function hlCell(cell) {
  if (hlEl) hlEl.classList.remove('hl');
  hlEl = null;
  if (!cell || G.grid[cell.lane][cell.col]) return;
  hlEl = field.querySelector(".lane[data-l=\"".concat(cell.lane, "\"] .cell[data-c=\"").concat(cell.col, "\"]"));
  hlEl && hlEl.classList.add('hl');
}
function cancelPick() {
  if (pick) {
    pick.card.el.classList.remove('sel', 'drag');
    pick = null;
  }
  document.body.classList.remove('planting');
  $('#ghost').className = 'hide';
  hlCell && hlEl && hlEl.classList.remove('hl');
}
function plantAt(cell) {
  if (!pick || G.grid[cell.lane][cell.col]) return false;
  var c = pick.card;
  cancelPick();
  G.cards = G.cards.filter(function (x) {
    return x !== c;
  });
  c.el.remove();
  var el = document.createElement('div');
  el.className = 'tur new';
  el.innerHTML = turHTML(c.word);
  var p = {
    lane: cell.lane,
    col: cell.col,
    x: colX(cell.col),
    word: c.word,
    cd: .5,
    hp: EAT_TIME,
    miss: 0,
    proven: false,
    el: el
  };
  el.style.left = p.x + '%';
  el.style.top = (p.lane + .59) * G.lh + 'px';
  sizeTur(el);
  field.appendChild(el);
  G.plants.push(p);
  G.grid[p.lane][p.col] = p;
  sfx.plant();
  if (alive().some(function (m) {
    return m.lane === p.lane && m.word.group === p.word.group && m.x > p.x;
  })) {
    G.idle = 0;
    G.wrongStreak = 0;
  } else if (++G.wrongStreak >= HINT_WRONG) {
    var u = urgentMons();
    if (u.length) giveHint(u[0]);
  }
  return true;
}
function setProven(p) {
  if (p.proven) return;
  p.proven = true;
  p.miss = 0;
  p.el.classList.add('proven');
}

/* ---------- 提示：高亮正确的卡片 + 读一遍单词，每局最多 HINT_MAX 次 ---------- */
function urgentMons() {
  return alive().filter(function (m) {
    return m.x < 100 && !G.plants.some(function (p) {
      return p.lane === m.lane && p.word.group === m.word.group && p.x < m.x;
    });
  }).sort(function (a, b) {
    return a.x - b.x;
  });
}
function giveHint(m) {
  G.idle = 0;
  G.wrongStreak = 0;
  if (G.hints >= HINT_MAX || G.hintWant) return;
  var mid = function mid(c) {
    return Math.abs(c.x + G.cw / 2 - G.bw / 2);
  };
  var c = G.cards.filter(function (c) {
    return c.word.group === m.word.group;
  }).sort(function (a, b) {
    return mid(a) - mid(b);
  })[0];
  if (!c) {
    var free = G.cards.filter(function (x) {
      return !(pick && pick.card === x) && x.x < G.bw - G.cw * .5;
    }).sort(function (a, b) {
      return mid(a) - mid(b);
    });
    if (free.length) {
      c = free[0];
      c.word = m.word;
      c.born = G.t;
      c.el.classList.remove('dying');
      c.el.querySelector('.p').innerHTML = wordPic(m.word);
    } else {
      G.hintWant = m;
      G.forceWord = m.word;
      G.cardAt = Math.min(G.cardAt, G.t);
      return;
    }
  }
  showHint(c, m);
}
function showHint(c, m) {
  G.hints++;
  G.hintWant = null;
  G.idle = 0;
  var edge = c.x < 16 || c.x + G.cw > G.bw - 16;
  c.el.classList.add('hint');
  if (edge) c.el.classList.add('edge');
  setTimeout(function () {
    return c.el.classList.remove('hint', 'edge');
  }, 4500);
  m.el.classList.add('hintme');
  setTimeout(function () {
    return m.el.classList.remove('hintme');
  }, 4500);
  sayWord(m.word);
}
function stepHint(dt) {
  if (G.hintWant) {
    var m = G.hintWant;
    if (m.dead || G.hints >= HINT_MAX) G.hintWant = null;else {
      var c = G.cards.find(function (c) {
        return c.word.group === m.word.group;
      });
      if (c) showHint(c, m);
    }
    return;
  }
  if (G.hints >= HINT_MAX) return;
  var u = urgentMons();
  if (!u.length) {
    G.idle = 0;
    return;
  }
  if ((G.idle += dt) >= HINT_IDLE) giveHint(u[0]);
}
function wilt(p) {
  G.plants = G.plants.filter(function (x) {
    return x !== p;
  });
  G.grid[p.lane][p.col] = null;
  G.mons.forEach(function (m) {
    if (m.eating === p) {
      m.eating = null;
      m.el.classList.remove('eating');
    }
  });
  p.el.classList.add('wilt');
  setTimeout(function () {
    return p.el.remove();
  }, 900);
}
function removePlant(p, byShovel) {
  G.plants = G.plants.filter(function (x) {
    return x !== p;
  });
  G.grid[p.lane][p.col] = null;
  G.mons.forEach(function (m) {
    if (m.eating === p) {
      m.eating = null;
      m.el.classList.remove('eating');
    }
  });
  p.el.style.transition = 'transform .25s, opacity .25s';
  p.el.style.opacity = 0;
  p.el.style.transform = 'translate(-50%,-40%) scale(.3)';
  setTimeout(function () {
    return p.el.remove();
  }, 260);
  if (byShovel) sfx.pick();
}
function setShovel(on) {
  if (!G) return;
  G.shovel = on;
  $('#shovel').classList.toggle('on', on);
  document.body.classList.toggle('shoveling', on);
  if (on) cancelPick();
}

/* ---------- 僵尸 ---------- */
function pickWord() {
  var onScreen = new Set(G.mons.filter(function (m) {
    return !m.dead;
  }).map(function (m) {
    return m.word.group;
  }));
  for (var tries = 0; tries < 2; tries++) {
    if (!G.bag.length) G.bag = shuffle(G.words.slice());
    var i = G.bag.findIndex(function (w) {
      return !onScreen.has(w.group);
    });
    if (i >= 0) return G.bag.splice(i, 1)[0];
    G.bag = [];
  }
  return G.words[rnd(G.words.length)];
}
function spawn() {
  var word = pickWord();
  var lane = rnd(LANES);
  if (lane === G.lastLane) lane = (lane + 1 + rnd(LANES - 1)) % LANES;
  G.lastLane = lane;
  var spelling = word.w.toLowerCase();
  var demanding = spelling.replace(/[^a-z]/g, '').length >= 8 || /[a-z] [a-z]|ough|eigh|tch/.test(spelling);
  var armored = demanding && G.wave > 0 && !alive().some(function (enemy) {
    return enemy.maxHp > HP;
  }) && Math.random() < .35;
  var maxHp = armored ? DMG_OK * 3 : HP;
  var m = {
    word: word,
    lane: lane,
    x: 104,
    maxHp: maxHp,
    hp: maxHp,
    dead: false,
    eating: null,
    stun: 0,
    chew: 0,
    rage: 0,
    speed: (100 - END_X) / G.sp.cross * (0.9 + Math.random() * .2)
  };
  var el = document.createElement('div');
  el.className = armored ? 'mon armored' : 'mon';
  var sk = SKINS[rnd(SKINS.length)]; el.style.setProperty('--sk', sk);
  var cl = CLOTHES[rnd(CLOTHES.length)]; el.style.setProperty('--cl', cl);
  el.innerHTML = "<div class=\"sign\"></div><div class=\"zb\"><div class=\"arm b\"></div><div class=\"leg l\"></div><div class=\"leg r\"></div><div class=\"body\"></div><div class=\"head\"><div class=\"hair\"></div><div class=\"e l\"></div><div class=\"e r\"></div><div class=\"m\"></div></div><div class=\"arm\"></div></div><div class=\"hp\"><i></i></div>";
  el.querySelector('.sign').textContent = word.w; if (sk) el.querySelector('.head').style.background = sk; if (cl) el.querySelector('.body').style.background = cl;
  m.el = el;
  field.appendChild(el);
  G.mons.push(m);
  placeMon(m);
}
function placeMon(m) {
  var s = Math.min(G.size, G.lh * .88);
  m.el.style.width = s + 'px';
  m.el.style.height = s + 'px';
  m.el.style.fontSize = s + 'px';
  m.el.querySelector('.sign').style.fontSize = Math.min(G.lh * .26, s * 1.9 / Math.max(4, m.word.w.length)) + 'px';
  m.el.style.left = m.x / 100 * G.W + 'px';
  m.el.style.top = (m.lane + .5) * G.lh + 'px';
}
var alive = function alive() {
  return G.mons.filter(function (m) {
    return !m.dead;
  });
};

/* ---------- 射击 ---------- */
function firePea(p) {
  p.el.classList.remove('fire');
  void p.el.offsetWidth;
  p.el.classList.add('fire');
  var el = document.createElement('div');
  el.className = 'pea';
  el.style.fontSize = G.lh * .42 + 'px';
  field.appendChild(el);
  G.peas.push({
    lane: p.lane,
    x: p.x + 3.2,
    from: p.x,
    word: p.word,
    plant: p,
    only: p.proven,
    el: el
  });
  sfx.shoot();
}
function stepPeas(dt) {
  var _iterator2 = _createForOfIteratorHelper(G.peas),
    _step2;
  try {
    var _loop = function _loop() {
      var pe = _step2.value;
      pe.x += PEA_SPEED * dt;
      var ahead = G.mons.filter(function (m) {
        return !m.dead && m.lane === pe.lane && m.x > pe.from && m.x - 1.5 > pe.x - 2.2 && (!pe.only || m.word.group === pe.word.group);
      });
      var hasMatch = ahead.some(function (m) {
        return m.word.group === pe.word.group;
      });
      var m = ahead.find(function (m) {
        return Math.abs(m.x - 1.5 - pe.x) < 2.2 && (!hasMatch || m.word.group === pe.word.group);
      });
      if (m) {
        pe.done = true;
        hitMon(m, pe);
      } else if (pe.x > 104) pe.done = true;
      if (pe.done) pe.el.remove();else {
        pe.el.style.left = pe.x / 100 * G.W + 'px';
        pe.el.style.top = (pe.lane + .38) * G.lh + 'px';
      }
    };
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  G.peas = G.peas.filter(function (p) {
    return !p.done;
  });
}
function hitMon(m, pe) {
  var ok = pe.word.group === m.word.group;
  var px = m.x / 100 * G.W,
    py = (m.lane + .3) * G.lh;
  if (ok) {
    if (pe.plant && G.plants.includes(pe.plant)) setProven(pe.plant);
    m.hp -= DMG_OK;
    m.el.classList.add('hurt');
    m.el.querySelector('.hp i').style.width = Math.max(0, m.hp / m.maxHp * 100) + '%';
  }
  var cls = ok ? 'okhit' : 'badhit';
  m.el.classList.remove('okhit', 'badhit');
  void m.el.offsetWidth;
  m.el.classList.add(cls);
  if (ok) {
    sfx.okhit();
    fx(px, py, '✓', 'ok', G.lh * .42);
    fx(px, (m.lane + .45) * G.lh, '', 'ring', G.lh * .7);
    m.x = Math.min(104, m.x + 1.8);
    m.stun = .7;
    m.el.classList.add('stun');
  } else {
    sfx.badhit();
    fx(px - G.size * .25, (m.lane + .4) * G.lh, '当！', 'bad', G.lh * .22);
    fx(px + G.size * .15, (m.lane + .05) * G.lh, '💢', 'bad emo', G.lh * .3);
    m.rage = RAGE_TIME;
    m.el.classList.add('rage');
    var p = pe.plant;
    if (p && G.plants.includes(p) && !p.proven && ++p.miss >= WILT_AFTER) wilt(p);
  }
  if (m.hp <= 0) {
    killMon(m, ok);
    if (ok && G.plants.includes(pe.plant)) removePlant(pe.plant, false);
  }
}
function killMon(m, ok) {
  m.dead = true;
  m.el.classList.add('die');
  setTimeout(function () {
    return m.el.remove();
  }, 550);
  if (m.eating) m.eating = null;
  G.killed++;
  updateBar();
  sfx.kill();
  fx(m.x / 100 * G.W, (m.lane + .1) * G.lh, m.word.w, 'word', G.lh * .3);
  if (performance.now() - lastSay > 1300) setTimeout(function () {
    if (!pick) sayWord(m.word);
  }, 250);
}
function fx(x, y, text, cls, size) {
  var d = document.createElement('div');
  d.className = 'fx ' + cls;
  d.textContent = text;
  d.style.left = x + 'px';
  d.style.top = y + 'px';
  d.style.fontSize = size + 'px';
  field.appendChild(d);
  setTimeout(function () {
    return d.remove();
  }, 1200);
}

/* ---------- 小车 ---------- */
function breach(m) {
  m.waiting = true;
  if (G.carts.some(function (c) {
    return c.lane === m.lane && (c.state === 'coming' || c.state === 'go' && c.x < m.x + 4);
  })) return;
  var ready = G.carts.filter(function (c) {
    return c.state === 'ready';
  });
  if (!ready.length) return lose(m);
  ready.sort(function (a, b) {
    return Math.abs(a.lane - m.lane) - Math.abs(b.lane - m.lane);
  });
  var c = ready[0];
  if (c.lane === m.lane) launch(c);else {
    c.state = 'coming';
    c.delay = .45;
    c.lane = m.lane;
    c.el.classList.remove('ready');
    placeCart(c);
  }
}
function launch(c) {
  c.state = 'go';
  c.el.classList.remove('ready');
  c.el.classList.add('go');
  sfx.cart();
  updateBar();
}
function stepCarts(dt) {
  var _iterator3 = _createForOfIteratorHelper(G.carts),
    _step3;
  try {
    var _loop2 = function _loop2() {
        var c = _step3.value;
        if (c.state === 'coming') {
          c.delay -= dt;
          if (c.delay <= 0) launch(c);
          return 0; // continue
        }
        if (c.state !== 'go') return 0; // continue
        c.x += 60 * dt;
        placeCart(c);
        var _iterator4 = _createForOfIteratorHelper(G.mons),
          _step4;
        try {
          var _loop3 = function _loop3() {
            var m = _step4.value;
            if (!m.dead && m.lane === c.lane && m.x <= c.x + 4) {
              m.dead = true;
              m.el.classList.add('squash');
              setTimeout(function () {
                return m.el.remove();
              }, 450);
              G.killed++;
              updateBar();
            }
          };
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            _loop3();
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        if (c.x > 106) {
          c.state = 'gone';
          c.el.remove();
          G.mons.forEach(function (m) {
            if (m.lane === c.lane) m.waiting = false;
          });
        }
      },
      _ret;
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      _ret = _loop2();
      if (_ret === 0) continue;
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
}
var cartsLeft = function cartsLeft() {
  return G.carts.filter(function (c) {
    return c.state === 'ready';
  }).length;
};

/* ---------- 主循环 ---------- */
function loop(now) {
  if (!G || G.over) return;
  var dt = Math.min(.1, (now - G.last) / 1000);
  G.last = now;
  if (!G.paused) step(dt);
  requestAnimationFrame(loop);
}
function step(dt) {
  G.t += dt;
  stepBelt(dt);
  if (G.wave < WAVES.length) {
    if (G.spawned < WAVES[G.wave] && G.t >= G.spawnAt && alive().length < 6) {
      var pair = G.wave >= 1 && G.spawned === Math.floor(WAVES[G.wave] / 2) && alive().length <= 4;
      spawn();
      G.spawned++;
      if (pair && G.spawned < WAVES[G.wave]) {
        spawn();
        G.spawned++;
      }
      G.spawnAt = G.t + G.sp.gap * (.95 + Math.random() * .1) * (1 - .13 * G.wave);
    }
    if (G.spawned >= WAVES[G.wave] && !alive().length) {
      G.wave++;
      G.spawned = 0;
      updateBar();
      if (G.wave < WAVES.length) {
        banner(G.wave === WAVES.length - 1 ? '最后一波！' : "\u7B2C ".concat(G.wave + 1, " \u6CE2"), 1600);
        sfx.wave();
        G.spawnAt = G.t + 4;
      } else return win();
    }
  }
  var _iterator5 = _createForOfIteratorHelper(G.plants),
    _step5;
  try {
    var _loop4 = function _loop4() {
      var p = _step5.value;
      p.cd -= dt;
      if (p.cd <= 0 && G.mons.some(function (m) {
        return !m.dead && m.lane === p.lane && m.x > p.x && m.x - p.x <= RANGE && m.x < 101 && (!p.proven || m.word.group === p.word.group);
      })) {
        firePea(p);
        p.cd = FIRE_CD;
      }
    };
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      _loop4();
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  stepPeas(dt);
  stepHint(dt);
  var _iterator6 = _createForOfIteratorHelper(G.mons),
    _step6;
  try {
    var _loop5 = function _loop5() {
      var m = _step6.value;
      if (m.dead) return 1; // continue
      if (m.rage > 0) {
        m.rage -= dt;
        if (m.rage <= 0) m.el.classList.remove('rage');
      }
      if (m.stun > 0) {
        m.stun -= dt;
        if (m.stun <= 0) m.el.classList.remove('stun');
      } else if (m.eating && m.eating.proven && m.eating.word.group !== m.word.group) {
        m.eating = null;
        m.el.classList.remove('eating');
      } else if (m.eating) {
        var p = m.eating;
        p.hp -= dt * (m.rage > 0 ? RAGE_SPEED : 1) * (p.word.group === m.word.group ? 1 : EAT_TIME / WRONG_EAT);
        p.el.classList.add('chewed');
        m.chew -= dt;
        if (m.chew <= 0) {
          sfx.eat();
          m.chew = .45;
        }
        if (p.hp <= 0) {
          removePlant(p);
          m.eating = null;
          m.el.classList.remove('eating');
        }
      } else if (!m.waiting) {
        var _p = G.plants.find(function (p) {
          return p.lane === m.lane && p.x < m.x && m.x - p.x < 4 && !(p.proven && p.word.group !== m.word.group);
        });
        if (_p) {
          m.eating = _p;
          m.el.classList.add('eating');
        } else m.x -= m.speed * (m.rage > 0 ? RAGE_SPEED : 1) * dt;
        if (m.x <= END_X) {
          m.x = END_X;
          breach(m);
        }
      }
      m.el.style.left = m.x / 100 * G.W + 'px';
    };
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      if (_loop5()) continue;
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
  G.plants.forEach(function (p) {
    if (!G.mons.some(function (m) {
      return m.eating === p;
    })) p.el.classList.remove('chewed');
  });
  stepCarts(dt);
  G.mons = G.mons.filter(function (m) {
    return !m.dead || m.el.isConnected;
  });
}

/* ---------- 界面 ---------- */
function updateBar() {
  var pct = Math.min(100, G.killed / G.total * 100);
  var w = Math.min(G.wave, WAVES.length - 1);
  var dots = WAVES.map(function (_, i) {
    return "<b class=\"".concat(i < G.wave ? 'done' : i === w ? 'cur' : '', "\"></b>");
  }).join('');
  $('#wave').innerHTML = "<span class=\"dots\" title=\"\u7B2C ".concat(w + 1, " \u6CE2\uFF0C\u5171 ").concat(WAVES.length, " \u6CE2\">").concat(dots, "</span><span class=\"wt\">").concat(w === WAVES.length - 1 ? '最后一波' : '第 ' + (w + 1) + ' 波', "</span><span class=\"prog\"><i style=\"width:").concat(pct, "%\"></i></span><span class=\"cars\"><span class=\"emo\">\uD83D\uDE97</span>\xD7").concat(cartsLeft(), "</span>");
}
var bannerTimer = 0;
function banner(text, ms) {
  var b = $('#banner');
  b.textContent = text;
  b.classList.add('on');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(function () {
    return b.classList.remove('on');
  }, ms);
}
function togglePause(force) {
  if (!G || G.over) return;
  G.paused = force !== undefined ? force : !G.paused;
  $('#pause').textContent = G.paused ? '▶' : '⏸';
  $('#game').classList.toggle('paused', G.paused);
  if (!G.paused) {
    closeModal();
    G.last = performance.now();
    return;
  }
  cancelPick();
  modal("<h2>\u6682\u505C\u4E2D</h2><p class=\"sub\">\u4F11\u606F\u4E00\u4E0B</p><div class=\"row\"><button class=\"b-sub\" data-q>\u9000\u51FA</button><button class=\"b-main\" data-r>\u7EE7\u7EED</button></div>");
  $('#mbox').onclick = function (e) {
    if (e.target.closest('[data-r]')) togglePause(false);
    if (e.target.closest('[data-q]')) {
      closeModal();
      quit();
    }
  };
}
function win() {
  G.over = true;
  cancelPick();
  var left = cartsLeft(),
    stars = left >= 4 ? 3 : left >= 2 ? 2 : 1;
  if (stars > getBest(G.level.id)) {
    save.best[bestKey(G.level.id)] = stars;
    store();
  }
  setTimeout(function () {
    sfx.win();
    sayPhrase('win');
    showEnd("<div class=\"big emo\">".concat('⭐'.repeat(stars)).concat('<span style="opacity:.2">⭐</span>'.repeat(3 - stars), "</div><h2>\u5B88\u4F4F\u5566\uFF01</h2><p class=\"sub\">\u6253\u8D25\u4E86 ").concat(G.total, " \u53EA\u50F5\u5C38 \xB7 \u8FD8\u5269 ").concat(left, " \u8F86\u5C0F\u8F66</p>"), true);
  }, 800);
}
function lose(m) {
  G.over = true;
  cancelPick();
  m.el.style.transition = 'left 1.2s linear';
  m.el.style.left = '-10%';
  setTimeout(function () {
    sfx.lose();
    sayPhrase('lose');
    showEnd("<div class=\"big emo\">\uD83E\uDDDF\uD83E\uDDE0</div><h2>\u8111\u5B50\u88AB\u5403\u6389\u4E86\uFF01</h2><p class=\"sub\">4 \u8F86\u5C0F\u8F66\u90FD\u7528\u5B8C\u4E86\u3002\u5148\u8BA4\u4E00\u8BA4\u5355\u8BCD\uFF0C\u518D\u6765\u4E00\u6B21\uFF01</p>");
  }, 1300);
}
function showEnd(html) {
  var won = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var nextLv = !UNIT && won ? window._levels[window._levels.indexOf(G.level) + 1] : null;
  var next = UNIT ? won && NEXT_URL : nextLv;
  var actions = won ? '<button class="b-sub" data-a>重玩</button>' + (next ? '<button class="b-main" data-n>下一关 ▶</button>' : '') : '<button class="b-sub" data-l>👂 先认一认</button><button class="b-main" data-a>再玩一次</button>';
  modal(html + '<div class="row"><button class="' + (won && !next ? 'b-main' : 'b-sub') + '" data-h>选关</button>' + actions + '</div>');
  $('#mbox').onclick = function (e) {
    var lv = G.level;
    if (e.target.closest('[data-h]')) {
      if (HOME_HASH) location.href = 'index.html#' + HOME_HASH;else {
        closeModal();
        quit();
      }
    }
    if (e.target.closest('[data-l]')) {
      quit();
      showLearn(lv);
    }
    if (e.target.closest('[data-a]')) startGame(lv);
    if (next && e.target.closest('[data-n]')) {
      if (typeof next === 'string') location.href = next;else {
        quit();
        showLearn(next, true);
      }
    }
  };
}
function quit() {
  if (G) G.over = true;
  cancelPick();
  if (playing) try {
    playing.pause();
  } catch (e) {}
  $('#game').classList.add('hide');
  $('#home').classList.remove('hide');
  renderHome();
}
$('#pause').onclick = function () {
  return togglePause();
};
$('#quit').onclick = function () {
  return togglePause(true);
};
$('#shovel').onclick = function () {
  return setShovel(!G.shovel);
};
document.addEventListener('keydown', function (e) {
  if (!G || G.over || $('#game').classList.contains('hide')) return;
  if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
    e.preventDefault();
    togglePause();
  }
  if (e.key === 'Escape') {
    cancelPick();
    setShovel(false);
  }
});
document.addEventListener('visibilitychange', function () {
  if (document.hidden && G && !G.over && !G.paused) togglePause(true);
});
renderHome();
if (location.hash === '#learn') {
  history.replaceState(null, '', location.pathname + location.search);
  showLearn(window._levels[0], true);
} else if (location.hash === '#play') {
  history.replaceState(null, '', location.pathname + location.search);
  startGame(window._levels[0]);
}