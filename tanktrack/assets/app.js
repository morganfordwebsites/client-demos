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

  /* reveal on scroll */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      reveals.forEach(function (el) { el.classList.add("reveal"); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* product tabs */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", "false");
          t.setAttribute("tabindex", "-1");
        });
        tab.setAttribute("aria-selected", "true");
        tab.setAttribute("tabindex", "0");
        group.querySelectorAll("[data-panel]").forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-panel") !== tab.getAttribute("data-tab");
        });
      });
      tab.addEventListener("keydown", function (e) {
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          list[(i + 1) % list.length].click();
          list[(i + 1) % list.length].focus();
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          list[(i - 1 + list.length) % list.length].click();
          list[(i - 1 + list.length) % list.length].focus();
        }
      });
    });
  });

  /* truck pricing calculator */
  var calc = document.getElementById("truckCalc");
  if (calc) {
    var trucks = 1;
    var annual = false;
    var valEl = document.getElementById("truckVal");
    var rangeEl = document.getElementById("truckRange");
    var amtEl = document.getElementById("priceAmt");
    var perEl = document.getElementById("pricePer");
    var noteEl = document.getElementById("priceNote");
    var minus = document.getElementById("truckMinus");
    var plus = document.getElementById("truckPlus");
    var segBtns = calc.querySelectorAll("[data-billing]");

    var money = function (n) { return n.toLocaleString("en-US"); };

    var render = function () {
      var base = 180 + (trucks - 1) * 150;
      var monthly = annual ? Math.round(base * 0.9) : base;
      if (valEl) valEl.textContent = trucks;
      if (rangeEl) rangeEl.value = trucks;
      if (amtEl) amtEl.textContent = money(monthly);
      if (perEl) {
        perEl.innerHTML = annual
          ? "per month, billed annually<br>" + money(monthly * 12) + " per year"
          : "per month, billed monthly<br>cancel any time";
      }
      if (noteEl) {
        noteEl.textContent = trucks === 1
          ? "First truck $180. Every truck after that is $150. No setup fee, no contract, unlimited users and tanks."
          : "First truck $180 plus " + (trucks - 1) + " additional " + (trucks === 2 ? "truck" : "trucks") + " at $150. No setup fee, no contract, unlimited users and tanks.";
      }
      segBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-billing") === (annual ? "annual" : "monthly") ? "true" : "false");
      });
    };

    var setTrucks = function (n) {
      trucks = Math.min(25, Math.max(1, n));
      render();
    };

    if (minus) minus.addEventListener("click", function () { setTrucks(trucks - 1); });
    if (plus) plus.addEventListener("click", function () { setTrucks(trucks + 1); });
    if (rangeEl) rangeEl.addEventListener("input", function () { setTrucks(parseInt(rangeEl.value, 10) || 1); });
    segBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        annual = b.getAttribute("data-billing") === "annual";
        render();
      });
    });
    render();
  }

  /* contact form: honest preview behaviour */
  var form = document.getElementById("demoForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("formStatus");
      if (status) {
        status.textContent = "This is a design preview, so nothing was sent. Call (833) 826-5875 or email support@tanktrack.com and we will pick it up from there.";
        status.classList.add("show");
      }
    });
  }

  /* footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
