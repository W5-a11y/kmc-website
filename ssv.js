/* ═══════════════════════════════════════════════
   SSV — Surviving Silicon Valley (interactions)
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!document.querySelector('.page-ssv')) return;

  /* ─── Elements ──────────────────────────── */
  var sections = Array.from(document.querySelectorAll('.ssv-section'));
  var nav      = document.getElementById('ssv-nav');
  var TOTAL    = sections.length;          // 6
  var current  = 0;
  var busy     = false;
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = reduced ? 20 : 950;
  var htmlRoot = document.documentElement;

/* ─── Nav theme ─────────────────────────── */
  function setNavTheme(idx) {
    if (!nav) return;
    var theme = sections[idx].getAttribute('data-theme') || 'dark';
    nav.classList.toggle('ssv-nav--light',   theme === 'light');
    nav.classList.toggle('ssv-nav--landing', idx === 0);
  }

  /* ─── Go to section ─────────────────────── */
  function goTo(idx) {
    if (idx < 0 || idx >= TOTAL || idx === current || busy) return;
    busy = true;
    var from = current;
    current  = idx;

    /* — Landing → About: SSV window morphs to right ─
     *
     * Timeline (from click):
     *   0ms    : mask starts shrinking (0.95s), video snaps out (0.3s)
     *   350ms  : About activates — about_ssv.svg starts expanding from
     *            scale(0.12) as mask is still collapsing → visual hand-off
     *   1050ms : mask is fully gone; about_ssv.svg is ~90% expanded
     */
    if (from === 0 && idx === 1) {
      sections[0].classList.add('is-morphing');

      setTimeout(function () {
        sections[1].classList.add('is-active');
      }, reduced ? 10 : 350);

      setTimeout(function () {
        sections[0].classList.add('is-gone');
      }, reduced ? 20 : 1050);
    }

    /* — About → forward: slide sheets up as paper cards ─ */
    if (idx > 1) {
      sections[idx].classList.add('is-visible');
    }

    /* — Going backwards ─────────────────── */
    if (idx < from) {
      for (var i = from; i > Math.max(idx, 1); i--) {
        sections[i].classList.remove('is-visible');
      }
      if (idx === 0) {
        // Return to landing: reverse morph
        sections[0].classList.remove('is-morphing', 'is-gone');
        sections[1].classList.remove('is-active');
      } else if (idx === 1 && from > 1) {
        sections[1].classList.add('is-active');
      }
    }

    setNavTheme(idx);
    setTimeout(function () { busy = false; }, DURATION);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ─── Initialise ────────────────────────── */
  setNavTheme(0);

  /* ─── S2 hero CTA hover (GSAP) ─ */
  if (!reduced && window.gsap) {
    document.querySelectorAll('.js-ssv-hero-cta').forEach(function (el) {
      var icon = el.querySelector('.ssv-tl__cta-icon');
      el.addEventListener('mouseenter', function () {
        if (icon) window.gsap.to(icon, { scale: 1.1, duration: 0.32, ease: 'power2.out' });
        window.gsap.to(el, { color: '#ff281b', duration: 0.24, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', function () {
        if (icon) window.gsap.to(icon, { scale: 1, duration: 0.32, ease: 'power2.out' });
        window.gsap.to(el, { color: '#f4f3ef', duration: 0.24, ease: 'power2.out' });
      });
    });
  }

  /* ─── AMC paragraph reveal: hover on date/title ─ */
  var amcDateTrigger = document.querySelector('.js-amc-date-trigger');
  var amcTitleTrigger = document.querySelector('.js-amc-title-trigger');
  var amcBlock = document.querySelector('.js-amc-reveal');
  var amcLines = Array.from(document.querySelectorAll('.js-amc-reveal .line'));
  var amcTween = null;
  var amcHideTimer = null;

  if (amcBlock && amcLines.length) {
    function showAmcBlock() {
      if (amcHideTimer) {
        clearTimeout(amcHideTimer);
        amcHideTimer = null;
      }
      amcBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (amcTween) amcTween.kill();
        window.gsap.set(amcLines, { opacity: 0, y: 30 });
        amcTween = window.gsap.to(amcLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        amcLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideAmcBlock() {
      amcBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (amcTween) amcTween.kill();
        window.gsap.set(amcLines, { opacity: 0, y: 30 });
      } else {
        amcLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueHide() {
      if (amcHideTimer) clearTimeout(amcHideTimer);
      amcHideTimer = window.setTimeout(hideAmcBlock, 70);
    }

    [amcDateTrigger, amcTitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showAmcBlock);
      trigger.addEventListener('mouseleave', queueHide);
    });

    amcBlock.addEventListener('mouseenter', function () {
      if (amcHideTimer) {
        clearTimeout(amcHideTimer);
        amcHideTimer = null;
      }
    });
    amcBlock.addEventListener('mouseleave', queueHide);
  }

  /* ─── Premiere description: reveal on date/title hover ─ */
  var premiereDateTrigger = document.querySelector('.js-premiere-date-trigger');
  var premiereTitleTrigger = document.querySelector('.js-premiere-title-trigger');
  var premiereBlock = document.querySelector('.js-premiere-reveal');
  var premiereLines = Array.from(document.querySelectorAll('.js-premiere-reveal .line'));
  var premiereTween = null;
  var premiereHideTimer = null;

  if (premiereBlock && premiereLines.length) {
    function showPremiereBlock() {
      if (premiereHideTimer) {
        clearTimeout(premiereHideTimer);
        premiereHideTimer = null;
      }
      premiereBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (premiereTween) premiereTween.kill();
        window.gsap.set(premiereLines, { opacity: 0, y: 30 });
        premiereTween = window.gsap.to(premiereLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        premiereLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hidePremiereBlock() {
      premiereBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (premiereTween) premiereTween.kill();
        window.gsap.set(premiereLines, { opacity: 0, y: 30 });
      } else {
        premiereLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queuePremiereHide() {
      if (premiereHideTimer) clearTimeout(premiereHideTimer);
      premiereHideTimer = window.setTimeout(hidePremiereBlock, 70);
    }

    [premiereDateTrigger, premiereTitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showPremiereBlock);
      trigger.addEventListener('mouseleave', queuePremiereHide);
    });

    premiereBlock.addEventListener('mouseenter', function () {
      if (premiereHideTimer) {
        clearTimeout(premiereHideTimer);
        premiereHideTimer = null;
      }
    });
    premiereBlock.addEventListener('mouseleave', queuePremiereHide);
  }

  /* ─── Interior description: reveal on date/title hover ─ */
  var interiorDateTrigger = document.querySelector('.js-interior-date-trigger');
  var interiorTitleTrigger = document.querySelector('.js-interior-title-trigger');
  var interiorBlock = document.querySelector('.js-interior-reveal');
  var interiorLines = Array.from(document.querySelectorAll('.js-interior-reveal .line'));
  var interiorTween = null;
  var interiorHideTimer = null;

  if (interiorBlock && interiorLines.length) {
    function showInteriorBlock() {
      if (interiorHideTimer) {
        clearTimeout(interiorHideTimer);
        interiorHideTimer = null;
      }
      interiorBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (interiorTween) interiorTween.kill();
        window.gsap.set(interiorLines, { opacity: 0, y: 30 });
        interiorTween = window.gsap.to(interiorLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        interiorLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideInteriorBlock() {
      interiorBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (interiorTween) interiorTween.kill();
        window.gsap.set(interiorLines, { opacity: 0, y: 30 });
      } else {
        interiorLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueInteriorHide() {
      if (interiorHideTimer) clearTimeout(interiorHideTimer);
      interiorHideTimer = window.setTimeout(hideInteriorBlock, 70);
    }

    [interiorDateTrigger, interiorTitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showInteriorBlock);
      trigger.addEventListener('mouseleave', queueInteriorHide);
    });

    interiorBlock.addEventListener('mouseenter', function () {
      if (interiorHideTimer) {
        clearTimeout(interiorHideTimer);
        interiorHideTimer = null;
      }
    });
    interiorBlock.addEventListener('mouseleave', queueInteriorHide);
  }

  /* ─── Culinary description: reveal on date/title hover ─ */
  var culinaryDateTrigger = document.querySelector('.js-culinary-date-trigger');
  var culinaryTitleTrigger = document.querySelector('.js-culinary-title-trigger');
  var culinaryBlock = document.querySelector('.js-culinary-reveal');
  var culinaryLines = Array.from(document.querySelectorAll('.js-culinary-reveal .line'));
  var culinaryTween = null;
  var culinaryHideTimer = null;

  if (culinaryBlock && culinaryLines.length) {
    function showCulinaryBlock() {
      if (culinaryHideTimer) {
        clearTimeout(culinaryHideTimer);
        culinaryHideTimer = null;
      }
      culinaryBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (culinaryTween) culinaryTween.kill();
        window.gsap.set(culinaryLines, { opacity: 0, y: 30 });
        culinaryTween = window.gsap.to(culinaryLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        culinaryLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideCulinaryBlock() {
      culinaryBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (culinaryTween) culinaryTween.kill();
        window.gsap.set(culinaryLines, { opacity: 0, y: 30 });
      } else {
        culinaryLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueCulinaryHide() {
      if (culinaryHideTimer) clearTimeout(culinaryHideTimer);
      culinaryHideTimer = window.setTimeout(hideCulinaryBlock, 70);
    }

    [culinaryDateTrigger, culinaryTitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showCulinaryBlock);
      trigger.addEventListener('mouseleave', queueCulinaryHide);
    });

    culinaryBlock.addEventListener('mouseenter', function () {
      if (culinaryHideTimer) {
        clearTimeout(culinaryHideTimer);
        culinaryHideTimer = null;
      }
    });
    culinaryBlock.addEventListener('mouseleave', queueCulinaryHide);
  }

  /* ─── Valkyrie description: reveal on date/title hover ─ */
  var valkyrieDateTrigger = document.querySelector('.js-valkyrie-date-trigger');
  var valkyrieTitleTrigger = document.querySelector('.js-valkyrie-title-trigger');
  var valkyrieBlock = document.querySelector('.js-valkyrie-reveal');
  var valkyrieLines = Array.from(document.querySelectorAll('.js-valkyrie-reveal .line'));
  var valkyrieTween = null;
  var valkyrieHideTimer = null;

  if (valkyrieBlock && valkyrieLines.length) {
    function showValkyrieBlock() {
      if (valkyrieHideTimer) {
        clearTimeout(valkyrieHideTimer);
        valkyrieHideTimer = null;
      }
      valkyrieBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (valkyrieTween) valkyrieTween.kill();
        window.gsap.set(valkyrieLines, { opacity: 0, y: 30 });
        valkyrieTween = window.gsap.to(valkyrieLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        valkyrieLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideValkyrieBlock() {
      valkyrieBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (valkyrieTween) valkyrieTween.kill();
        window.gsap.set(valkyrieLines, { opacity: 0, y: 30 });
      } else {
        valkyrieLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueValkyrieHide() {
      if (valkyrieHideTimer) clearTimeout(valkyrieHideTimer);
      valkyrieHideTimer = window.setTimeout(hideValkyrieBlock, 70);
    }

    [valkyrieDateTrigger, valkyrieTitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showValkyrieBlock);
      trigger.addEventListener('mouseleave', queueValkyrieHide);
    });

    valkyrieBlock.addEventListener('mouseenter', function () {
      if (valkyrieHideTimer) {
        clearTimeout(valkyrieHideTimer);
        valkyrieHideTimer = null;
      }
    });
    valkyrieBlock.addEventListener('mouseleave', queueValkyrieHide);
  }

  /* ─── Web3 description: reveal on date/title hover ─ */
  var web3DateTrigger = document.querySelector('.js-web3-date-trigger');
  var web3TitleTrigger = document.querySelector('.js-web3-title-trigger');
  var web3Block = document.querySelector('.js-web3-reveal');
  var web3Lines = Array.from(document.querySelectorAll('.js-web3-reveal .line'));
  var web3Tween = null;
  var web3HideTimer = null;

  if (web3Block && web3Lines.length) {
    function showWeb3Block() {
      if (web3HideTimer) {
        clearTimeout(web3HideTimer);
        web3HideTimer = null;
      }
      web3Block.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (web3Tween) web3Tween.kill();
        window.gsap.set(web3Lines, { opacity: 0, y: 30 });
        web3Tween = window.gsap.to(web3Lines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        web3Lines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideWeb3Block() {
      web3Block.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (web3Tween) web3Tween.kill();
        window.gsap.set(web3Lines, { opacity: 0, y: 30 });
      } else {
        web3Lines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueWeb3Hide() {
      if (web3HideTimer) clearTimeout(web3HideTimer);
      web3HideTimer = window.setTimeout(hideWeb3Block, 70);
    }

    [web3DateTrigger, web3TitleTrigger].forEach(function (trigger) {
      if (!trigger) return;
      trigger.addEventListener('mouseenter', showWeb3Block);
      trigger.addEventListener('mouseleave', queueWeb3Hide);
    });

    web3Block.addEventListener('mouseenter', function () {
      if (web3HideTimer) {
        clearTimeout(web3HideTimer);
        web3HideTimer = null;
      }
    });
    web3Block.addEventListener('mouseleave', queueWeb3Hide);
  }

  /* ─── Back-to-top area description: reveal on hover ─ */
  var backTrigger = document.querySelector('.ssv-tl__back-btn');
  var backBlock = document.querySelector('.js-back-reveal');
  var backLines = Array.from(document.querySelectorAll('.js-back-reveal .line'));
  var backTween = null;
  var backHideTimer = null;

  if (backTrigger && backBlock && backLines.length) {
    function showBackBlock() {
      if (backHideTimer) {
        clearTimeout(backHideTimer);
        backHideTimer = null;
      }
      backBlock.classList.add('is-open');
      if (window.gsap && !reduced) {
        if (backTween) backTween.kill();
        window.gsap.set(backLines, { opacity: 0, y: 30 });
        backTween = window.gsap.to(backLines, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out'
        });
      } else {
        backLines.forEach(function (line) {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
      }
    }

    function hideBackBlock() {
      backBlock.classList.remove('is-open');
      if (window.gsap && !reduced) {
        if (backTween) backTween.kill();
        window.gsap.set(backLines, { opacity: 0, y: 30 });
      } else {
        backLines.forEach(function (line) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(30px)';
        });
      }
    }

    function queueBackHide() {
      if (backHideTimer) clearTimeout(backHideTimer);
      backHideTimer = window.setTimeout(hideBackBlock, 70);
    }

    backTrigger.addEventListener('mouseenter', showBackBlock);
    backTrigger.addEventListener('mouseleave', queueBackHide);
    backBlock.addEventListener('mouseenter', function () {
      if (backHideTimer) {
        clearTimeout(backHideTimer);
        backHideTimer = null;
      }
    });
    backBlock.addEventListener('mouseleave', queueBackHide);
  }

  /* ─── Landing: click anywhere → About ──── */
  sections[0].addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    next();
  });

  /* ─── data-target links ──────────────────── */
  document.querySelectorAll('.js-ssv-go').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var t = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(t)) return;
      /* Single-section timeline page: “Watch Episodes” (2) → scroll to #ssv-s2 */
      if (t === 2) {
        var s2 = document.getElementById('ssv-s2');
        if (s2) {
          s2.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          try {
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search + '#ssv-s2');
            }
          } catch (err) { /* ignore */ }
        }
        return;
      }
      goTo(t);
    });
  });

  var offlineLink = document.querySelector('.js-ssv-scroll-offline');
  if (offlineLink) {
    offlineLink.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('ssv-tl-events');
      if (!target) return;
      if (current !== 1) goTo(1);
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }, reduced ? 20 : 160);
    });
  }

  /* ─── "Past Episodes on Youtube" next btn ─ */
  var nextBtn = document.querySelector('.js-ssv-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      next();
    });
  }

  /* ─── "Back to Episodes" prev btn ────────── */
  var prevBtn = document.querySelector('.js-ssv-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      prev();
    });
  }

  /* ─── Back to top buttons ────────────────── */
  document.querySelectorAll('.js-back-to-top').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      // Timeline section uses its own scroll container.
      var timelineSection = document.querySelector('.ssv-section.ssv-tl');
      if (timelineSection) {
        timelineSection.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      }

      // Return to the first section in this page flow.
      if (current !== 0) goTo(0);

      // Fallback for any native page scroll.
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ─── Wheel ─────────────────────────────── */
  var delta = 0, wTimer;
  document.addEventListener('wheel', function (e) {
    if (TOTAL <= 1) return; // single-section mode: allow native page scroll
    // Allow native scroll inside the timeline (s2) once active
    if (current >= 1) {
      var sec = sections[current];
      if (sec && sec.scrollHeight > sec.clientHeight + 2) {
        var atTop    = sec.scrollTop <= 0;
        var atBottom = sec.scrollTop >= sec.scrollHeight - sec.clientHeight - 2;
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop)    return;
      }
      // Legacy support for old screening inner if present
      var inner = sec ? sec.querySelector('.ssv-screening__inner') : null;
      if (inner && e.deltaY > 0 &&
          inner.scrollTop < inner.scrollHeight - inner.clientHeight - 2) return;
    }
    e.preventDefault();
    delta += e.deltaY;
    clearTimeout(wTimer);
    wTimer = setTimeout(function () { delta = 0; }, 280);
    if (Math.abs(delta) < 80) return;
    if (delta > 0) next(); else prev();
    delta = 0;
  }, { passive: false });

  /* ─── Touch ──────────────────────────────── */
  var ty = 0;
  document.addEventListener('touchstart', function (e) {
    ty = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (TOTAL <= 1) return; // single-section mode: allow native scroll
    // Only block scroll on landing (s1); allow native scroll on timeline
    if (current === 0) e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', function (e) {
    var dy = ty - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 44) return;
    if (dy > 0) next(); else prev();
  }, { passive: true });

  /* ─── Keyboard ───────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowUp')                     { e.preventDefault(); prev(); }
  });

  /* ─── Other Content: drag + auto-scroll ─── */
  var track = document.querySelector('.ssv-other__scroll');
  if (track) {
    var drag = false, sx = 0, sl = 0;

    track.addEventListener('mousedown', function (e) {
      drag = true; sx = e.pageX; sl = track.scrollLeft;
    });
    track.addEventListener('mousemove', function (e) {
      if (!drag) return;
      e.preventDefault();
      track.scrollLeft = sl - (e.pageX - sx);
    });
    track.addEventListener('mouseup',    function () { drag = false; });
    track.addEventListener('mouseleave', function () { drag = false; });

    var raf, speed = 0.55;
    function autoScroll() {
      if (!drag) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
          track.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(autoScroll);
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        autoScroll();
      } else {
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.3 }).observe(track);
  }

  /* ─── Hero parallax: scroll + mouse on title/content marks ─ */
  (function heroParallax() {
    if (reduced) return;
    var hero    = document.getElementById('ssv-hero-poster');
    var title   = document.querySelector('.ssv-hero__title-mark');
    var content = document.querySelector('.ssv-hero__content-mark');
    if (!hero || !title || !content) return;

    var scrollY = 0, mouseX = 0, mouseY = 0;
    var tx = 0, ty = 0;          // smoothed mouse offsets for title
    var rafId = null;

    function onScroll() { scrollY = window.scrollY || window.pageYOffset || 0; queue(); }
    function onMouse(e) {
      var r = hero.getBoundingClientRect();
      // -1 .. 1 from hero center
      mouseX = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouseY = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      queue();
    }
    function onLeave() { mouseX = 0; mouseY = 0; queue(); }

    function queue() {
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    function tick() {
      rafId = null;
      var h = window.innerHeight || 1;
      // progress 0..1 across one viewport of scroll
      var p = Math.max(0, Math.min(1, scrollY / h));

      // Scroll: title drifts up + lightly scales down + fades
      var titleY     = -80 * p;
      var titleScale = 1 - 0.04 * p;
      var titleOp    = 1 - 0.15 * p;
      // Content drifts at half speed (parallax depth)
      var contentY   = -30 * p;

      // Mouse parallax: smoothed lerp toward target
      var targetX = mouseX * 6;   // ±6px
      var targetY = mouseY * 4;   // ±4px
      tx += (targetX - tx) * 0.12;
      ty += (targetY - ty) * 0.12;

      title.style.transform   = 'translate3d(' + tx.toFixed(2) + 'px,' + (titleY + ty).toFixed(2) + 'px,0) scale(' + titleScale.toFixed(4) + ')';
      title.style.opacity     = titleOp.toFixed(3);
      content.style.transform = 'translate3d(' + (tx * 0.4).toFixed(2) + 'px,' + (contentY + ty * 0.4).toFixed(2) + 'px,0)';

      // Keep ticking while mouse-smoothing settles
      if (Math.abs(targetX - tx) > 0.05 || Math.abs(targetY - ty) > 0.05) queue();
    }

    // Wait for the entrance animation to finish before taking over transforms,
    // so we don't fight the CSS keyframes (~1.4s total: title delay 0.15 + 1.25).
    setTimeout(function () {
      window.addEventListener('scroll',     onScroll, { passive: true });
      hero.addEventListener('mousemove',    onMouse,  { passive: true });
      hero.addEventListener('mouseleave',   onLeave,  { passive: true });
      onScroll();
    }, 1500);
  })();

})();
