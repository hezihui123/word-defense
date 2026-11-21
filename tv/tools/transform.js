/* 把原网页项目转译为 Android 4.4 WebView 可运行的版本。
 * 用法：node tv/tools/transform.js
 * 依赖：本目录 npm install @babel/core @babel/preset-env postcss postcss-custom-properties postcss-calc
 */
const fs = require('fs');
const path = require('path');

const TOOLS = __dirname;
const ROOT = path.resolve(TOOLS, '..', '..');      // word-defense 根目录
const OUT = path.resolve(TOOLS, '..', 'assets', 'tv');
const STATIC = path.join(TOOLS, 'static');

const babel = require('@babel/core');
const presetEnv = require('@babel/preset-env');
const postcss = require('postcss');
const customProperties = require('postcss-custom-properties');
const calc = require('postcss-calc');

/* 把 clamp()/min()/max() 按 1920x1080 舞台展开成固定 px；4.4 WebView 不支持这些函数。 */
function evalLen(s) {
  s = String(s).trim();
  var m = s.match(/^(-?\d*\.?\d+)(px|vw|vh|svh|dvh)$/);
  if (m) {
    var n = parseFloat(m[1]);
    if (m[2] === 'px') return n;
    if (m[2] === 'vw') return n * 19.2;
    return n * 10.8;
  }
  if (/^calc\(/.test(s)) {
    var inner = s.slice(5, -1).replace(/(-?\d*\.?\d+)(px|vw|vh|svh|dvh)/g, function (_, a, u) { return evalLen(a + u); });
    if (/^[0-9+\-*/().\s]+$/.test(inner)) {
      try { return Function('return (' + inner + ')')(); } catch (e) { return null; }
    }
  }
  return null;
}
function splitArgs(s) {
  var out = [], depth = 0, cur = '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function computeMath(fn, argText) {
  var args = splitArgs(argText), nums = args.map(evalLen), out = null;
  if (fn === 'clamp' && nums.length === 3 && nums.every(function (x) { return x !== null; })) {
    out = Math.max(nums[0], Math.min(nums[1], nums[2]));
  } else if ((fn === 'min' || fn === 'max') && nums.length && nums.every(function (x) { return x !== null; })) {
    out = fn === 'min' ? Math.min.apply(null, nums) : Math.max.apply(null, nums);
  } else if (fn === 'min' || fn === 'max') {
    out = evalLen(args[0]) !== null ? args[0] : args[args.length - 1];
  }
  return out === null ? null : (typeof out === 'number' ? (Math.round(out * 100) / 100 + 'px') : out);
}
function flattenMath(value) {
  for (var pass = 0; pass < 6; pass++) {
    var out = '', i = 0, changed = false;
    while (i < value.length) {
      var m = /^(clamp|min|max)\(/.exec(value.slice(i));
      if (m) {
        var start = i + m[0].length, depth = 1, j = start;
        while (j < value.length && depth > 0) {
          if (value[j] === '(') depth++;
          else if (value[j] === ')') depth--;
          j++;
        }
        if (depth === 0) {
          var rep = computeMath(m[1], value.slice(start, j - 1));
          if (rep !== null) { out += rep; i = j; changed = true; continue; }
        }
      }
      out += value.charAt(i++);
    }
    value = out;
    if (!changed) break;
  }
  return value;
}
const flatten = {
  postcssPlugin: 'wdtv-flatten',
  Declaration: function (decl) { decl.value = flattenMath(decl.value); }
};

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'audio'), { recursive: true });

function read(p) { return fs.readFileSync(p, 'utf8'); }
function write(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }
function copy(src, dst) { write(dst, fs.readFileSync(src)); }

/* ---- JS: ES6 -> ES5（目标 Chrome 30 / Android 4.4 WebView） ---- */
const babelOpts = {
  presets: [[presetEnv, {
    targets: { chrome: '30', android: '4.4' },
    modules: false,
    useBuiltIns: false
  }]],
  comments: true,
  compact: false
};
/* 认读弹窗分页：原项目一屏列出全部单词，电视上太挤看不清。
 * 把 showLearn 换成每页 4 个词、带「上一页/下一页 + 页码」的 ES5 版本。 */
function paginateLearn(src) {
  const start = src.indexOf('function showLearn(l, advancing = false) {');
  if (start < 0) return src;
  const end = src.indexOf('\nfunction modal(html)', start);
  if (end < 0) return src;
  const replacement = [
    'function showLearn(l, advancing) {',
    '  preload(l.words);',
    '  var PAGE = 4;',
    '  var idx = l.words.map(function (w, i) { return i; });',
    '  var kin = idx.filter(function (i) { return KIN.has(l.words[i].w); });',
    '  var rest = idx.filter(function (i) { return !KIN.has(l.words[i].w); });',
    '  var order = rest.concat(kin);',
    '  var pages = Math.max(1, Math.ceil(order.length / PAGE));',
    '  var page = 0;',
    '  var tile = function (i) { var w = l.words[i];',
    '    return \'<button class="tile" data-i="\' + i + \'"><span class="p">\' + wordPic(w) + \'</span><b>\' + w.w + \'</b><small>\' + w.zh + \'</small>\' + (w.learnOnly ? \'<span class="tag">认读</span>\' : \'\') + \'</button>\'; };',
    '  function render() {',
    '    var slice = order.slice(page * PAGE, (page + 1) * PAGE);',
    '    var note = l.words.some(function (w) { return w.learnOnly; }) ? \'（灰标的词只认读，不上战场）\' : \'\';',
    '    if (kin.length) note += \' · 含亲属词\';',
    '    modal(\'<h2>\' + (advancing ? \'下一关 · 先认一认\' : \'先认一认\') + \'</h2><p class="sub">第 \' + (page + 1) + \'/\' + pages + \' 页 · 看单词、看图、点一下听读音\' + note + \'</p>\' +',
    '      \'<div class="tiles">\' + slice.map(tile).join(\'\') + \'</div>\' +',
    '      \'<div class="row learn-nav"><button class="b-prev" data-prev\' + (page === 0 ? \' disabled\' : \'\') + \'>◀ 上一页</button>\' +',
    '      \'<span class="pageno">\' + (page + 1) + \' / \' + pages + \'</span>\' +',
    '      \'<button class="b-next" data-next\' + (page >= pages - 1 ? \' disabled\' : \'\') + \'>下一页 ▶</button></div>\' +',
    '      \'<div class="row"><button class="b-sub" data-x>返回</button><button class="b-main" data-go>\' + (advancing ? \'跳过，直接开始\' : \'▶ 开始守卫\') + \'</button></div>\');',
    '    if (window.tvRefreshFocus) window.tvRefreshFocus();',
    '  }',
    '  $(\'#mbox\').onclick = function (e) {',
    '    var t = e.target.closest(\'[data-i]\');',
    '    if (t) {',
    '      if (advancing) { var g = $(\'#mbox\').querySelector(\'[data-go]\'); if (g) g.textContent = \'▶ 开始守卫\'; }',
    '      return sayWord(l.words[+t.dataset.i]);',
    '    }',
    '    if (e.target.closest(\'[data-prev]\') && page > 0) { page--; render(); return; }',
    '    if (e.target.closest(\'[data-next]\') && page < pages - 1) { page++; render(); return; }',
    '    if (e.target.closest(\'[data-x]\')) closeModal();',
    '    if (e.target.closest(\'[data-go]\')) { closeModal(); startGame(l); }',
    '  };',
    '  render();',
    '}',
    ''
  ].join('\n');
  return src.slice(0, start) + replacement + src.slice(end + 1);
}
for (const name of ['desk.js', 'game.js', 'phone-orientation.js', 'word-icons.js']) {
  let source = read(path.join(ROOT, name));
  if (name === 'game.js') source = paginateLearn(source);
  if (name === 'desk.js') {
    // 书页锚点 id 加 tv- 前缀后，同步改这里的选择器（见 HTML 里的 id 重命名）。
    source = source.replace(/getElementById\(book\.dataset\.volume\)/g,
      "getElementById('tv-' + book.dataset.volume)");
  }
  let code = babel.transformSync(source, babelOpts).code;
  // 4.4 WebView 不支持 CSS 自定义属性：把 JS 动态写入的变量换成普通样式
  code = code.replace(/--c:/g, 'background:');
  code = code.replace(/el\.style\.setProperty\('--sk', SKINS\[rnd\(SKINS\.length\)\]\);/g,
    "var sk = SKINS[rnd(SKINS.length)]; el.style.setProperty('--sk', sk);");
  code = code.replace(/el\.style\.setProperty\('--cl', CLOTHES\[rnd\(CLOTHES\.length\)\]\);/g,
    "var cl = CLOTHES[rnd(CLOTHES.length)]; el.style.setProperty('--cl', cl);");
  code = code.replace(/el\.querySelector\('\.sign'\)\.textContent = word\.w;/g,
    "el.querySelector('.sign').textContent = word.w;" +
    " if (sk) el.querySelector('.head').style.background = sk;" +
    " if (cl) el.querySelector('.body').style.background = cl;");
  write(path.join(OUT, name), code);
  console.log('JS  ', name, code.length);
}
// 这两个原本就是 ES5，原样复制，保证数据字节一致
copy(path.join(ROOT, 'words.js'), path.join(OUT, 'words.js'));
copy(path.join(ROOT, 'audio', 'manifest.js'), path.join(OUT, 'audio', 'manifest.js'));

/* ---- CSS: 解析变量 / calc / min / max / clamp ---- */
for (const name of ['desk.css', 'game.css', 'phone-orientation.css']) {
  const css = read(path.join(ROOT, name));
  const result = postcss([customProperties({ preserve: false }), flatten, calc({ preserve: false })])
    .process(css, { from: path.join(ROOT, name) });
  write(path.join(OUT, name), result.css);
  console.log('CSS ', name, result.css.length);
}

/* ---- HTML: 去掉外部依赖，注入兼容层与遥控器适配 ---- */
function transformHtml(srcName, dstName) {
  let html = read(path.join(ROOT, srcName));
  html = html.replace(/<link[^>]+niannianweike\.top[^>]*>/gi, '');
  html = html.replace(/<script[^>]+niannianweike\.top[^>]*><\/script>/gi, '');
  html = html.replace(/<a href="\/tools\/html\/">← 教具库<\/a>/g, '');
  html = html.replace(/<button[^>]*class="project-qr-trigger"[^>]*>联系我<\/button>/g, '');
  if (srcName === 'index.html') {
    html = html.replace(/(<\/div>\s*)(<div class="pea-corner">)/,
      '$1      <a class="mega-link" href="跨8册超级大混战.html">★ 8册超级大混战（952词）</a>\n      $2');
    // 主界面“关于”入口：二维码在上、公众号文字在下
    html = html.replace('<header class="masthead">',
      '<header class="masthead">\n      <button type="button" id="about-btn" class="about-btn">关于 / 关注我们</button>');
    const aboutDialog =
      '  <dialog id="about-dialog" class="about-dialog">\n' +
      '    <div class="about-box">\n' +
      '      <img class="about-qr" src="qrcode-boxhui.jpg" alt="盒子汇公众号二维码">\n' +
      '      <h2>关注微信公众号：盒子汇</h2>\n' +
      '      <p>扫码关注，获取更多英语学习资源</p>\n' +
      '      <form method="dialog"><button class="about-close">关闭</button></form>\n' +
      '    </div>\n' +
      '  </dialog>\n';
    html = html.replace('</body>', aboutDialog + '</body>');
    // 关键：URL hash（如 index.html#volume-0-0）会让浏览器原生滚动到同名 id 的隐藏锚点，
    // 把整本书推出屏幕。把锚点 id 加前缀，hash 就找不到目标，desk.js 仍用 tv- 前缀读取标题。
    html = html.replace(/\sid="(volume-[0-3]-[01])"/g, ' id="tv-$1"');
  }
  // 所有本地 JS/CSS 统一带版本号，避免 WebView 缓存旧脚本导致修复不生效。
  const V = 'v15';
  html = html.replace(/(\.css)(\?[^"']*)?/g, '$1?v=' + V);
  html = html.replace(/(\.js)(\?[^"']*)?/g, '$1?v=' + V);
  const compat = '<script src="compat.js?v=' + V + '"></script>\n';
  const override = '  <link rel="stylesheet" href="tv-override.css?v=' + V + '">\n';
  const adapter = '<script defer src="tv-adapter.js?v=' + V + '"></script>\n';
  html = html.replace('</head>', '  ' + override + '  ' + compat + '</head>');
  html = html.replace('</body>', '  ' + adapter + '</body>');
  write(path.join(OUT, dstName), html);
}
transformHtml('index.html', 'index.html');
const htmls = fs.readdirSync(ROOT).filter(n => n.endsWith('.html') && n !== 'index.html');
for (const name of htmls) transformHtml(name, name);
// 跨 8 册超级大混战：把 8 册合并成一本虚拟书，沿用原游戏引擎的“全册大混战”
{
  let mega = read(path.join(OUT, '三年级上册-Unit1-Making friends.html'));
  mega = mega.replace(/<script src="words\.js"><\/script>/,
    '<script src="words.js"></script>\n<script>window.BOOKS=[{id:"mega",name:"全8册",units:window.BOOKS.reduce(function(a,b){return a.concat(b.units)},[])}];</script>');
  mega = mega.replace(/<script>window\.GAME_CONFIG=\{[^<]*\};?<\/script>/,
    '<script>window.GAME_CONFIG={bookId:"mega",homeHash:null};</script>');
  mega = mega.replace(/<title>[^<]*<\/title>/, '<title>单词保卫战 · 跨8册超级大混战</title>');
  write(path.join(OUT, '跨8册超级大混战.html'), mega);
}
console.log('HTML', htmls.length + 2, 'files');

/* ---- 静态资源与兼容层 ---- */
for (const name of ['compat.js', 'tv-adapter.js', 'tv-override.css']) {
  copy(path.join(STATIC, name), path.join(OUT, name));
}
for (const name of ['qrcode-boxhui.jpg']) {
  copy(path.join(STATIC, name), path.join(OUT, name));
}
for (const name of ['desk-zombie.svg', 'patrol-car.svg', 'pea-guide-doubao.mp3']) {
  copy(path.join(ROOT, name), path.join(OUT, name));
}
const audioDir = path.join(ROOT, 'audio');
for (const name of fs.readdirSync(audioDir)) {
  if (name.endsWith('.mp3')) copy(path.join(audioDir, name), path.join(OUT, 'audio', name));
}
console.log('完成：', OUT);
