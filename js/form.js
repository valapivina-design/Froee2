/* Contact form -> Formcarry (https://formcarry.com)
   Set your endpoint in the form's `action` attribute:
   <form action="https://formcarry.com/s/YOUR_FORM_ID" ...>
   Submits via fetch (AJAX) so the visitor stays on the page. */
(function () {
  var form = document.getElementById("contactForm");
  if (!form) return;
  var statusEl = document.getElementById("formStatus");
  var btn = form.querySelector('button[type="submit"]');
  var okMsg = form.getAttribute("data-ok") || "Thanks — your message has been sent. We'll reply within one business day.";
  var errMsg = form.getAttribute("data-err") || "Something went wrong. Please email us directly at info@forensicsourcegroup.com.";
  var sending = form.getAttribute("data-sending") || "Sending…";
  var sendLabel = btn ? btn.textContent : "Send";

  function setStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = "form-status " + kind;
    statusEl.textContent = text;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // Honeypot: if filled, silently drop (bot).
    var hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) return;

    var action = form.getAttribute("action") || "";
    // If endpoint not configured yet, fall back to a mailto so the form still works.
    if (action.indexOf("YOUR_FORM_ID") !== -1 || action === "") {
      var fd0 = new FormData(form);
      var body = [];
      fd0.forEach(function (v, k) { if (k[0] !== "_") body.push(k + ": " + v); });
      window.location.href = "mailto:info@forensicsourcegroup.com?subject=" +
        encodeURIComponent("Website enquiry") + "&body=" + encodeURIComponent(body.join("\n"));
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = sending; }
    setStatus("", "");

    fetch(action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("ok", okMsg);
        } else {
          setStatus("err", (res.d && res.d.message) ? res.d.message : errMsg);
        }
      })
      .catch(function () { setStatus("err", errMsg); })
      .finally(function () { if (btn) { btn.disabled = false; btn.textContent = sendLabel; } });
  });

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
  }

  // Remember the visitor's language choice so the auto-redirect respects it.
  var langLinks = document.querySelectorAll(".lang a[lang]");
  for (var i = 0; i < langLinks.length; i++) {
    langLinks[i].addEventListener("click", function () {
      try { localStorage.setItem("fsg_lang", this.getAttribute("lang")); } catch (e) {}
    });
  }
})();
