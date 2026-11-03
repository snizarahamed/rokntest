(function(){
  var hdr=document.getElementById('hdr'),nav=document.getElementById('nav'),burger=document.getElementById('burger');
  function onScroll(){hdr.classList.toggle('solid',window.scrollY>40)}
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');burger.setAttribute('aria-expanded',false)}});
  // scroll reveal
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }else{els.forEach(function(e){e.classList.add('in')})}
  // contact form: sends the enquiry to info@rokntech.com through FormSubmit (no server needed)
  var TO='nizar@nuhatech.com', ENDPOINT='https://formsubmit.co/ajax/bb456672f07c2b9de58779552f147964'+TO;
  var form=document.getElementById('form'),status=document.getElementById('status');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;form.querySelectorAll('[required]').forEach(function(i){var bad=!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value));i.classList.toggle('bad',bad);if(bad)ok=false});
    if(!ok){status.textContent='Please fill in your name and a valid email.';return}
    var d=new FormData(form),btn=form.querySelector('button[type=submit]'),label=btn.textContent;
    btn.disabled=true;btn.textContent='Sending...';status.textContent='';
    var payload={name:d.get('name'),company:d.get('company'),email:d.get('email'),phone:d.get('phone'),service:d.get('service'),message:d.get('message'),
      _subject:'Website enquiry: '+d.get('service'),_template:'table',_captcha:'false',_honey:d.get('_honey')};
    fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json()})
      .then(function(res){
        if(res.success===true||res.success==='true'){status.textContent='Thank you! Your enquiry has been sent. We will contact you shortly.';form.reset()}
        else{throw new Error(res.message||'failed')}
      })
      .catch(function(){status.innerHTML='Sorry, the message could not be sent. Please email <a href="mailto:'+TO+'">'+TO+'</a> directly.'})
      .then(function(){btn.disabled=false;btn.textContent=label});
  });
  document.getElementById('yr').textContent=new Date().getFullYear();
})();


/* Cursor glow for service cards (paste inside js/main.js, or add as a separate <script>) */
document.querySelectorAll('#services .sv').forEach(function (c) {
  c.addEventListener('pointermove', function (e) {
    var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Hero background video: starts only when the browser says it can play through without stalling */
(function () {
  var v = document.querySelector('.hero-video');
  if (!v) return;
  var c = navigator.connection || {};
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || '')) return; /* poster picture only */
  v.muted = true; v.defaultMuted = true;
  v.src = matchMedia('(max-width: 900px)').matches ? v.dataset.srcSd : v.dataset.srcHd; /* smaller file on phones */
  v.preload = 'auto';
  var started = false;
  function go() {
    if (started) return; started = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  v.addEventListener('canplaythrough', go, { once: true });
  setTimeout(function () { if (!started && v.readyState >= 3) go(); }, 5000); /* safety net */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) v.pause(); else if (started) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  });
  v.load();
})();
