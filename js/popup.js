/* Scam Alert popup — shared behaviour for all review pages.
   Config comes from data attributes on the #sgPopup wrapper
   (data-broker, data-slug) injected per page by the generator. */
(function(){
  var wrap=document.getElementById('sgPopup');
  if(!wrap) return;
  var broker=wrap.dataset.broker||'this broker',
      slug=wrap.dataset.slug||'page',
      FIRED='sg_popup_'+slug;

  var overlay=document.getElementById('sgOverlay'),
      fab=document.getElementById('sgFab'),
      closeBtn=document.getElementById('sgClose'),
      dismissBtn=document.getElementById('sgDismiss'),
      form=document.getElementById('sgForm'),
      status=document.getElementById('sgStatus');

  /* per-page personalisation from data attributes */
  var h2em=overlay.querySelector('#sgTitle em'),
      subject=form.querySelector('input[name="_subject"]'),
      msg=form.querySelector('#sgMsg');
  if(h2em) h2em.textContent=broker;
  if(subject) subject.value='Scam Alert popup — '+broker+' review page';
  if(msg) msg.value='I lost money to '+broker+' and want a free case review.';
  wrap.removeAttribute('hidden');

  var h1=document.querySelector('h1');
  var delayMet=false, scrolled=false, done=false;
  try{ done=sessionStorage.getItem(FIRED)==='1'; }catch(e){}

  setTimeout(function(){delayMet=true;maybeShow();},6000);
  window.addEventListener('scroll',onScroll,{passive:true});
  function onScroll(){
    if(scrolled)return;
    var past=h1? (h1.getBoundingClientRect().bottom < 0) : (window.scrollY>300);
    if(past){scrolled=true;maybeShow();}
  }
  function maybeShow(){ if(!done && delayMet && scrolled) show(); }

  function show(){
    done=true;
    try{ sessionStorage.setItem(FIRED,'1'); }catch(e){}
    overlay.classList.add('sg-show');
    document.body.style.overflow='hidden';
    var f=document.getElementById('sgName'); if(f) f.focus();
  }
  function hide(reopenFab){
    overlay.classList.remove('sg-show');
    document.body.style.overflow='';
    if(reopenFab) fab.classList.add('sg-on');
  }
  closeBtn.addEventListener('click',function(){hide(true);});
  dismissBtn.addEventListener('click',function(){hide(true);});
  overlay.addEventListener('click',function(e){if(e.target===overlay)hide(true);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay.classList.contains('sg-show'))hide(true);});
  fab.addEventListener('click',function(){fab.classList.remove('sg-on');show();});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    status.className='sg-status'; status.textContent='';
    /* require country code: number must start with "+" */
    var phoneEl=document.getElementById('sgPhone');
    if(phoneEl){
      var pv=phoneEl.value.replace(/[\s()-]/g,'');
      if(!/^\+\d{6,15}$/.test(pv)){
        phoneEl.classList.add('sg-invalid');
        phoneEl.focus();
        status.className='sg-status err';
        status.textContent='Please add your country code — start with “+”, e.g. +44 7700 900000.';
        return;
      }
      phoneEl.value=pv; phoneEl.classList.remove('sg-invalid');
    }
    var btn=form.querySelector('.sg-submit'); btn.disabled=true; btn.textContent='Sending…';
    fetch(form.action,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(form)})
      .then(function(r){
        if(r.ok){status.className='sg-status ok';status.textContent='Received — we will contact you within one business day.';form.reset();
          setTimeout(function(){hide(true);},2500);}
        else{throw 0;}
      })
      .catch(function(){status.className='sg-status err';status.textContent='Something went wrong — please email info@forensicsourcegroup.com.';})
      .finally(function(){btn.disabled=false;btn.textContent='Start my free case review';});
  });
})();
