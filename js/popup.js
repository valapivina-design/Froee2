/* Scam Alert popup — shared behaviour for all review pages.
   Config comes from data attributes on the #sgPopup wrapper
   (data-broker, data-slug) injected per page by the generator. */
(function(){
  var wrap=document.getElementById('sgPopup');
  if(!wrap) return;
  var broker=wrap.dataset.broker||'this broker',
      slug=wrap.dataset.slug||'page',
      lang=(wrap.dataset.lang||document.documentElement.lang||'en').slice(0,2),
      FIRED='sg_popup_'+slug;
  var I18N={
    en:{
      subject:'Scam Alert popup — '+broker,
      msg:'I used '+broker+'. Date I paid: . How I paid: . Amount lost: . Person who told me to pay: .',
      phone:'Add the country code — start with “+”, e.g. +1 or +44.',
      sending:'Sending…', sent:'Received — we will contact you within one business day.',
      fail:'Something went wrong — please email info@forensicsourcegroup.com.',
      submit:'Request a consultation'
    },
    de:{
      subject:'Warnung — '+broker,
      msg:'Ich habe '+broker+' genutzt. Zahlungsdatum: . Zahlungsweg: . Verlorener Betrag: . Person, die zur Zahlung aufforderte: .',
      phone:'Ländervorwahl angeben — mit „+“ beginnen, z. B. +49.',
      sending:'Wird gesendet…', sent:'Erhalten — wir melden uns innerhalb eines Werktags.',
      fail:'Etwas ist schiefgelaufen — bitte schreiben Sie an info@forensicsourcegroup.com.',
      submit:'Beratung anfragen'
    },
    es:{
      subject:'Alerta de estafa — '+broker,
      msg:'Usé '+broker+'. Fecha de pago: . Cómo pagué: . Importe perdido: . Persona que me dijo que pagara: .',
      phone:'Añada el prefijo del país — empiece por “+”, p. ej. +34.',
      sending:'Enviando…', sent:'Recibido — le contactaremos en un día laborable.',
      fail:'Algo ha fallado — escriba a info@forensicsourcegroup.com.',
      submit:'Solicitar una consulta'
    },
    it:{
      subject:'Avviso truffa — '+broker,
      msg:'Ho usato '+broker+'. Data del pagamento: . Come ho pagato: . Importo perso: . Persona che mi ha detto di pagare: .',
      phone:'Aggiunga il prefisso internazionale — inizi con “+”, es. +39.',
      sending:'Invio…', sent:'Ricevuto — la contatteremo entro un giorno lavorativo.',
      fail:'Qualcosa è andato storto — scriva a info@forensicsourcegroup.com.',
      submit:'Richiedi una consulenza'
    },
    ar:{
      subject:'تنبيه — '+broker,
      msg:'استخدمت '+broker+'. تاريخ الدفع: . طريقة الدفع: . المبلغ: . الشخص الذي طلب الدفع: .',
      phone:'أضف رمز الدولة — ابدأ بـ “+”، مثل +966.',
      sending:'جارٍ الإرسال…', sent:'وصل الطلب — سنتواصل خلال يوم عمل.',
      fail:'حدث خطأ — راسل info@forensicsourcegroup.com.',
      submit:'اطلب استشارة'
    }
  };
  var t=I18N[lang]||I18N.en;

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
  if(subject) subject.value=t.subject;
  if(msg && !msg.value.trim()) msg.value=t.msg;
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
    if(phoneEl && phoneEl.value.trim()){
      var pv=phoneEl.value.replace(/[\s()-]/g,'');
      if(!/^\+\d{6,15}$/.test(pv)){
        phoneEl.classList.add('sg-invalid');
        phoneEl.focus();
        status.className='sg-status err';
        status.textContent=t.phone;
        return;
      }
      phoneEl.value=pv; phoneEl.classList.remove('sg-invalid');
    }
    var btn=form.querySelector('.sg-submit'); btn.disabled=true; btn.textContent=t.sending;
    fetch(form.action,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(form)})
      .then(function(r){
        if(r.ok){status.className='sg-status ok';status.textContent=t.sent;form.reset();
          setTimeout(function(){hide(true);},2500);}
        else{throw 0;}
      })
      .catch(function(){status.className='sg-status err';status.textContent=t.fail;})
      .finally(function(){btn.disabled=false;btn.textContent=t.submit;});
  });
})();
