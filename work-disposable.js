/* work-disposable.js
 * ─────────────────────────────────────────────────────────────────
 * Scroll-driven storytelling for #work_1_3 (Figma 699:454 + 905:352).
 *
 * Stage: 1440 × 1024. Section is pinned by ScrollTrigger while a single
 * GSAP timeline scrubs from State 1 (disposable text alone on cream)
 * to State 2 (frame deco assembled around it: bg-block + bars + caps).
 * ───────────────────────────────────────────────────────────────── */

(() => {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[work-disposable] GSAP / ScrollTrigger missing.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector('#work_1_3');
  if (!section) return;

  const TOKENS = {
    cream: '#F4F3EF',
    olive: '#645D45',
    gray:  '#FFFFFF',  /* bg-block — white + difference produces black-outside / cream-inside on text */
    dark:  '#201D13',
  };

  // Initial (State 0) — frame hidden, text resting.
  // NOTE: do NOT touch `filter` here — CSS owns the SVG color-remap filter,
  // and GSAP overriding `filter` would clobber the cream tint.
  // Scale baseline is 1.5× (matches CSS); we just micro-tween around it.
  gsap.set('.aw-w3-img', {
    yPercent: 6,
    scale: 1.108,         /* 1.5 × 0.985 — keeps the 1.5× baseline */
    opacity: 0.92,
    transformOrigin: 'center center',
  });

  gsap.set('.aw-w3-frame__rect', {
    scaleX: 0,
    transformOrigin: 'left center',
    backgroundColor: TOKENS.gray,
    opacity: 1,
  });

  gsap.set([
    '.aw-w3-frame__bar--l',
    '.aw-w3-frame__sm--l',
    '.aw-w3-frame__lg--l',
  ], { xPercent: -180, opacity: 0, backgroundColor: TOKENS.dark });

  gsap.set([
    '.aw-w3-frame__bar--r',
    '.aw-w3-frame__sm--r',
    '.aw-w3-frame__lg--r',
  ], { xPercent: 180, opacity: 0, backgroundColor: TOKENS.dark });

  // Master timeline pinned + scrubbed by scroll
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=220%',         /* longer travel = frame opens more slowly while scrolling */
      pin: true,
      pinSpacing: true,
      pinType: 'transform',  /* avoid position:fixed snap-back at pin release */
      scrub: 0.65,           /* a bit more smoothing as the scrub follows the wheel */
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Phase A — text settles in to baseline 1.5× (no filter tween — CSS owns
  // the color remap)
  tl.to('.aw-w3-img', {
    yPercent: 0,
    scale: 1.125,
    opacity: 1,
    duration: 0.30,
  }, 0);

  // Phase B — bg-block sweeps in
  tl.to('.aw-w3-frame__rect', {
    scaleX: 1,
    duration: 0.35,
    ease: 'expo.out',
  }, 0.15);

  // Phase C — bars → small caps → large caps
  tl.to([
    '.aw-w3-frame__bar--l',
    '.aw-w3-frame__bar--r',
  ], { xPercent: 0, opacity: 1, duration: 0.20, stagger: 0.04 }, 0.40);

  tl.to([
    '.aw-w3-frame__sm--l',
    '.aw-w3-frame__sm--r',
  ], { xPercent: 0, opacity: 1, duration: 0.18, stagger: 0.05 }, 0.55);

  tl.to([
    '.aw-w3-frame__lg--l',
    '.aw-w3-frame__lg--r',
  ], { xPercent: 0, opacity: 1, duration: 0.20, stagger: 0.05 }, 0.68);

  // Phase D — hold at baseline 1.5× scale through unpin
  tl.to('.aw-w3-img', { scale: 1.125, duration: 0.16 }, 0.84);

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tl.progress(1).pause();
  }
})();
