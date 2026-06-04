/* SSV Episodes — prototype interaction state machine.
   Mirrors Figma 973:620 prototype: hover/click triggers between v1..v6.
   Smart Animate ≈ 1250ms cubic-bezier(0,0,0,1) (handled in CSS).
   v4 → v1 is a 300ms DISSOLVE (EASE_OUT) — applied via .is-dissolve class. */

(() => {
  const eps = document.getElementById('eps');
  if (!eps) return;

  // [state]: { onClick: { imgKey: nextState | { to, dissolve } },
  //            onEnter: { imgKey: nextState },
  //            onLeave: { imgKey: nextState } }
  // YouTube link per detail state (A=cart=EP3, C=red coat=EP2, B=couch=EP1).
  const EP_URLS = {
    v4: 'https://www.youtube.com/watch?v=odrQGz0apVY', // EP3: Leaving the Life I Built
    v5: 'https://www.youtube.com/watch?v=0NDoSsFOoRY', // EP2: A Mother's Plan
    v6: 'https://www.youtube.com/watch?v=ujCVfFhbd3Y', // EP1: A Trans Couple in Silicon Valley
  };

  // [state]: { onClick: { imgKey: nextState | { to, dissolve } | { url } }, ... }
  // First click on an image opens its detail state (synopsis + blurred image).
  // A second click on the focused image opens that episode on YouTube.
  const FSM = {
    v1: { onClick: { A: 'v4' }, onEnter: { C: 'v2', B: 'v3' } },
    v2: { onClick: { C: 'v5' }, onLeave: { C: 'v1' } },
    v3: { onClick: { B: 'v6' }, onLeave: { B: 'v1' } },
    v4: { onClick: { A: { url: EP_URLS.v4 } }, onEnter: { C: 'v2', B: 'v3' } },
    v5: { onClick: { C: { url: EP_URLS.v5 } }, onLeave: { C: 'v1' } },
    v6: { onClick: { B: { url: EP_URLS.v6 } }, onLeave: { B: 'v1' } },
  };

  const setState = (next, { dissolve = false } = {}) => {
    if (!next || eps.dataset.state === next) return;
    if (dissolve) {
      eps.classList.add('is-dissolve');
      // Strip the override after the dissolve completes so subsequent
      // transitions revert to the default 1250ms Smart-Animate timing.
      window.setTimeout(() => eps.classList.remove('is-dissolve'), 320);
    }
    eps.dataset.state = next;
  };

  const resolve = (action) =>
    typeof action === 'string' ? { to: action } : action;

  eps.querySelectorAll('.img').forEach((el) => {
    const key = el.dataset.img; // "A" | "B" | "C"

    el.addEventListener('mouseenter', () => {
      const rule = FSM[eps.dataset.state]?.onEnter?.[key];
      if (rule) setState(...Object.values(resolveAndSplit(rule)));
    });

    el.addEventListener('mouseleave', () => {
      const rule = FSM[eps.dataset.state]?.onLeave?.[key];
      if (rule) setState(...Object.values(resolveAndSplit(rule)));
    });

    el.addEventListener('click', () => {
      const rule = FSM[eps.dataset.state]?.onClick?.[key];
      if (!rule) return;
      const r = resolve(rule);
      if (r.url) {
        window.open(r.url, '_blank', 'noopener');
        return;
      }
      setState(...Object.values(resolveAndSplit(rule)));
    });
  });

  function resolveAndSplit(rule) {
    const r = resolve(rule);
    return { to: r.to, opts: { dissolve: !!r.dissolve } };
  }
})();
