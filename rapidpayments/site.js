(function(){
var d=document,root=d.documentElement;
// mobile menu
var burger=d.querySelector('.burger'),hdr=d.querySelector('.hdr');
if(burger){burger.addEventListener('click',function(){
  var open=root.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded',open);
  root.style.setProperty('--navtop',hdr.getBoundingClientRect().bottom+'px');
});}
d.querySelectorAll('.dd>button').forEach(function(b){b.addEventListener('click',function(){
  var dd=b.parentNode,open=dd.classList.toggle('open');b.setAttribute('aria-expanded',open);
  d.querySelectorAll('.dd').forEach(function(o){if(o!==dd){o.classList.remove('open');}});
});});
d.addEventListener('keydown',function(e){if(e.key==='Escape'){d.querySelectorAll('.dd.open').forEach(function(o){o.classList.remove('open');});}});
// reveal once
var rv=d.querySelectorAll('.rv');
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
  rv.forEach(function(el){io.observe(el);});
}else{rv.forEach(function(el){el.classList.add('in');});}
// quote builder
d.querySelectorAll('form.quote').forEach(function(f){
  var steps=[].slice.call(f.querySelectorAll('.step')),i=0;
  var back=f.querySelector('.back'),next=f.querySelector('.next'),err=f.querySelector('.err');
  var prog=f.parentNode.parentNode.querySelectorAll('.prog i'),count=f.parentNode.parentNode.querySelector('.count');
  function show(n){i=n;steps.forEach(function(s,k){s.classList.toggle('on',k===n);});
    back.hidden=n===0;next.textContent=n===steps.length-1?'Request my quote':'Continue';
    prog.forEach(function(p,k){p.classList.toggle('on',k<=n);});
    if(count){count.textContent='Step '+(n+1)+' of '+steps.length;}err.textContent='';}
  function valid(){var s=steps[i],radios=s.querySelectorAll('input[type=radio]');
    if(radios.length&&!s.querySelector('input:checked')){err.textContent='Pick one to continue.';return false;}
    var bad=[].slice.call(s.querySelectorAll('input[required]')).filter(function(x){return !x.checkValidity();})[0];
    if(bad){err.textContent='Please check '+bad.getAttribute('data-label')+'.';bad.focus();return false;}
    return true;}
  f.querySelectorAll('input[type=radio]').forEach(function(r){r.addEventListener('change',function(){
    if(i<steps.length-1){setTimeout(function(){show(i+1);},180);}});});
  back.addEventListener('click',function(){show(i-1);});
  f.addEventListener('submit',function(e){e.preventDefault();if(!valid()){return;}
    if(i<steps.length-1){show(i+1);var first=steps[i].querySelector('input:not([type=radio])');if(first){first.focus();}return;}
    var pick=function(n){var c=f.querySelector('input[name='+n+']:checked');return c?c.value:'';};
    var done=f.parentNode.querySelector('.done');
    done.querySelector('.sum').textContent=[pick('channel'),pick('industry'),pick('volume')+' a month'].join(' · ');
    f.style.display='none';done.classList.add('on');done.setAttribute('tabindex','-1');done.focus();
  });
  show(0);
});
// blog filter
var s=d.querySelector('.search');
if(s){var posts=[].slice.call(d.querySelectorAll('.post')),none=d.querySelector('.none'),n=d.querySelector('.pcount');
  s.addEventListener('input',function(){var q=s.value.trim().toLowerCase(),c=0;
    posts.forEach(function(p){var hit=!q||p.textContent.toLowerCase().indexOf(q)>-1;p.style.display=hit?'':'none';if(hit){c++;}});
    none.hidden=c>0;n.textContent=c+(c===1?' article':' articles');});}
})();
