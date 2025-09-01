/*! ZENQ embeds – multi-section loader */
(function () {
  // Find all script tags that reference this loader and have a data-section
  var sel = 'script[data-section][src*="/zenq-embeds"]';
  var tags = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!tags.length) {
    // Fallback: any script ending in /embed.js with data-section
    tags = Array.prototype.slice.call(
      document.querySelectorAll('script[data-section]')
    ).filter(function (s) { return /\/embed\.js(\?|#|$)/.test(s.src); });
  }
  if (!tags.length) return;

  // Derive BASE from the first tag's src so CSS/sections use the same pinned ref
  var src = tags[0].getAttribute('src');
  var cut = src.indexOf('/dist/embed.js');
  var BASE = cut > -1 ? src.slice(0, cut) + '/dist/' : src.replace(/embed\.js.*$/, '');
  if (BASE.slice(-1) !== '/') BASE += '/';

  // Ensure CSS is added once
  function ensureCSS () {
    if (document.getElementById('zenq-css')) return;
    var link = document.createElement('link');
    link.id = 'zenq-css';
    link.rel = 'stylesheet';
    link.href = BASE + 'zenq.css';
    document.head.appendChild(link);
  }
  ensureCSS();

  // Execute any <script> nodes found inside a fragment
  function runScripts (root) {
    var list = root.querySelectorAll('script');
    Array.prototype.forEach.call(list, function (s) {
      var n = document.createElement('script');
      if (s.src) n.src = s.src;
      n.type = s.type || 'text/javascript';
      n.text = s.text || s.textContent || '';
      document.body.appendChild(n);
      if (s.parentNode) s.parentNode.removeChild(s);
    });
  }

  function mountFromTag (me) {
    try {
      var section = me.getAttribute('data-section') || 'bali-hero';
      var rootSel = me.getAttribute('data-root') || '#zenq-mount';
      var mount = document.querySelector(rootSel);
      if (!mount) {
        mount = document.createElement('div');
        mount.id = rootSel.replace('#', '');
        me.parentNode.insertBefore(mount, me);
      }

      fetch(BASE + 'sections/' + section + '.html', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.text(); })
        .then(function (html) {
          var frag = document.createRange().createContextualFragment(html);
          runScripts(frag);            // run scripts from this section only
          mount.appendChild(frag);     // append so multiple sections can stack
        })
        .catch(function (err) {
          console.error('[ZENQ] Failed to load section "' + section + '":', err);
          mount.insertAdjacentHTML('beforeend',
            '<div style="color:#800;font-weight:700">Failed to load section ' + section + '</div>');
        });
    } catch (e) {
      console.error('[ZENQ] mount error:', e);
    }
  }

  Array.prototype.forEach.call(tags, mountFromTag);
})();
