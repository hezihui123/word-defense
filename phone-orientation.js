(() => {
  const orientation = matchMedia('(orientation: portrait)');
  const phone = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches
      && Math.min(screen.width, screen.height) < 600);
  if (!phone) return;

  const notice = document.createElement('dialog');
  notice.className = 'rotate-phone';
  notice.setAttribute('aria-labelledby', 'rotate-title');
  notice.innerHTML = '<span aria-hidden="true">↻</span><h2 id="rotate-title">请把手机横过来</h2><p>横屏后即可继续。</p>';
  document.body.append(notice);
  notice.addEventListener('cancel', event => event.preventDefault());
  window.addEventListener('keydown', event => {
    if (notice.open) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);

  function update() {
    if (orientation.matches) {
      if (typeof G !== 'undefined' && G && !G.over && !G.paused) togglePause(true);
      if (!notice.open) notice.showModal();
    } else if (notice.open) {
      notice.close();
    }
  }
  orientation.addEventListener('change', update);
  window.addEventListener('pageshow', update);
  update();
})();
