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



  function positionMega(item){
    var m=item.querySelector('.mega');
    if(!m) return;
    m.style.left='50%'; m.style.transform='translateX(-50%)';
    var vw=document.documentElement.clientWidth;
    var r=m.getBoundingClientRect();
    if(r.width===0) return;
    var desired = r.left;
    if(r.right > vw-16) desired = vw-16-r.width;
    if(desired < 16) desired = 16;
    var itemRect=item.getBoundingClientRect();
    m.style.left=(desired-itemRect.left)+'px';
    m.style.transform='none';
  }
  var navItems = document.querySelectorAll('.nav-item.has-mega');
  function closeAll(except){
    for(var i=0;i<navItems.length;i++){
      if(navItems[i]!==except){
        navItems[i].classList.remove('open');
        var b=navItems[i].querySelector('.nav-link');
        if(b) b.setAttribute('aria-expanded','false');
      }
    }
  }
  for(var i=0;i<navItems.length;i++){
    (function(item){
      var btn=item.querySelector('.nav-link');
      if(!btn) return;
      btn.addEventListener('click', function(e){
        if(window.matchMedia('(hover: hover)').matches) return;   // desktop: follow the link
        e.preventDefault();
        positionMega(item);
        var open=item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open?'true':'false');
        closeAll(item);
      });
      item.addEventListener('mouseenter', function(){
        btn.setAttribute('aria-expanded','true');
        positionMega(item);
      });
      window.addEventListener('resize', function(){ if(item.classList.contains('open')) positionMega(item); });
      item.addEventListener('mouseleave', function(){
        clearTimeout(item._t);
        item._t = setTimeout(function(){
          if(!item.classList.contains('open')) btn.setAttribute('aria-expanded','false');
        }, 220);
      });
    })(navItems[i]);
  }
  document.addEventListener('click', function(e){
    if(!e.target.closest || !e.target.closest('.nav-item')) closeAll(null);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeAll(null);
  });

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
