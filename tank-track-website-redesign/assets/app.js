/* Tank Track concept site */
(function () {
  "use strict";

  /* mobile nav */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mobileNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* sticky header shadow */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* preview forms: say plainly that nothing was sent */
  document.querySelectorAll("[data-preview-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.parentElement.querySelector("[data-form-note]");
      if (!note) return;
      var isContact = form.classList.contains("contact-form");
      note.textContent = isContact
        ? "This is a concept form, so nothing was sent. Email info@tanktrack.app to reach Tank Track."
        : "This is a concept form, so nothing was sent. The real launch list is not connected yet.";
      note.classList.add("ok");
    });
  });
})();
