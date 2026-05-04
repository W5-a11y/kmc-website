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
  const FSM = {
    v1: { onClick: { A: 'v4' }, onEnter: { C: 'v2', B: 'v3' } },
    v2: { onClick: { C: 'v5' }, onLeave: { C: 'v1' } },
    v3: { onClick: { B: 'v6' }, onLeave: { B: 'v1' } },
    v4: { onClick: { A: { to: 'v1', dissolve: true } },
          onEnter: { C: 'v2', B: 'v3' } },
    v5: { onClick: { C: 'v2' }, onLeave: { C: 'v1' } },
    v6: { onClick: { B: 'v3' }, onLeave: { B: 'v1' } },
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
      if (rule) setState(...Object.values(resolveAndSplit(rule)));
    });
  });

  function resolveAndSplit(rule) {
    const r = resolve(rule);
    return { to: r.to, opts: { dissolve: !!r.dissolve } };
  }
})();
