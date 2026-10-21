(function(){
  "use strict";
  /* =====================================================================
     TIDYCAL — paste Dora's TidyCal booking page URL here, e.g.
     "https://tidycal.com/dora-nava/standard-appointment"
     When set, the live TidyCal booking calendar automatically replaces
     the request form on every page that carries [data-tidycal].
     ===================================================================== */
  var TIDYCAL_URL = "";

  var lang = "en";
  var i18n = document.querySelectorAll("[data-en]");
  var inputs = document.querySelectorAll("[data-en-ph]");
  var btnLang = document.getElementById("btn-lang");

  function setLang(l){
    lang = l;
    document.documentElement.lang = l;
    btnLang.textContent = l === "en" ? "ES" : "EN";
    for(var i=0;i<i18n.length;i++){
      i18n[i].textContent = l === "en" ? i18n[i].getAttribute("data-en") : i18n[i].getAttribute("data-es");
    }
    for(var j=0;j<inputs.length;j++){
      inputs[j].setAttribute("placeholder", inputs[j].getAttribute(l === "en" ? "data-en-ph" : "data-es-ph"));
    }
  }
  btnLang.addEventListener("click", function(){ setLang(lang === "en" ? "es" : "en"); });

  /* ---------- TidyCal embed or request form ---------- */
  if(TIDYCAL_URL){
    var holders = document.querySelectorAll("[data-tidycal]");
    for(var k=0;k<holders.length;k++){
      var f = document.createElement("iframe");
      f.className = "embed-frame";
      f.src = TIDYCAL_URL;
      f.title = "Book an appointment";
      f.loading = "lazy";
      holders[k].innerHTML = "";
      holders[k].appendChild(f);
    }
  } else if(document.getElementById("bookform")){
    var form = document.getElementById("bookform");
    var ok = document.getElementById("bookok");
    var sum = document.getElementById("booksum");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = document.getElementById("bf-name").value.trim();
      var phone = document.getElementById("bf-phone").value.trim();
      var svcEl = document.getElementById("bf-svc");
      var svc = svcEl.options[svcEl.selectedIndex].textContent;
      var day = document.getElementById("bf-day").value.trim() || "Flexible";
      var time = document.getElementById("bf-time").value.trim() || "Flexible";
      if(!name || !phone){
        if(!name) document.getElementById("bf-name").focus(); else document.getElementById("bf-phone").focus();
        return;
      }
      sum.innerHTML = "<b>" + svc + "</b><br>" + day + " \u00b7 " + time;
      var body =
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "Service: " + svc + "\n" +
        "Preferred day: " + day + "\n" +
        "Preferred time: " + time;
      var mailto = "mailto:pinkdiamondsignings@gmail.com" +
        "?subject=" + encodeURIComponent("Booking request \u2014 " + svc + " \u2014 " + day + " " + time) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
      form.style.display = "none";
      ok.classList.add("show");
    });
  }


  /* ---------- reviews carousel (2-3 per view) ---------- */
  var track = document.getElementById("revtrack");
  if(track){
    var slides = track.children;
    var dots = document.getElementById("revDots");
    var n = slides.length, cur = 0, visible = 1, GAP = 16;

    function computeVisible(){
      var w = window.innerWidth || document.documentElement.clientWidth;
      return w > 1020 ? 3 : (w > 680 ? 2 : 1);
    }
    function maxIndex(){ return Math.max(0, n - visible); }
    function buildDots(){
      dots.innerHTML = "";
      for(var d=0; d<=maxIndex(); d++){
        var b = document.createElement("button");
        b.className = "dot";
        b.type = "button";
        b.setAttribute("aria-label", "Go to review " + (d+1));
        b.addEventListener("click", (function(idx){ return function(){ go(idx); }; })(d));
        dots.appendChild(b);
      }
    }
    function go(i){
      cur = Math.max(0, Math.min(i, maxIndex()));
      var step = slides[0].getBoundingClientRect().width + GAP;
      track.style.transform = "translateX(-" + (cur * step) + "px)";
      for(var j=0; j<n; j++){
        var on = j >= cur && j < cur + visible;
        slides[j].setAttribute("aria-hidden", on ? "false" : "true");
      }
      for(var k=0; k<dots.children.length; k++){
        dots.children[k].classList.toggle("on", k === cur);
      }
    }
    document.getElementById("revPrev").addEventListener("click", function(){ go(cur - 1); });
    document.getElementById("revNext").addEventListener("click", function(){ go(cur + 1); });
    var sx = null;
    track.addEventListener("pointerdown", function(e){ sx = e.clientX; }, {passive:true});
    track.addEventListener("pointerup", function(e){
      if(sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if(Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
    });
    track.addEventListener("pointercancel", function(){ sx = null; });
    var rz;
    window.addEventListener("resize", function(){
      clearTimeout(rz);
      rz = setTimeout(function(){
        var v = computeVisible();
        if(v !== visible){ visible = v; buildDots(); }
        go(cur);
      }, 150);
    });
    visible = computeVisible();
    buildDots();
    go(0);

    /* ---------- auto-rotate ---------- */
    var revSection = document.getElementById("reviews") || track.closest("section");
    var revHover = false, autoTimer = null;
    var noMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function stopAuto(){ if(autoTimer){ clearInterval(autoTimer); autoTimer = null; } }
    function startAuto(){
      if(noMotion || autoTimer) return;
      autoTimer = setInterval(function(){
        if(revHover || document.hidden) return;
        go(cur >= maxIndex() ? 0 : cur + 1);
      }, 5000);
    }
    function userMoved(){ stopAuto(); startAuto(); }
    document.getElementById("revPrev").addEventListener("click", userMoved);
    document.getElementById("revNext").addEventListener("click", userMoved);
    track.addEventListener("pointerdown", userMoved);
    if(revSection){
      revSection.addEventListener("pointerenter", function(){ revHover = true; }, true);
      revSection.addEventListener("pointerleave", function(){ revHover = false; }, true);
      revSection.addEventListener("focusin", function(){ revHover = true; });
      revSection.addEventListener("focusout", function(){ revHover = false; });
      if("IntersectionObserver" in window){
        new IntersectionObserver(function(entries){
          entries.forEach(function(e){ e.isIntersecting ? startAuto() : stopAuto(); });
        }, {threshold:.2}).observe(revSection);
      } else startAuto();
    } else startAuto();
  }

  /* ---------- stat count-up ---------- */
  var counters = document.querySelectorAll(".stats b[data-count]");
  var fmtNum = function(n, dec){ return n.toLocaleString("en-US", dec ? { minimumFractionDigits: dec, maximumFractionDigits: dec } : undefined); };
  var animateCount = function(el){
    var dec = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmtNum(target, dec) + suffix; return;
    }
    var dur = 1400, t0 = null;
    var step = function(t){
      if(!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtNum(+(eased * target).toFixed(dec), dec) + suffix;
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if(counters.length){
    if("IntersectionObserver" in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
        });
      }, {threshold:.4});
      counters.forEach(function(el){ cio.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- reveal on scroll ---------- */
  var rv = document.querySelectorAll(".rv");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
    rv.forEach(function(el){ io.observe(el); });
  } else {
    rv.forEach(function(el){ el.classList.add("in"); });
  }
  for(var q=0;q<inputs.length;q++) inputs[q].setAttribute("placeholder", inputs[q].getAttribute("data-en-ph"));
})();
