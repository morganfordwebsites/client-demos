(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){
    for(var i=0;i<items.length;i++) items[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.1, rootMargin:'0px 0px -50px 0px'});
    for(var j=0;j<items.length;j++) io.observe(items[j]);
  }

  var tabs = document.querySelectorAll('.rx-tab');
  var panels = document.querySelectorAll('.rx-panel');
  for(var t=0;t<tabs.length;t++){
    tabs[t].addEventListener('click', function(){
      for(var k=0;k<tabs.length;k++) tabs[k].setAttribute('aria-pressed','false');
      this.setAttribute('aria-pressed','true');
      for(var m=0;m<panels.length;m++) panels[m].hidden = (panels[m].id !== 'rx-' + this.dataset.rx);
    });
  }

  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('#proj-grid .proj');
  var count = document.getElementById('proj-count');
  for(var c=0;c<chips.length;c++){
    chips[c].addEventListener('click', function(){
      var f = this.dataset.filter;
      for(var k=0;k<chips.length;k++) chips[k].setAttribute('aria-pressed','false');
      this.setAttribute('aria-pressed','true');
      var shown = 0;
      for(var n=0;n<cards.length;n++){
        var show = (f === 'all' || cards[n].dataset.cat === f);
        cards[n].hidden = !show;
        if(show) shown++;
      }
      if(count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
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
        status.textContent = 'Add a name and an email so we know who is asking.';
        status.style.color = '#F0C9A0';
        return;
      }
      status.style.color = '';
      status.textContent = 'Preview only: nothing was sent. On the live site this would reach rosholtoffice@sandcountyenv.com.';
    });
  }

  var mnav = document.querySelector('.mnav');
  if(mnav){
    var links = mnav.querySelectorAll('a');
    for(var l=0;l<links.length;l++){
      links[l].addEventListener('click', function(){ mnav.removeAttribute('open'); });
    }
  }
})();
