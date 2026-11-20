const desk = document.querySelector('.desk');
const bookDialog = document.querySelector('#book-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const volumes = document.querySelectorAll('.fallback .unit-volume');
bookDialog.querySelector('.volumes').append(...volumes);
for (const volume of volumes) volume.hidden = true;

for (const book of document.querySelectorAll('.volume-book')) {
  book.addEventListener('click', () => {
    const target = document.getElementById(book.dataset.volume);
    for (const volume of volumes) {
      volume.hidden = volume !== target;
    }
    bookDialog.style.setProperty('--book-color', book.style.getPropertyValue('--book'));
    bookDialog.querySelector('#current-volume').textContent = target.querySelector('h3').textContent;
    if (!bubble.hidden) closeBubble(false);
    bookDialog.showModal();
    bookDialog.querySelector('.book-close').focus({ preventScroll: true });
  });
}

bookDialog.addEventListener('click', (event) => {
  if (event.target === bookDialog) bookDialog.close();
});

const pea = document.querySelector('#pea');
const bubble = document.querySelector('#pea-guide');
const audio = document.querySelector('#pea-audio');
const letters = document.querySelector('#pea-letters');
const line = document.querySelector('#pea-line');
const play = document.querySelector('#pea-play');
const cues = [
  [0, 'ABC', '你好呀，我是小豌豆！选一本英语课本，再挑一个单元。'],
  [6.23, 'APPLE', '僵尸举着英文单词走来了！'],
  [9.13, 'APPLE', '点传送带上的图片卡，听听单词怎么读。'],
  [13.92, 'APPLE', '找到对应的图片卡，拖到僵尸那一行的空地上。'],
  [20.81, 'MATCH', '射手会自动开火。单词对上，两枪打倒僵尸！'],
  [26.33, 'OOPS', '选错会让僵尸加速。每行的小车只能救急一次。'],
  [32.46, 'GO', '小车用完后，再有僵尸冲进来，这局就输了。'],
  [37.21, 'GO', '准备好了？选个单元开始吧！'],
];
// Mouth openings measured from the narration at 20 samples per second, including pauses.
const mouthFrames = atob('AAAAAAAMJCQVJCQkJCQkJAgAAAAAAAojGw0NGAwMGQ8YJCQQDiQkJAoAAAAAAAAAAAAAAAAdJBkPCwsiJBoOEBIQJBMaGRQSFxYADRgkJAAcGyQkDwAAAAAAABIZGAwAECQkJBITCCQkJCQkGA0kJCQkCAAAAAAAAAAAAAAAICQeExANDREbJAAZJBkACA8SDiQVHBwQGSQiDCQkIQoAABskCwokFA0AEiQkJCQkJCAAAAgAAAAKHyQVEBATCSQkJCQAChckJAoUJBgMJCQkDh8kEiQKCAsYCRgkJAoPEiQkJBYAAAAAAAANECQXEQ4JAAsRCgoJJCQjCQAAAA8JJBwAEhQfJBYkJB0NAAkAAAAAAAAAAAAAJCAcGg8kJCQhAAwkJAAdJBsODAwaCyQkJAsAAA8YExUkHR0YEAkkJAAIDiMJACQkJAgLEBMUJCQLAAAAAAAAAAAiJB4WCBAkJAAJIyQkJCQkJA8AJCQXDQsMGCETABMiGAAkJCQQJCQkERIQDCQXCyQdAAkVEQ0LChgVHiQaFhQkJBkAAAAAAAAICg4kJB8RCiIkJCQNACQgFAAAJCQeDCQkDAsWJCQkCggeJCQkAAAAAAAAAAAkJB0KAAoWCSAfGBQkJCQNAAAAAAAQHSQcCgwJAAkkJAwSABokJBwkCyQkJA4kJBkQJCQkAAAAAAAAAAAAAAAAAAkcJCQfCw0SCQ4kJBEKChYkJCQVAAAAAAAAGyQaCg0NDRUkJBAUJCIAGg4AGCQkJAAAJCQWCQAAAAAAAAAAESQcGhQPFB0SGB0JGCQkGgkOEiQkJBUAAAAAChIdCxUXDAsAJCQWAAgYHhcQDyIkAAAkJCQRAAAAAAAAAAAAABoTEw0LESQkGiQhJCQkIQkkJCQeAAAAAAAAHCQkIiEeJB4JFSQbDQsUEwsVGQoNESMkJCQkJAoAAAAAAAsZJCQAABMcCCQfDggJJCQkJCQkDgAAAAAAAAAAAAAAACQkDiQkECIkJCQkJCQAAAAACBcbFAkTHxANDggkJBkkJBYTJCQLJCQkDQAAAAAAAAAAAAAAAAAAAAAAAAAA');
let activeCue = -1;
let frame = 0;

function updateBubble() {
  let next = cues.length - 1;
  while (next > 0 && audio.currentTime < cues[next][0]) next--;
  if (next === activeCue) return;
  activeCue = next;
  const [, word, text] = cues[next];
  if (letters.textContent !== word) {
    letters.replaceChildren(...Array.from(word, (letter, index) => {
      const tile = document.createElement('span');
      tile.textContent = letter;
      tile.style.setProperty('--i', index);
      return tile;
    }));
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
  const opening = reducedMotion.matches ? 0 : (mouthFrames.charCodeAt(Math.floor(audio.currentTime * 20)) || 0);
  pea.toggleAttribute('data-mouth-open', opening > 0);
  pea.style.setProperty('--mouth', opening / 32);
  frame = requestAnimationFrame(speak);
}

function playNarration(restart = false) {
  if (restart) {
    audio.currentTime = 0;
    activeCue = -1;
    updateBubble();
  }
  audio.play().catch(() => {
    if (bubble.hidden || !audio.paused) return;
    line.textContent = '点播放，再听小豌豆讲玩法。';
    play.textContent = '播放';
  });
}

function closeBubble(restoreFocus = true) {
  bubble.hidden = true;
  pea.setAttribute('aria-expanded', 'false');
  audio.pause();
  closeMouth();
  if (restoreFocus) pea.focus({ preventScroll: true });
}

pea.addEventListener('click', () => {
  if (!bubble.hidden) {
    closeBubble();
    return;
  }
  bubble.hidden = false;
  pea.setAttribute('aria-expanded', 'true');
  playNarration(true);
});

document.querySelector('#pea-close').addEventListener('click', () => closeBubble());
desk.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !bubble.hidden) closeBubble();
});
play.addEventListener('click', () => {
  if (audio.paused) playNarration(audio.ended || audio.currentTime === 0);
  else audio.pause();
});
audio.addEventListener('playing', () => {
  closeMouth();
  activeCue = -1;
  play.textContent = '暂停';
  speak();
});
audio.addEventListener('waiting', closeMouth);
audio.addEventListener('timeupdate', updateBubble);
audio.addEventListener('pause', () => {
  closeMouth();
  play.textContent = audio.ended ? '再听一遍' : '继续';
});
audio.addEventListener('ended', () => {
  closeMouth();
  play.textContent = '再听一遍';
});

function resetView() {
  desk.style.setProperty('--pan-x', '0px');
  desk.style.setProperty('--pan-y', '0px');
}

desk.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
  const rect = desk.getBoundingClientRect();
  desk.style.setProperty('--pan-x', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'px');
  desk.style.setProperty('--pan-y', ((event.clientY - rect.top) / rect.height - .5) * 16 + 'px');
});
desk.addEventListener('pointerleave', resetView);
reducedMotion.addEventListener('change', resetView);
document.body.classList.add('desk-ready');

const selectedVolume = location.hash.slice(1);
if (/^volume-[0-3]-[01]$/.test(selectedVolume)) {
  document.querySelector('.volume-book[data-volume="' + selectedVolume + '"]')?.click();
}
