(function(){
  "use strict";

  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.getElementById('mobile-nav');
  if(toggle && mobile){
    toggle.addEventListener('click', function(){
      var open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var links = mobile.querySelectorAll('a');
    for(var i=0;i<links.length;i++){
      links[i].addEventListener('click', function(){
        mobile.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    }
  }

  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('#proj-grid .proj');
  for(var c=0;c<chips.length;c++){
    chips[c].addEventListener('click', function(){
      var f = this.dataset.filter;
      for(var k=0;k<chips.length;k++) chips[k].setAttribute('aria-pressed','false');
      this.setAttribute('aria-pressed','true');
      for(var n=0;n<cards.length;n++){
        cards[n].hidden = !(f === 'all' || cards[n].dataset.cat === f);
      }
    });
  }

  var form = document.getElementById('site-form');
  var status = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('f-name').value.trim();
      var email = document.getElementById('f-email').value.trim();
      if(!name || !email){
        status.style.color = '#B4471F';
        status.textContent = 'Please add a name and an email.';
        return;
      }
      status.style.color = '';
      status.textContent = 'Preview only: nothing was sent. On the live site this would reach rosholtoffice@sandcountyenv.com.';
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if(!reduce && 'IntersectionObserver' in window && items.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:0.04, rootMargin:'0px 0px -30px 0px'});
    for(var j=0;j<items.length;j++) io.observe(items[j]);
  } else {
    for(var m=0;m<items.length;m++) items[m].classList.add('in');
  }
})();
