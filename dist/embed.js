/*! ZENQ embeds — per-tag section loader */
(function () {
  // The script tag that is executing right now
  var me = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  if (!me) return;

  // Derive BASE from *this* tag so CSS/sections use the same pinned ref
  var src = me.getAttribute('src') || '';
  var cut = src.indexOf('/dist/embed.js');
  var BASE = cut > -1 ? src.slice(0, cut) + '/dist/' : src.replace(/embed\.js.*$/, '');
  if (BASE.slice(-1) !== '/') BASE += '/';

  // Which section + where to mount it
  var section = me.getAttribute('data-section') || 'bali-hero';
  var rootSel = me.getAttribute('data-root') || '#zenq-mount';
  var mount = document.querySelector(rootSel);
  if (!mount) {
    mount = document.createElement('div');
    mount.id = rootSel.replace('#', '');
    me.parentNode.insertBefore(mount, me);
  }

  // Add CSS once
  if (!document.getElementById('zenq-css')) {
    var link = document.createElement('link');
    link.id = 'zenq-css';
    link.rel = 'stylesheet';
    link.href = BASE + 'zenq.css';
    document.head.appendChild(link);
  }

  // Fetch HTML and mount
  fetch(BASE + 'sections/' + section + '.html', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.text(); })
    .then(function (html) {
      var frag = document.createRange().createContextualFragment(html);

      // Run any <script> tags inside that section
      frag.querySelectorAll('script').forEach(function (s) {
        var n = document.createElement('script');
        if (s.src) n.src = s.src;
        n.type = s.type || 'text/javascript';
        n.text = s.text || s.textContent || '';
        document.body.appendChild(n);
        s.remove();
      });

      mount.appendChild(frag);
    })
    .catch(function (err) {
      console.error('[ZENQ] Failed to load section "' + section + '":', err);
      mount.insertAdjacentHTML('beforeend',
        '<div style="color:#800;font-weight:700">Failed to load section ' + section + '</div>');
    });
})();
