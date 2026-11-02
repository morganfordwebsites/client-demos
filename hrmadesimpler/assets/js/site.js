/* HR Made Simpler — small, dependency-free behaviours */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---- reveal on scroll (fires once) ---- */
  var items = document.querySelectorAll('.reveal');
  if (items.length && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

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
