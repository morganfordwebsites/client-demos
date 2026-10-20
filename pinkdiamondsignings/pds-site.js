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
