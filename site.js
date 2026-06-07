/* ─────────────────────────────────────────
   site.js — KMC+LUCAS Shared JS
   Requires: GSAP + ScrollTrigger (loaded before this file)
   ───────────────────────────────────────── */

(function () {
  'use strict';

  /* ══════════════════════════════════════
     1. GSAP SETUP
  ══════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ══════════════════════════════════════
     2. PAGE TRANSITION (DISSOLVE)
     Mirrors Figma: DISSOLVE, 1.25s, slow ease
  ══════════════════════════════════════ */

  const PAGE_WRAP = document.querySelector('.page-wrap');

  /* Fade in on load */
  if (PAGE_WRAP) {
    gsap.fromTo(PAGE_WRAP,
      { opacity: 0 },
      { opacity: 1, duration: 0.9, ease: 'power2.out', clearProps: 'opacity' }
    );
    /* bfcache 恢复（浏览器后退）时重置 opacity，防止页面停在透明 */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        gsap.set(PAGE_WRAP, { opacity: 1, clearProps: 'opacity' });
        /* Reset body bg morph leftover (cream→red→dark timeline can leave
           inline backgroundColor at #201d13 on bfcache restore). */
        document.body.style.backgroundColor = '#f4f3ef';
        /* Clear any GSAP-applied filter/transform on services items so
           bfcache restore can't leave them in a blurred state. */
        document.querySelectorAll('.services-item').forEach(function (el) {
          el.style.filter = '';
          el.style.transform = '';
          el.style.opacity = '';
        });
        /* Brand morph (KMC×BETA / UC Berkeley) is scrubbed by ScrollTrigger,
           which does NOT re-fire on bfcache restore — leaving "UC Berkeley"
           stuck at opacity:0 from the scrolled-away state. Force it visible,
           then refresh ScrollTrigger so the scrub re-syncs to scrollY=0. */
        var ucbRestore = document.querySelector('.bm-uc');
        if (ucbRestore) ucbRestore.style.opacity = '';
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }
    });

    /* Hard safety: when user scrolls back near the top (within 80px),
       force body back to cream regardless of where the morph timeline
       thinks it is. Prevents the "stuck dark bg on scroll-up" bug. */
    window.addEventListener('scroll', function () {
      if ((window.scrollY || document.documentElement.scrollTop) < 80) {
        document.body.style.backgroundColor = '#f4f3ef';
      }
    }, { passive: true });
  }

  /* Intercept internal link clicks → dissolve out → navigate */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    /* Skip: external, anchors, mailto, tel, new-tab */
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.target === '_blank' ||
      link.hasAttribute('data-no-transition')
    ) return;

    e.preventDefault();

    if (!PAGE_WRAP) {
      window.location.href = href;
      return;
    }

    gsap.to(PAGE_WRAP, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      onComplete: function () {
        window.location.href = href;
      }
    });
  });

  /* ══════════════════════════════════════
     3. MENU DRAWER
     Open/close with GSAP + stagger links
  ══════════════════════════════════════ */

  const DRAWER  = document.getElementById('menu-drawer');
  const OVERLAY = document.querySelector('.menu-overlay');
  const LINKS   = DRAWER ? DRAWER.querySelectorAll('.menu-drawer__link') : [];
  let menuOpen  = false;

  const drawerTl = DRAWER ? gsap.timeline({ paused: true }) : null;

  if (drawerTl && DRAWER) {
    drawerTl
      .to(DRAWER, {
        y: '0%',
        duration: 0.65,
        ease: 'power3.out'
      }, 0)
      .to(OVERLAY, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0)
      .fromTo(LINKS,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.055 },
        0.2
      );

    /* Set initial state */
    gsap.set(DRAWER, { y: '-100%' });
    if (OVERLAY) gsap.set(OVERLAY, { opacity: 0 });
  }

  function openMenu() {
    menuOpen = true;
    document.body.classList.add('menu-open');
    if (DRAWER) {
      DRAWER.classList.add('is-open');
      DRAWER.setAttribute('aria-hidden', 'false');
    }
    if (OVERLAY) OVERLAY.classList.add('is-open');
    document.querySelectorAll('.js-menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
    });
    if (drawerTl) drawerTl.play();
  }

  function closeMenu() {
    menuOpen = false;
    document.body.classList.remove('menu-open');
    if (DRAWER) DRAWER.setAttribute('aria-hidden', 'true');
    if (OVERLAY) OVERLAY.classList.remove('is-open');
    document.querySelectorAll('.js-menu-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    if (drawerTl) {
      drawerTl.reverse().then(function () {
        if (DRAWER) DRAWER.classList.remove('is-open');
      });
    }
  }

  /* Flag so nav.js (also loaded on index.html for the home-intro sequence)
     skips its own menu / go-home binding and we don't double-fire. */
  window.__kmcSiteMenu = true;

  document.querySelectorAll('.js-menu-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      menuOpen ? closeMenu() : openMenu();
    });
  });

  if (OVERLAY) {
    OVERLAY.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  /* ══════════════════════════════════════
     4. NAV BLEND-MODE SWITCHING
     IntersectionObserver watches colored sections.
     Nav gets a class depending on which bg is visible.
  ══════════════════════════════════════ */

  const NAV = document.querySelector('.site-nav');

  if (NAV) {
    /* Each section declares its bg via data-nav-theme="cream|dark|red" */
    const sections = document.querySelectorAll('[data-nav-theme]');

    if (sections.length > 0) {
      const navObserver = new IntersectionObserver(function (entries) {
        /* Find the topmost intersecting section */
        let topEntry = null;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        });

        if (topEntry) {
          const theme = topEntry.target.dataset.navTheme;
          NAV.classList.remove('nav--on-cream', 'nav--on-dark', 'nav--on-red');
          if (theme) NAV.classList.add('nav--on-' + theme);
        }
      }, {
        threshold: 0,
        rootMargin: '-48px 0px -80% 0px' /* triggers near top of viewport */
      });

      sections.forEach(function (s) { navObserver.observe(s); });
    }
  }

  /* ══════════════════════════════════════
     4.1 NAV COLLAPSE ON SCROLL DIRECTION
     Scroll down => collapse, scroll up => expand
  ══════════════════════════════════════ */
  if (NAV) {
    let lastY = window.scrollY || window.pageYOffset || 0;
    const DELTA = 6;
    const TOP_HOLD = 24;

    function onNavScroll() {
      const y = window.scrollY || window.pageYOffset || 0;
      const diff = y - lastY;

      if (y <= TOP_HOLD) {
        NAV.classList.remove('is-collapsed');
      } else if (diff > DELTA) {
        NAV.classList.add('is-collapsed');
      } else if (diff < -DELTA) {
        NAV.classList.remove('is-collapsed');
      }

      lastY = y;
    }

    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* ══════════════════════════════════════
     5. BRAND MARK ENTRY ANIMATION
     After 0.8s (matches Figma AFTER_TIMEOUT),
     SMART_ANIMATE the brand mark into view.
  ══════════════════════════════════════ */

  const BRAND = document.querySelector('.brand-mark');

  if (BRAND) {
    /* Letters start slightly offset — animate to natural position */
    const letters = BRAND.querySelectorAll('.bm-slot, .part-left, .part-right');

    function runBrandMarkEntry() {
      gsap.set(letters, { opacity: 0, scale: 0.96, transformOrigin: 'center center' });
      gsap.set(BRAND, { opacity: 1 });

      gsap.to(letters, {
        opacity: 1,
        scale: 1,
        duration: 1.25,
        ease: 'power3.out',
        stagger: { amount: 0.35, from: 'random' },
        delay: 0.8
      });
    }

    var HTML_DE = document.documentElement;
    if (HTML_DE.classList.contains('has-opening') && !HTML_DE.classList.contains('opening-finished')) {
      window.addEventListener('kmc-opening-done', runBrandMarkEntry, { once: true });
    } else {
      runBrandMarkEntry();
    }
  }

  /* ══════════════════════════════════════
     6. SCROLL-TRIGGERED REVEAL ANIMATIONS
     Elements with .reveal / .reveal-left / .reveal-right
     animate in as they enter the viewport.
  ══════════════════════════════════════ */

  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });

  /* Staggered list items (services, work items) */
  gsap.utils.toArray('.reveal-list').forEach(function (list) {
    const items = list.querySelectorAll('.reveal-item');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 20 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.09,
      scrollTrigger: {
        trigger: list,
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    });
  });

  /* ══════════════════════════════════════
     7. SMOOTH SCROLL TO ANCHOR
     (for nav links that target page sections)
  ══════════════════════════════════════ */

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;          // ignore bare "#" (invalid selector)
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (prefersReduced) {
        var top = target.getBoundingClientRect().top + window.pageYOffset - 60;
        window.scrollTo(0, top);                  // instant jump for reduced motion
        return;
      }
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 60 },
        duration: 1.25,
        ease: 'power3.inOut'
      });
    });
  });


  /* ══════════════════════════════════════
     8. HERO COVER "VIDEO DROP" PARALLAX
     Cover photo rushes upward faster than page scroll,
     sliding over the sticky brand mark.
  ══════════════════════════════════════ */

  var heroCover     = document.querySelector('.hero-cover');
  var heroContainer = document.querySelector('.hero-container');

  if (heroCover && heroContainer) {
    gsap.to(heroCover, {
      y: function () { return window.innerWidth * -0.2; }, /* -20vw */
      ease: 'none',
      scrollTrigger: {
        trigger: heroContainer,
        start: 'top top',
        end: '+=600',
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    });
  }

  /* ══════════════════════════════════════
     9. BACKGROUND COLOR MORPH
     Full-page scroll progress drives body bg:
     0%→40% cream→red, 40%→100% red→dark.
     hero-container is transparent so body color
     bleeds through as cover photo scrolls away.
  ══════════════════════════════════════ */

  gsap.set('body', { backgroundColor: '#f4f3ef' });

  gsap.timeline({
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      invalidateOnRefresh: true
    }
  })
  .to('body', {
    backgroundColor: '#c21f1f',
    ease: 'power3.inOut',
    duration: 0.4
  })
  .to('body', {
    backgroundColor: '#201d13',
    ease: 'power3.inOut',
    duration: 0.6
  });

  /* Recompute every ScrollTrigger once the page reaches its final height.
     Late-loading images (large service previews, crew composite) and webfonts
     grow the document AFTER triggers initialize; without this the body-bg
     morph's end='bottom bottom' is stale and can park the background on red
     near the top until a manual reload. */
  function refreshTriggers() {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }
  window.addEventListener('load', refreshTriggers);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshTriggers);
  /* Each in-viewport <img> that finishes decoding can shift layout height. */
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.complete) img.addEventListener('load', refreshTriggers, { once: true });
  });
  window.addEventListener('kmc-opening-done', function () { setTimeout(refreshTriggers, 100); });

  /* ══════════════════════════════════════
     10. BETA "MOSES SPLIT" HOVER
     mouseenter: BE slides left, TA slides right, bear pops from center.
     mouseleave: text collapses, bear hides.
  ══════════════════════════════════════ */

  var betaContainer = document.querySelector('.beta-container');
  var partLeft      = betaContainer ? betaContainer.querySelector('.part-left')    : null;
  var partRight     = betaContainer ? betaContainer.querySelector('.part-right')   : null;
  var bearGraphic   = betaContainer ? betaContainer.querySelector('.bear-graphic') : null;

  if (betaContainer && partLeft && partRight && bearGraphic) {

    /* Bear hidden at rest — only appears on hover (Moses split).
       GSAP owns the initial state entirely — prevents CSS↔GSAP transform conflict */
    gsap.set(bearGraphic, {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 0.8,
      transformOrigin: '50% 50%'
    });

    /* Split distance follows bear width so the center gap never collapses. */
    function splitDist() {
      var currentScale = Number(gsap.getProperty(bearGraphic, 'scale')) || 1;
      var rect = bearGraphic.getBoundingClientRect();
      var renderedBearWidth = rect.width;

      /* When width is auto and image isn't measurable yet, estimate from container height. */
      if (!renderedBearWidth || renderedBearWidth < 2) {
        var h = betaContainer.getBoundingClientRect().height;
        var bearH = h * 0.34; /* must match CSS .bear-graphic height% */
        var ratio = (bearGraphic.naturalWidth && bearGraphic.naturalHeight)
          ? (bearGraphic.naturalWidth / bearGraphic.naturalHeight)
          : 1.6;
        renderedBearWidth = bearH * ratio;
      }

      var bearWidth = currentScale ? renderedBearWidth / currentScale : renderedBearWidth;
      /* Slight gap: smaller, but never zero. */
      var sideGap = Math.max(6, betaContainer.offsetWidth * 0.015);

      return (bearWidth / 2) + sideGap;
    }

    betaContainer.addEventListener('mouseenter', function () {
      var d = splitDist();
      /* Designer tweak: pull TA slightly closer to bear (keep BE distance unchanged). */
      var taNudge = Math.max(4, betaContainer.offsetWidth * 0.02);
      /* overwrite:true kills any in-progress collapse tweens before opening */
      gsap.to(partLeft,    { x: -d, duration: 0.8, ease: 'expo.out',            overwrite: true });
      gsap.to(partRight,   { x:  Math.max(0, d - taNudge), duration: 0.8, ease: 'expo.out',            overwrite: true });
      gsap.to(bearGraphic, { opacity: 1, scale: 1, duration: 0.6, delay: 0.15,
                             ease: 'back.out(1.7)',                               overwrite: true });
    });

    betaContainer.addEventListener('mouseleave', function () {
      gsap.to(partLeft,    { x: 0, duration: 0.5, ease: 'power2.inOut',         overwrite: true });
      gsap.to(partRight,   { x: 0, duration: 0.5, ease: 'power2.inOut',         overwrite: true });
      gsap.to(bearGraphic, { opacity: 0, scale: 0.8, duration: 0.5,
                             ease: 'power2.inOut',                                overwrite: true });
    });
  }

  /* ══════════════════════════════════════
     10b. BRAND LOCKUP SCROLL MORPH
     Expanded lockup (KM / big-arc C / upright + / BETA stacked over the big
     "UC Berkeley") → compact one-line "KMC ✕ BETA · Berkeley".
     Scrubbed by the sticky brand-wrap scroll — no extra pin, so the existing
     sticky / cover-parallax base is untouched.
     Figma 1264:589 — Default → Variant2 (deltas are % of the 1301×847 box).
  ══════════════════════════════════════ */

  (function brandMorph() {
    var BM        = document.querySelector('.brand-mark');
    var brandWrap = document.querySelector('.brand-wrap');
    if (!BM || !brandWrap || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 1023px)').matches) return; /* desktop-only morph */

    var K    = BM.querySelector('.bm-k');
    var M    = BM.querySelector('.bm-m');
    var C    = BM.querySelector('.bm-c');
    var PLUS = BM.querySelector('.bm-plus');
    var BETA = BM.querySelector('.beta-container');
    var UCB  = BM.querySelector('.bm-uc');
    if (!(K && M && C && PLUS && BETA && UCB)) return;

    var W = function () { return BM.offsetWidth; };
    var H = function () { return BM.offsetHeight; };

    var TL_ORIGIN = '0% 0%';   /* top-left: translate + scale map cleanly to target inset */

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-container',
        start: 'top top',
        end: function () { return '+=' + Math.max(440, brandWrap.offsetHeight - BM.offsetHeight); },
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });

    tl.to(K,    { transformOrigin: TL_ORIGIN, x: 0,
                  y: function () { return   0.59 / 100 * H(); }, scaleX: 0.967, scaleY: 0.968, ease: 'none' }, 0)
      .to(M,    { transformOrigin: TL_ORIGIN, x: function () { return  -1.00 / 100 * W(); },
                  y: function () { return   0.59 / 100 * H(); }, scaleX: 0.964, scaleY: 0.968, ease: 'none' }, 0)
      .to(C,    { transformOrigin: TL_ORIGIN, x: function () { return  14.76 / 100 * W(); },
                  y: function () { return -41.56 / 100 * H(); }, scaleX: 0.918, scaleY: 0.920, ease: 'none' }, 0)
      .to(PLUS, { transformOrigin: '50% 50%', x: function () { return   9.58 / 100 * W(); },
                  y: function () { return -34.72 / 100 * H(); }, rotation: 45,                  ease: 'none' }, 0)
      .to(BETA, { transformOrigin: TL_ORIGIN, x: function () { return   6.84 / 100 * W(); },
                  y: function () { return -41.56 / 100 * H(); }, scaleX: 0.815, scaleY: 0.812, ease: 'none' }, 0)
      .to(UCB,  { transformOrigin: TL_ORIGIN, x: 0,
                  y: function () { return -46.76 / 100 * H(); }, opacity: 0,                     ease: 'none' }, 0);
  })();

  /* ── Align the big "UC Berkeley" line's left edge to BETA's "B" glyph ──
     BETA is centered in its box, so the glyph's left isn't a fixed %. Measure
     it and pin UC Berkeley's left to match (left-aligned under BETA). */
  (function alignUCBtoBeta() {
    var BM  = document.querySelector('.brand-mark');
    if (!BM) return;
    var ucb = BM.querySelector('.bm-uc');
    var be  = BM.querySelector('.part-left');
    if (!ucb || !be || !be.firstChild) return;

    function align() {
      var range = document.createRange();
      range.selectNodeContents(be);
      var tr = range.getBoundingClientRect();
      var bm = BM.getBoundingClientRect();
      if (!tr.width || !bm.width) return;
      ucb.style.left = ((tr.left - bm.left) / bm.width * 100) + '%';
    }

    align();
    window.addEventListener('resize', align, { passive: true });
    window.addEventListener('load', align);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
    /* re-measure once the brand-entry scale settles */
    window.addEventListener('kmc-opening-done', function () { setTimeout(align, 2300); });
    setTimeout(align, 2500);
  })();

  /* ══════════════════════════════════════
     11. SERVICES — linked hover preview
     Hover a list item → cross-fade + scale preview image.
  ══════════════════════════════════════ */

  var servicesList = document.querySelector('.services-list');
  var servicesPreview = document.querySelector('.services-preview');

  if (servicesList && servicesPreview) {
    var svcItems = Array.from(servicesList.querySelectorAll('.services-item'));
    var svcLayers = Array.from(servicesPreview.querySelectorAll('.svc-layer'));
    var currentSvc = '01';

    /* Scroll entrance: subtle rise. (Removed blur — was causing residual
       frosted-glass appearance on bfcache restore when ScrollTrigger did
       not re-fire on back-navigation.) */
    gsap.fromTo(svcItems,
      { opacity: 0, y: 14 },
      {
        opacity: 0.4,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        onComplete: function () {
          gsap.set(svcItems, { clearProps: 'transform,filter' });
          /* First item starts as active */
          gsap.set(svcItems[0], { opacity: 1 });
          svcItems[0].classList.add('is-current');
        },
        scrollTrigger: {
          trigger: servicesList,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    function switchService(id) {
      if (id === currentSvc) return;
      var prevLayer = servicesPreview.querySelector('.svc-layer[data-svc="' + currentSvc + '"]');
      var nextLayer = servicesPreview.querySelector('.svc-layer[data-svc="' + id + '"]');
      currentSvc = id;

      if (prevLayer) {
        prevLayer.classList.remove('is-active');
        gsap.to(prevLayer, { opacity: 0, scale: 1.05, duration: 0.3, ease: 'power2.out', overwrite: true });
      }
      if (nextLayer) {
        nextLayer.classList.add('is-active');
        gsap.fromTo(nextLayer,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, delay: 0.1, ease: 'expo.out', overwrite: true }
        );
      }

      svcItems.forEach(function (el) {
        el.classList.toggle('is-current', el.getAttribute('data-svc') === id);
      });
    }

    /* Bottom items (.services-item--up) reveal upward: shift the whole list
       up by the description's height so items above slide up and items below
       stay put — mirroring how top items push the list downward. */
    function liftListFor(item) {
      if (item.classList.contains('services-item--up')) {
        var detail = item.querySelector('.services-item__detail');
        var h = detail ? Math.min(detail.scrollHeight, 360) : 0;
        servicesList.style.transform = 'translateY(-' + h + 'px)';
      } else {
        servicesList.style.transform = 'translateY(0)';
      }
    }

    svcItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        var id = item.getAttribute('data-svc');
        switchService(id);
        gsap.to(svcItems, { opacity: 0.4, duration: 0.2, overwrite: true });
        gsap.to(item, { opacity: 1, duration: 0.2, overwrite: true });
        liftListFor(item);
      });
    });

    /* Touch / small-screen: tap to reveal the description (mirrors desktop hover).
       A tap on a collapsed item opens it (and closes the others) without
       navigating; tapping an already-open item follows its link. */
    function isTouchLayout() {
      return window.matchMedia('(max-width: 600px)').matches;
    }
    svcItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (!isTouchLayout()) return;
        /* Phones: tapping a service only expands/collapses its description — it
           never navigates. preventDefault stops the link; stopPropagation keeps
           the event from reaching the global page-transition click handler
           (which would otherwise force window.location to the link). */
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !item.classList.contains('is-open');
        svcItems.forEach(function (el) { el.classList.remove('is-open'); });
        if (willOpen) item.classList.add('is-open');
      });
    });

    servicesList.addEventListener('mouseleave', function () {
      var activeItem = servicesList.querySelector('[data-svc="' + currentSvc + '"]');
      gsap.to(svcItems, { opacity: 0.4, duration: 0.3, overwrite: true });
      if (activeItem) gsap.to(activeItem, { opacity: 1, duration: 0.3, overwrite: true });
      servicesList.style.transform = 'translateY(0)';
    });
  }

  /* ══════════════════════════════════════
     12. STORIES CAPSULE — SCROLL TO EXPAND + PLAY
     While the red stories section scrolls through the viewport, the
     vertical capsule widens and the clip cross-fades to the looping video.
  ══════════════════════════════════════ */
  var storiesSection = document.querySelector('.stories-section');
  var storiesRow = document.querySelector('.stories-row-1');
  var storiesCapsule = storiesRow ? storiesRow.querySelector('.stories-capsule') : null;
  var storiesNo = storiesRow ? storiesRow.querySelector('.stories-no') : null;
  var storiesAds = storiesRow ? storiesRow.querySelector('.stories-ads') : null;
  var storiesVideo = storiesCapsule ? storiesCapsule.querySelector('.stories-capsule__video') : null;
  var storiesImg = storiesCapsule ? storiesCapsule.querySelector('img') : null;

  if (storiesSection && storiesRow && storiesCapsule && storiesNo && storiesAds && storiesVideo) {
    var storiesCapsuleTl = null;
    var storiesResizeTimer = null;

    gsap.set(storiesCapsule, { transformOrigin: '50% 100%' });

    function readCapsuleMetrics() {
      gsap.set(storiesCapsule, { clearProps: 'width,height,borderRadius' });
      var bw = storiesCapsule.offsetWidth;
      var bh = storiesCapsule.offsetHeight;
      var br = parseFloat(window.getComputedStyle(storiesCapsule).borderRadius);
      if (Number.isNaN(br) || br <= 0) {
        br = Math.min(bw, bh) * 0.5;
      }
      var adsFontSize = parseFloat(window.getComputedStyle(storiesAds).fontSize) || 120;
      var expandedW = adsFontSize * 2.5;
      expandedW = Math.max(bw * 2.7, Math.min(expandedW, storiesRow.offsetWidth * 0.5));
      return {
        baseW: bw,
        baseH: bh,
        baseRadius: br,
        expandedW: expandedW,
        expandedH: 170,
        expandedRadius: 58
      };
    }

    function buildStoriesCapsuleScroll() {
      if (storiesCapsuleTl) {
        storiesCapsuleTl.kill();
        storiesCapsuleTl = null;
      }

      var m = readCapsuleMetrics();
      gsap.set(storiesNo, { x: 0 });
      gsap.set(storiesAds, { x: 0 });
      gsap.set(storiesCapsule, {
        width: m.baseW,
        height: m.baseH,
        borderRadius: m.baseRadius,
        x: 0
      });
      if (storiesImg) gsap.set(storiesImg, { opacity: 1 });
      gsap.set(storiesVideo, { opacity: 0 });

      storiesCapsuleTl = gsap.timeline({
        scrollTrigger: {
          id: 'index-stories-capsule',
          trigger: storiesSection,
          start: 'top 88%',
          end: 'top 22%',
          scrub: 1.35,
          invalidateOnRefresh: true,
          onUpdate: function () {
            var st = ScrollTrigger.getById('index-stories-capsule');
            if (!st) return;
            var p = st.progress;
            if (p > 0.38) {
              if (storiesVideo.paused) {
                var pr = storiesVideo.play();
                if (pr && typeof pr.catch === 'function') pr.catch(function () {});
              }
            } else if (p < 0.22) {
              storiesVideo.pause();
              try {
                storiesVideo.currentTime = 0;
              } catch (err) {}
            }
          }
        }
      });
      storiesCapsuleTl.to(
        storiesCapsule,
        {
          width: m.expandedW,
          height: m.expandedH,
          borderRadius: m.expandedRadius,
          ease: 'none'
        },
        0
      );
      if (storiesImg) {
        storiesCapsuleTl.to(storiesImg, { opacity: 0, ease: 'none' }, 0);
      }
      storiesCapsuleTl.to(storiesVideo, { opacity: 1, ease: 'none' }, 0);
    }

    buildStoriesCapsuleScroll();

    window.addEventListener('resize', function () {
      clearTimeout(storiesResizeTimer);
      storiesResizeTimer = setTimeout(function () {
        buildStoriesCapsuleScroll();
        ScrollTrigger.refresh();
      }, 120);
    });
  }

  /* ══════════════════════════════════════
     N. CONTACT FORM — Web3Forms async submit
  ══════════════════════════════════════ */
  (function contactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;

    var btn       = form.querySelector('.contact-form__submit');
    var status    = form.querySelector('.contact-form__status');
    var btnMarkup = btn ? btn.innerHTML : '';

    function setStatus(msg, state) {
      if (!status) return;
      status.textContent = msg || '';
      status.hidden = !msg;
      if (state) { status.setAttribute('data-state', state); }
      else { status.removeAttribute('data-state'); }
    }

    /* Form is novalidate: we validate here so an invalid field shows an inline
       message instead of the browser scrolling/jumping to it (the "first press
       jumps up, doesn't submit" behaviour). Valid → submit on the first click. */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid && firstInvalid.focus) firstInvalid.focus({ preventScroll: true });
        setStatus('Please fill in your name, a valid email, and a message.', 'error');
        return;
      }

      setStatus('', '');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            setStatus('Thank you — your message has been sent.', 'ok');
          } else {
            setStatus('Something went wrong. Please email tech.ai@kmclucas.com.', 'error');
          }
        })
        .catch(function () {
          setStatus('Network error. Please email tech.ai@kmclucas.com.', 'error');
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = btnMarkup; }
        });
    });
  })();

})();
