/* SSV Landing — Figma Flow 5 driver.
 * Cycles the mask SVG through Exclude1→6 each ~800ms (matches Figma
 * AFTER_TIMEOUT prototype timing). After Exclude6, landing fades out
 * and scrolls into #ssv-hero-poster. */

(() => {
  const flow = document.getElementById('ssv-flow');
  const landing = document.getElementById('ssv-s1');
  const hero = document.getElementById('ssv-hero-poster');
  const mask = document.getElementById('ssv-flow-mask');
  if (!flow || !landing || !hero || !mask) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FRAMES = [
    'assets/ssv/landing-flow/Exclude1.svg',
    'assets/ssv/landing-flow/Exclude2.svg',
    'assets/ssv/landing-flow/Exclude3.svg',
    'assets/ssv/landing-flow/Exclude4.svg',
    'assets/ssv/landing-flow/Exclude5.svg',
    'assets/ssv/landing-flow/Exclude6.svg',
  ];

  const HOLD = 800;       // ms each frame holds (Figma AFTER_TIMEOUT)
  const FADE_OUT = 700;

  // Preload all frames so swaps are instant.
  FRAMES.forEach((src) => { const i = new Image(); i.src = src; });

  function setStep(n) { flow.setAttribute('data-step', String(n)); }
  function swap(idx) { mask.src = FRAMES[idx]; }

  let t = 0;
  const at = (delay, fn) => { t += delay; setTimeout(fn, t); };

  // Step 1 already shown via HTML (Exclude1.svg). Cycle 2→6.
  for (let i = 1; i < FRAMES.length; i++) {
    at(HOLD, () => { swap(i); setStep(i + 1); });
  }

  // After last frame: fade landing, scroll into hero, unmount.
  at(HOLD, () => {
    landing.classList.add('is-finished');
    hero.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
  at(FADE_OUT, () => { landing.style.display = 'none'; });

  if (reduce) {
    setStep(6);
    landing.style.display = 'none';
  }

  // Click-to-skip
  flow.addEventListener('click', () => {
    landing.classList.add('is-finished');
    hero.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => { landing.style.display = 'none'; }, FADE_OUT);
  });
})();
