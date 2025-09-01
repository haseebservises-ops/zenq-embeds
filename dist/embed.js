/*! ZENQ embeds – multi-section loader (idempotent) */
(function () {
  // Find all <script> tags that reference this loader and have a data-section
  var tags = Array.prototype.slice.call(
    document.querySelectorAll('script[data-section][src*="/zenq-embeds"]')
  );
  if (!tags.length) {
    // Fallback: any script ending with /embed.js that also has data-section
    tags = Array.prototype.slice.call(
      document.querySelectorAll('script[data-section]')
    ).filter(function (s) { return /\/embed\.js(\?|#|$)/.test(s.src); });
  }
  if (!tags.length) return;

  // Derive a BASE URL from the first tag's src so CSS/sections use the same pinned ref
  var firstSrc = tags[0].getAttribute('src');
  var cut = firstSrc.indexOf('/dist/embed.js');
  var BASE = cut > -1 ? firstSrc.slice(0, cut) + '/dist/' : firstSrc.replace(/embed\.js.*$/, '');
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

  // Execute any <script> nodes found inside a fragment (only for that fragment)
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

  // Keep a process-wide memory of loaded sections (extra safety)
  var LOADED = (window.__ZENQ_LOADED__ = window.__ZENQ_LOADED__ || new Set());

  function mountFromTag (me) {
    try {
      var section = (me.getAttribute('data-section') || 'bali-hero').trim();
      if (!section) return;

      // ✅ Hard guard #1: if the section id already exists in the DOM, skip
      if (document.getElementById(section)) {
        // optional cleanliness
        me.remove && me.remove();
        return;
      }

      // ✅ Hard guard #2: if we've already attempted this section, skip
      if (LOADED.has(section)) {
        me.remove && me.remove();
        return;
      }
      LOADED.add(section);

      // Mount root
      var rootSel = me.getAttribute('data-root') || '#zenq-mount';
      var mount = document.querySelector(rootSel);
      if (!mount) {
        mount = document.createElement('div');
        mount.id = rootSel.replace('#', '');
        me.parentNode.insertBefore(mount, me);
      }

      // Fetch and inject HTML
      fetch(BASE + 'sections/' + section + '.html', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.text(); })
        .then(function (html) {
          // If, between fetch and now, someone else already added the section—bail
          if (document.getElementById(section)) return;

          var frag = document.createRange().createContextualFragment(html);
          runScripts(frag);
          mount.appendChild(frag);
        })
        .catch(function (err) {
          console.error('[ZENQ] Failed to load section "' + section + '":', err);
          mount.insertAdjacentHTML('beforeend',
            '<div style="color:#800;font-weight:700">Failed to load section ' + section + '</div>');
        })
        .finally(function () {
          // prevent the same <script> tag from being processed again by SPA re-renders
          me.setAttribute('data-zenq-done', '1');
        });
    } catch (e) {
      console.error('[ZENQ] mount error:', e);
    }
  }

  tags.forEach(mountFromTag);
})();
