/*! ZENQ embeds loader */
(function () {
  // ----- config (repo + ref) -----
  var ORG  = 'haseebservises-ops';
  var REPO = 'zenq-embeds';
  var REF  = 'main'; // later you can tag, e.g. v1.0.0

  // Base points at /dist/
  var BASE = 'https://cdn.jsdelivr.net/gh/' + ORG + '/' + REPO + '@' + REF + '/dist/';

  // The <script> tag that loaded this file
  var me = document.currentScript || (function () {
    var s = document.getElementsByTagName('script'); return s[s.length - 1];
  })();

  // Which section to load (filename in /dist/sections/)
  var section = (me && me.getAttribute('data-section')) || 'bali-hero';

  // Optional custom mount via data-root. If not present, create #zenq-mount before the script.
  var rootSel = (me && me.getAttribute('data-root')) || '#zenq-mount';
  var mount = document.querySelector(rootSel);
  if (!mount) {
    mount = document.createElement('div');
    mount.id = rootSel.replace('#', '');
    me.parentNode.insertBefore(mount, me);
  }

  // Add base CSS once
  if (!document.getElementById('zenq-css')) {
    var link = document.createElement('link');
    link.id = 'zenq-css';
    link.rel = 'stylesheet';
    link.href = BASE + 'zenq.css';                 // NOTE: no extra "dist/" here
    document.head.appendChild(link);
  }

  // Fetch the section HTML and mount it
  fetch(BASE + 'sections/' + section + '.html', { cache: 'no-store' }) // NOTE: .../dist/sections/...
    .then(function (r) { if (!r.ok) throw new Error('HTML ' + r.status); return r.text(); })
    .then(function (html) {
      mount.innerHTML = html;

      // Execute any <script> tags inside the section so its JS runs
      var scripts = mount.querySelectorAll('script');
      scripts.forEach(function (s) {
        var n = document.createElement('script');
        if (s.src) { n.src = s.src; }
        else { n.textContent = s.textContent; }
        if (s.type) n.type = s.type;
        document.body.appendChild(n);
        s.parentNode.removeChild(s);
      });
    })
    .catch(function (err) {
      console.error('[ZENQ] Failed to load section:', err);
      mount.innerHTML = '<div style="color:#b00;font-weight:700">Failed to load section.</div>';
    });
})();
