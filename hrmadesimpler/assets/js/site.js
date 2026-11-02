/* HR Made Simpler — small, dependency-free behaviours */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the reveal styles are gated on html.js, so this file must be the one to set it */
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /* ---- mobile drawer ---- */
  var drawer = document.querySelector('[data-drawer]');
  var openBtn = document.querySelector('[data-nav-open]');
  var closeBtn = document.querySelector('[data-nav-close]');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.setAttribute('data-open', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && closeBtn) closeBtn.focus();
    if (!open && openBtn) openBtn.focus();
  }

  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setDrawer(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.getAttribute('data-open') === 'true') setDrawer(false);
  });

  /* ---- scroll reveal removed: sections are painted immediately, never hidden ---- */

  /* ---- testimonial carousel ---- */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var slides = [].slice.call(root.querySelectorAll('[data-slide]'));
    if (!slides.length) return;

    var dotsWrap = root.querySelector('[data-dots]');
    var curEl = root.querySelector('[data-current]');
    var totalEl = root.querySelector('[data-total]');
    var scope = root.closest('[data-carousel-group]') || root;
    var names = [].slice.call(scope.querySelectorAll('[data-goto]'));
    var dots = [];
    var index = 0;
    root.setAttribute('data-ready', 'true');

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    if (dotsWrap) {
      slides.forEach(function (_, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Testimonial ' + (n + 1) + ' of ' + slides.length);
        b.addEventListener('click', function () { go(n); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }

    if (totalEl) totalEl.textContent = pad(slides.length);

    function go(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === index);
        s.setAttribute('aria-hidden', k === index ? 'false' : 'true');
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === index ? 'true' : 'false'); });
      names.forEach(function (b, k) { b.setAttribute('aria-current', k === index ? 'true' : 'false'); });
      if (curEl) curEl.textContent = pad(index + 1);
      if (timer) startTicker();
    }

    /* ---- auto rotation: a single ticker with guards, so nothing can strand it ---- */
    var DWELL = 7000;
    var timer = null;
    var paused = reduce;
    var inView = true;
    var held = false;   // pointer over it, or focus inside it
    var toggle = root.querySelector('[data-pause]');

    function tick() {
      if (paused || held || !inView || document.hidden) return;
      go(index + 1);
    }
    function startTicker() {
      if (timer) { clearInterval(timer); }
      timer = setInterval(tick, DWELL);
    }

    function paintToggle() {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
      toggle.setAttribute('aria-label', paused ? 'Start testimonial rotation' : 'Pause testimonial rotation');
    }
    paintToggle();

    if (toggle) {
      toggle.addEventListener('click', function () {
        paused = !paused;
        paintToggle();
        if (!paused) startTicker();
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inView = e.isIntersecting; });
      }, { threshold: 0.25 }).observe(root);
    }

    /* reading a quote should not be interrupted mid-sentence */
    root.addEventListener('mouseenter', function () { held = true; });
    root.addEventListener('mouseleave', function () { held = false; });
    root.addEventListener('focusin', function () { held = true; });
    root.addEventListener('focusout', function () { held = false; });

    startTicker();

    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    names.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      if (e.key === 'ArrowRight') { go(index + 1); }
    });

    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });

    go(0);
  });

  /* ---- current year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- open the FAQ item targeted by a #hash ---- */
  document.querySelectorAll('.faq details').forEach(function (d) {
    if (d.id && window.location.hash === '#' + d.id) d.open = true;
  });

  /* ---- contact form -> composes a real email (no backend needed) ---- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var name = get('name');
      var org = get('organisation');
      var email = get('email');
      var topic = get('topic');
      var message = get('message');

      var subject = 'Enquiry from ' + name + (org ? ' — ' + org : '') + (topic ? ' (' + topic + ')' : '');
      var body = 'Name: ' + name + '\n'
        + 'Organisation: ' + (org || '—') + '\n'
        + 'Email: ' + email + '\n'
        + 'Looking for: ' + (topic || '—') + '\n\n'
        + message + '\n';

      var href = 'mailto:hrmadesimpler@outlook.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = href;

      if (status) {
        status.textContent = 'Opening your email app with this message addressed to HR Made Simpler. If nothing happens, email hrmadesimpler@outlook.com or call 970-556-5336.';
      }
    });
  }
})();
