/* Client comments — shared behaviour for all review pages.
   - Renders approved comments for this page from COMMENTS (js/comments-data.js).
   - Submits new comments to Formcarry for moderation (never published instantly).
   - Anti-spam: honeypot field + minimum-time trap. No external CAPTCHA. */
(function () {
  var section = document.getElementById('comments');
  if (!section) return;
  var slug = section.getAttribute('data-slug') || '';
  var list = document.getElementById('cmList');
  var form = document.getElementById('cmForm');
  var thanks = document.getElementById('cmThanks');
  var status = document.getElementById('cmStatus');
  var renderedAt = Date.now(); /* time trap: a real human needs >3s to fill the form */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c];
    });
  }

  /* ---- approved comments for this page (empty data file -> neutral line) ---- */
  var data = (typeof COMMENTS !== 'undefined' && COMMENTS) ? COMMENTS : {};
  var items = data[slug] || [];
  if (items.length) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var c = items[i] || {};
      html += '<article class="cm-item"><header><span class="cm-name">' + esc(c.name) +
              '</span><time class="cm-date">' + esc(c.date) + '</time></header><p>' +
              esc(c.text) + '</p></article>';
    }
    list.innerHTML = html;
  } else {
    list.innerHTML = '<p class="cm-empty">No published comments yet.</p>';
  }

  /* ---- character counter (max 1000, enforced by maxlength too) ---- */
  var ta = document.getElementById('cmText');
  var count = document.getElementById('cmCount');
  if (ta && count) {
    ta.addEventListener('input', function () { count.textContent = String(ta.value.length); });
  }

  if (!form) return;

  function showThanks() {
    form.hidden = true;
    if (thanks) thanks.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    /* honeypot: bots fill the invisible field -> silently drop, no POST */
    var hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) { showThanks(); return; }

    /* time trap: form rendered <3s ago -> bot, no POST */
    if (Date.now() - renderedAt < 3000) { showThanks(); return; }

    var ts = document.getElementById('cmSubmittedAt');
    if (ts) ts.value = new Date().toISOString();

    var btn = document.getElementById('cmSubmit');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) {
        if (r.ok) { showThanks(); }
        else { throw 0; }
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Something went wrong — please email info@forensicsourcegroup.com.';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Submit comment for moderation';
      });
  });
})();
