(function(){
  "use strict";

  /* fee picker (rates page) */
  var btns = document.querySelectorAll('.seg-btn');
  var feeEl = document.getElementById('fee');
  var noteEl = document.getElementById('note');
  if (btns.length && feeEl && noteEl) {
    Array.prototype.forEach.call(btns, function(btn){
      btn.addEventListener('click', function(){
        Array.prototype.forEach.call(btns, function(b){ b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
        feeEl.textContent = btn.getAttribute('data-fee');
        var small = document.createElement('small');
        small.textContent = btn.getAttribute('data-unit');
        feeEl.appendChild(small);
        noteEl.textContent = btn.getAttribute('data-note');
      });
    });
  }

  /* reveal on scroll */
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(items, function(el){ io.observe(el); });
  } else {
    Array.prototype.forEach.call(items, function(el){ el.classList.add('in'); });
  }

  /* appointment form (preview only) */
  var form = document.getElementById('book-form');
  var msg = document.getElementById('form-msg');
  if (form && msg) {
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      msg.classList.add('on');
      msg.scrollIntoView({ block: 'nearest' });
    });
  }
})();
