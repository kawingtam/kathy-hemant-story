const pages = [...document.querySelectorAll('.page')];
const play = document.querySelector('#play');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

let current = 0;
let playing = false;
let previousTime = 0;
let queued = false;

const clamp = n => Math.max(0, Math.min(1, n));

document.querySelector('#scroll-space').style.height =
  `${100 + (pages.length - 1) * 100}vh`;


function render() {
  queued = false;

  const progress = clamp(
    scrollY /
    (document.documentElement.scrollHeight - innerHeight)
  );

  const position = progress * (pages.length - 1);

  current = Math.round(position);

  pages.forEach((page, i) => {
    if (Math.abs(i - current) <= 2) {
      page.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }

    const opacity = reduced.matches
      ? Number(i === current)
      : clamp((.65 - Math.abs(i - position)) / .3);

    const visible = opacity > 0;

    page.classList.toggle('active', visible);

    page.inert = i !== current;

    page.setAttribute(
      'aria-hidden',
      String(i !== current)
    );

    page.style.zIndex =
      String(pages.length - i);

    page.style.opacity =
      opacity;

    page.style.transform = reduced.matches
      ? 'none'
      : `translateY(${(i - position) * 22}px)`;
  });

  document.querySelector('#count').textContent =
    `${String(current + 1).padStart(2, '0')} / ${pages.length}`;

  document.querySelector('#previous').disabled =
    current === 0;

  document.querySelector('#next').disabled =
    current === pages.length - 1;
}


function stop() {
  playing = false;

  play.textContent =
    '▶ Play story';

  play.setAttribute(
    'aria-label',
    'Play story automatically'
  );
}


function go(index) {
  stop();

  window.scrollTo({
    top:
      Math.max(
        0,
        Math.min(
          pages.length - 1,
          index
        )
      ) * innerHeight,

    behavior:
      reduced.matches
        ? 'instant'
        : 'smooth'
  });
}


function tick(time) {
  if (!playing) return;

  if (previousTime) {
    window.scrollBy(
      0,
      (time - previousTime) *
      innerHeight /
      7500
    );
  }

  previousTime = time;

  const atEnd =
    scrollY >=
    document.documentElement.scrollHeight -
    innerHeight -
    1;

  if (atEnd) {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });

    previousTime = 0;
  }

  requestAnimationFrame(tick);
}


play.addEventListener(
  'click',
  () => {
    if (playing) {
      return stop();
    }

    if (current === pages.length - 1) {
      window.scrollTo(0, 0);
    }

    playing = true;
    previousTime = 0;

    play.textContent =
      'Ⅱ Pause story';

    play.setAttribute(
      'aria-label',
      'Pause story'
    );

    requestAnimationFrame(tick);
  }
);


document
  .querySelector('#previous')
  .addEventListener(
    'click',
    () => go(current - 1)
  );


document
  .querySelector('#next')
  .addEventListener(
    'click',
    () => go(current + 1)
  );


document
  .querySelector('#replay')
  .addEventListener(
    'click',
    () => go(0)
  );


[
  'wheel',
  'touchstart'
].forEach(event =>
  window.addEventListener(
    event,
    stop,
    {
      passive: true
    }
  )
);


window.addEventListener(
  'keydown',
  e => {
    if (e.target.matches('input')) {
      return;
    }

    if (
      [
        'ArrowDown',
        'ArrowRight',
        'PageDown'
      ].includes(e.key)
    ) {
      e.preventDefault();
      go(current + 1);
    }

    else if (
      [
        'ArrowUp',
        'ArrowLeft',
        'PageUp'
      ].includes(e.key)
    ) {
      e.preventDefault();
      go(current - 1);
    }

    else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    }

    else if (e.key === 'End') {
      e.preventDefault();
      go(pages.length - 1);
    }

    else if (e.key === ' ') {
      stop();
    }
  }
);


document.addEventListener(
  'visibilitychange',
  () => {
    if (document.hidden) {
      stop();
    }
  }
);


window.addEventListener(
  'scroll',
  () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(render);
    }
  },
  {
    passive: true
  }
);


window.addEventListener(
  'resize',
  render
);


reduced.addEventListener(
  'change',
  () => {
    stop();
    render();
  }
);


render();