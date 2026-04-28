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
      }
    });
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
     5. BRAND MARK ENTRY ANIMATION
     After 0.8s (matches Figma AFTER_TIMEOUT),
     SMART_ANIMATE the brand mark into view.
  ══════════════════════════════════════ */

  const BRAND = document.querySelector('.brand-mark');

  if (BRAND) {
    /* Letters start slightly offset — animate to natural position */
    const letters = BRAND.querySelectorAll('.bm-slot, .part-left, .part-right');

    gsap.set(letters, { opacity: 0, scale: 0.96, transformOrigin: 'center center' });
    gsap.set(BRAND, { opacity: 1 });

    /* Delay 0.8s, then stagger each letter in */
    gsap.to(letters, {
      opacity: 1,
      scale: 1,
      duration: 1.25,
      ease: 'power3.out',
      stagger: { amount: 0.35, from: 'random' },
      delay: 0.8
    });
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

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
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
      scrub: 2
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

    /* GSAP owns the initial state entirely — prevents CSS↔GSAP transform conflict */
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
     11. SERVICES — linked hover preview
     Hover a list item → cross-fade + scale preview image.
  ══════════════════════════════════════ */

  var servicesList = document.querySelector('.services-list');
  var servicesPreview = document.querySelector('.services-preview');

  if (servicesList && servicesPreview) {
    var svcItems = Array.from(servicesList.querySelectorAll('.services-item'));
    var svcLayers = Array.from(servicesPreview.querySelectorAll('.svc-layer'));
    var currentSvc = '01';

    /* Scroll entrance: subtle rise + blur clear for editorial feel. */
    gsap.fromTo(svcItems,
      { opacity: 0, y: 14, filter: 'blur(6px)' },
      {
        opacity: 0.4,
        y: 0,
        filter: 'blur(0px)',
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

    svcItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        var id = item.getAttribute('data-svc');
        switchService(id);
        gsap.to(svcItems, { opacity: 0.4, duration: 0.2, overwrite: true });
        gsap.to(item, { opacity: 1, duration: 0.2, overwrite: true });
      });
    });

    servicesList.addEventListener('mouseleave', function () {
      var activeItem = servicesList.querySelector('[data-svc="' + currentSvc + '"]');
      gsap.to(svcItems, { opacity: 0.4, duration: 0.3, overwrite: true });
      if (activeItem) gsap.to(activeItem, { opacity: 1, duration: 0.3, overwrite: true });
    });
  }

  /* ══════════════════════════════════════
     12. STORIES CAPSULE — CLICK TO EXPAND + PLAY
     Click capsule: NO/ADS split, capsule expands, video plays.
     Click again: collapse to initial state.
  ══════════════════════════════════════ */
  var storiesRow = document.querySelector('.stories-row-1');
  var storiesCapsule = storiesRow ? storiesRow.querySelector('.stories-capsule') : null;
  var storiesNo = storiesRow ? storiesRow.querySelector('.stories-no') : null;
  var storiesAds = storiesRow ? storiesRow.querySelector('.stories-ads') : null;
  var storiesVideo = storiesCapsule ? storiesCapsule.querySelector('.stories-capsule__video') : null;

  if (storiesRow && storiesCapsule && storiesNo && storiesAds && storiesVideo) {
    var storiesOpen = false;
    var baseW = storiesCapsule.offsetWidth;
    var baseH = storiesCapsule.offsetHeight;
    var baseRadius = Number(gsap.getProperty(storiesCapsule, 'borderRadius')) || (baseW / 2);

    gsap.set(storiesCapsule, { transformOrigin: '50% 100%' });

    function openStoriesCapsule() {
      if (storiesOpen) return;
      storiesOpen = true;
      storiesCapsule.classList.add('is-open');
      storiesCapsule.setAttribute('aria-expanded', 'true');

      var adsFontSize = parseFloat(window.getComputedStyle(storiesAds).fontSize) || 120;
      var expandedW = adsFontSize * 2.5;
      expandedW = Math.max(baseW * 2.7, Math.min(expandedW, storiesRow.offsetWidth * 0.5));
      var expandedH = 170;
      var expandedRadius = 58;

      /* justify-content:center handles NO/ADS reflow automatically */
      gsap.to(storiesNo, { x: 0, duration: 0.65, ease: 'power3.out', overwrite: true });
      gsap.to(storiesAds, { x: 0, duration: 0.65, ease: 'power3.out', overwrite: true });
      gsap.to(storiesCapsule, {
        width: expandedW,
        height: expandedH,
        x: 0,
        borderRadius: expandedRadius,
        duration: 0.72,
        ease: 'expo.out',
        overwrite: true
      });

      try {
        storiesVideo.currentTime = 0;
      } catch (_) {}
      var p = storiesVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }

    function closeStoriesCapsule() {
      if (!storiesOpen) return;
      storiesOpen = false;
      storiesCapsule.classList.remove('is-open');
      storiesCapsule.setAttribute('aria-expanded', 'false');

      gsap.to(storiesNo, { x: 0, duration: 0.45, ease: 'power2.inOut', overwrite: true });
      gsap.to(storiesAds, { x: 0, duration: 0.45, ease: 'power2.inOut', overwrite: true });
      gsap.to(storiesCapsule, {
        width: baseW,
        height: baseH,
        x: 0,
        borderRadius: baseRadius,
        duration: 0.5,
        ease: 'power2.inOut',
        overwrite: true
      });

      storiesVideo.pause();
      try {
        storiesVideo.currentTime = 0;
      } catch (_) {}
    }

    storiesCapsule.setAttribute('aria-expanded', 'false');
    storiesCapsule.addEventListener('click', function () {
      storiesOpen ? closeStoriesCapsule() : openStoriesCapsule();
    });

    window.addEventListener('resize', function () {
      if (!storiesOpen) {
        baseW = storiesCapsule.offsetWidth;
        baseH = storiesCapsule.offsetHeight;
      }
    });
  }

})();
