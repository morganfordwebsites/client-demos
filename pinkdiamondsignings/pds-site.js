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

  /* ---------- seal tucks in on scroll ---------- */
  var navEl = document.querySelector(".nav");
  if(navEl){
    var updSeal = function(){ navEl.classList.toggle("scrolled", window.scrollY > 70); };
    window.addEventListener("scroll", updSeal, { passive: true });
    updSeal();
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mob = document.getElementById("mobmenu");
  if(burger && mob){
    function closeMenu(){ mob.classList.remove("open"); burger.setAttribute("aria-expanded","false"); }
    burger.addEventListener("click", function(e){
      e.stopPropagation();
      var open = mob.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mob.addEventListener("click", function(e){ if(e.target.closest("a")) closeMenu(); });
    document.addEventListener("click", function(e){
      if(mob.classList.contains("open") && !mob.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeMenu(); });
  }
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
      if(window.__bwRefresh) window.__bwRefresh();
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


  /* ---------- booking widget (step form) ---------- */
  var BW_API = "https://superagent-b14003f9.base44.app/functions/pdsBooking";
  var bwRoot = document.getElementById("bw");
  if(bwRoot){
    var bwDays = [], bwDay = null, bwTime = null, bwBusy = false;
    var bwDaysEl = document.getElementById("bw-days");
    var bwTimesEl = document.getElementById("bw-times");
    var bwSumline = document.getElementById("bw-sumline");
    var bwGo = document.getElementById("bw-go");
    var bwForm = document.getElementById("bw-form");
    var bwOk = document.getElementById("bw-ok");
    var bwL = function(){ return (document.documentElement.lang || "en") === "es"; };
    var BW_DOW = { en: ["SUN","MON","TUE","WED","THU","FRI","SAT"], es: ["DOM","LUN","MAR","MI\u00c9","JUE","VIE","S\u00c1B"] };
    var BW_MON = { en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"] };
    var BW_DOW_FULL = { en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], es: ["domingo","lunes","martes","mi\u00e9rcoles","jueves","viernes","s\u00e1bado"] };
    var bwToday = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    function bwT12(t, es){
      var h = +t.slice(0, 2), m = t.slice(3);
      var ap = h < 12 ? (es ? "a.m." : "AM") : (es ? "p.m." : "PM");
      return (((h + 11) % 12) + 1) + ":" + m + " " + ap;
    }
    function bwLabel(dstr){
      var p = dstr.split("-");
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      var es = bwL();
      return { top: dstr === bwToday ? (es ? "HOY" : "TODAY") : BW_DOW[es ? "es" : "en"][d.getDay()], num: d.getDate() };
    }
    function bwGoto(n){
      for(var i = 1; i <= 3; i++){
        var el = document.getElementById("bw-step" + i);
        if(el) el.classList.toggle("on", i === n);
      }
      var ps = bwRoot.querySelectorAll(".bw-p");
      for(var j = 0; j < ps.length; j++){
        var sn = +ps[j].getAttribute("data-step");
        ps[j].classList.toggle("on", sn === n);
        ps[j].classList.toggle("done", sn < n);
      }
    }
    function bwDayObj(){
      for(var i = 0; i < bwDays.length; i++){ if(bwDays[i].day === bwDay) return bwDays[i]; }
      return null;
    }
    var BW_MON_FULL = { en: ["January","February","March","April","May","June","July","August","September","October","November","December"], es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"] };
    var bwMonthIdx = 0;
    function bwMap(){
      var m = {};
      bwDays.forEach(function(dd){ m[dd.day] = dd.slots; });
      return m;
    }
    function bwRenderCal(){
      var es = bwL();
      var map = bwMap();
      var tp = bwToday.split("-");
      var base = new Date(+tp[0], +tp[1] - 1 + bwMonthIdx, 1);
      var y = base.getFullYear(), m = base.getMonth();
      var name = (es ? BW_MON_FULL.es[m] : BW_MON_FULL.en[m]);
      var label = es ? (name.charAt(0).toUpperCase() + name.slice(1)) + " " + y : name + " " + y;
      var firstDow = new Date(y, m, 1).getDay();
      var dim = new Date(y, m + 1, 0).getDate();
      var WD = es ? ["D","L","M","X","J","V","S"] : ["S","M","T","W","T","F","S"];
      var html = '<div class="bw-mhead">';
      html += '<button type="button" class="bw-mnav" data-nav="-1" aria-label="' + (es ? "Mes anterior" : "Previous month") + '"' + (bwMonthIdx === 0 ? " disabled" : "") + '>&#8249;</button>';
      html += '<span class="bw-mname">' + label + '</span>';
      html += '<button type="button" class="bw-mnav" data-nav="1" aria-label="' + (es ? "Mes siguiente" : "Next month") + '"' + (bwMonthIdx === 1 ? " disabled" : "") + '>&#8250;</button></div>';
      for(var w = 0; w < 7; w++) html += '<span class="bw-wd">' + WD[w] + '</span>';
      for(var p = 0; p < firstDow; p++) html += '<span class="bw-cell bw-blank"></span>';
      for(var d = 1; d <= dim; d++){
        var ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var dt = new Date(y, m, d);
        var closed = dt.getDay() === 0;
        var past = ds < bwToday;
        var slots = map[ds];
        var open = slots && slots.some(function(s){ return s.ok; });
        var dis = closed || past || !open;
        html += '<button type="button" class="bw-cell' + (bwDay === ds ? ' on' : '') + (ds === bwToday ? ' today' : '') + (closed && !past ? ' closed' : '') + '" data-d="' + ds + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
      }
      bwDaysEl.innerHTML = html;
      bwDaysEl.querySelectorAll('.bw-cell[data-d]').forEach(function(c){
        c.addEventListener('click', function(){
          bwDay = c.getAttribute('data-d'); bwTime = null;
          bwRenderCal(); bwRenderTimes(); bwGoto(2);
        });
      });
      bwDaysEl.querySelectorAll('.bw-mnav').forEach(function(nv){
        nv.addEventListener('click', function(){
          var dir = +nv.getAttribute('data-nav');
          var next = bwMonthIdx + dir;
          if(next < 0 || next > 1) return;
          bwMonthIdx = next; bwRenderCal();
        });
      });
    }
    function bwRenderTimes(){
      var es = bwL();
      if(!bwDay){ bwTimesEl.innerHTML = '<div class="bw-empty">' + (es ? "Elija un d\u00eda para ver los horarios" : "Pick a day to see times") + "</div>"; return; }
      var day = bwDayObj();
      if(!day) return;
      var groups = [{ k: "Morning", es: "Ma\u00f1ana", from: 9, to: 12 }, { k: "Afternoon", es: "Tarde", from: 12, to: 17 }, { k: "Evening", es: "Noche", from: 17, to: 20 }];
      var html = "";
      groups.forEach(function(g){
        var slots = day.slots.filter(function(s){ var h = +s.t.slice(0, 2); return h >= g.from && h < g.to; });
        if(!slots.length) return;
        html += '<div class="bw-slot"><span class="bw-cat">' + (es ? g.es : g.k) + '</span><div class="bw-times">';
        slots.forEach(function(s){
          html += '<button type="button" class="bw-time' + (s.ok ? "" : " off") + (bwTime === s.t ? " on" : "") + '" data-t="' + s.t + '"' + (s.ok ? "" : ' disabled') + '>' + bwT12(s.t, es) + "</button>";
        });
        html += "</div></div>";
      });
      bwTimesEl.innerHTML = html;
      Array.prototype.forEach.call(bwTimesEl.querySelectorAll(".bw-time"), function(b){
        if(b.disabled) return;
        b.addEventListener("click", function(){ bwTime = b.getAttribute("data-t"); bwUpdate(); bwGoto(3); });
      });
    }
    function bwUpdate(){
      var es = bwL();
      var p = bwDay.split("-");
      var dd = new Date(+p[0], +p[1] - 1, +p[2]);
      var svc = document.getElementById("bw-svc");
      var svcTxt = svc && svc.selectedIndex >= 0 ? svc.options[svc.selectedIndex].textContent : "";
      bwSumline.textContent = svcTxt + " \u00b7 " + BW_DOW_FULL[es ? "es" : "en"][dd.getDay()] + " " + dd.getDate() + " " + BW_MON[es ? "es" : "en"][dd.getMonth()] + ", " + bwT12(bwTime, es);
    }
    function bwRenderAll(){
      bwRenderCal();
      bwRenderTimes();
      bwUpdate();
      bwGoto(bwDay ? (bwTime ? 3 : 2) : 1);
    }
    window.__bwRefresh = function(){ if(bwDays.length){ bwRenderAll(); } };
    var back2 = document.getElementById("bw-back2");
    var back3 = document.getElementById("bw-back3");
    if(back2) back2.addEventListener("click", function(){ bwGoto(1); });
    if(back3) back3.addEventListener("click", function(){ bwRenderTimes(); bwGoto(2); });
    var bwSvc = document.getElementById("bw-svc");
    if(bwSvc) bwSvc.addEventListener("change", bwUpdate);
    function bwLoad(){
      bwDaysEl.innerHTML = "";
      var es = bwL();
      bwTimesEl.innerHTML = '<div class="bw-empty">' + (es ? "Cargando disponibilidad\u2026" : "Loading availability\u2026") + "</div>";
      fetch(BW_API).then(function(r){ return r.json(); }).then(function(d){
        bwDays = d.days || []; bwMonthIdx = 0; bwDay = null; bwTime = null;
        bwRenderAll();
      }).catch(function(){
        var es2 = bwL();
        bwTimesEl.innerHTML = '<div class="bw-empty">' + (es2 ? "No se pudo cargar la disponibilidad \u2014 llame o escriba a Dora: " : "Couldn\u2019t load availability \u2014 call or text Dora: ") + '<a href="tel:8327221305">(832) 722-1305</a></div>';
      });
    }
    if(bwForm){
      bwForm.addEventListener("submit", function(e){
        e.preventDefault();
        if(bwBusy) return;
        var name = document.getElementById("bw-name").value.trim();
        var phone = document.getElementById("bw-phone").value.trim();
        var email = document.getElementById("bw-email").value.trim();
        var service = document.getElementById("bw-svc").value;
        var notes = document.getElementById("bw-notes").value.trim();
        var es = bwL();
        if(!name || !phone || !email){
          bwSumline.textContent = es ? "Complete sus datos para continuar" : "Please complete your details to continue";
          return;
        }
        bwBusy = true;
        var sendLine = es ? "Enviando\u2026" : "Sending\u2026";
        var keep = bwSumline.textContent;
        bwSumline.textContent = sendLine;
        fetch(BW_API, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: bwDay, time: bwTime, name: name, phone: phone, email: email, service: service, notes: notes, honeypot: document.getElementById("bw-hp").value }) })
        .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
        .then(function(res){
          bwBusy = false;
          if(res.ok && res.j.ok){
            bwUpdate();
            document.getElementById("bw-ok-when").textContent = bwSumline.textContent;
            bwRoot.classList.add("done");
            bwForm.hidden = true;
            bwOk.hidden = false;
          } else if(res.j && res.j.error === "taken"){
            bwSumline.textContent = keep;
            bwTime = null; bwLoad();
          } else {
            bwSumline.textContent = keep + " " + (es ? "\u2014 algo sali\u00f3 mal, intente de nuevo" : "\u2014 something went wrong, please try again");
          }
        })
        .catch(function(){
          bwBusy = false;
          bwSumline.textContent = keep + " " + (es ? "\u2014 sin conexi\u00f3n, intente de nuevo" : "\u2014 connection issue, please try again");
        });
      });
    }
    bwLoad();
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
