<!-- dist/embed.js -->
<script>
(function(){
  // --- repo config ---
  var ORG   = 'haseebservises-ops';
  var REPO  = 'zenq-embeds';
  var REF   = 'main'; // or a tag like v1.0.0 later
  var BASE  = 'https://cdn.jsdelivr.net/gh/'+ORG+'/'+REPO+'@'+REF+'/dist/';

  // which section to load?
  var me = document.currentScript || (function(){var s=document.getElementsByTagName('script');return s[s.length-1];})();
  var section  = (me.getAttribute('data-section')||'').trim();
  var mountSel = (me.getAttribute('data-mount')||'').trim();
  if(!section){ console.error('[zenq] Missing data-section'); return; }

  // inject base CSS once
  if(!document.querySelector('link[data-zenq-base]')){
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = BASE + 'zenq.css?v=' + Date.now();
    css.setAttribute('data-zenq-base','');
    document.head.appendChild(css);
  }

  // find/create mount before this script
  var mount = mountSel ? document.querySelector(mountSel) : null;
  if(!mount){
    mount = document.createElement('div');
    mount.id = 'zenq-mount-' + section;
    me.parentNode.insertBefore(mount, me);
  }

  // fetch the section HTML
  fetch(BASE + 'sections/' + section + '.html?v=' + Date.now(), {cache:'no-store'})
    .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function(html){
      mount.innerHTML = html;

      // execute any <script> tags inside the loaded HTML
      var scripts = mount.querySelectorAll('script');
      scripts.forEach(function(s){
        var n = document.createElement('script');
        if(s.src){ n.src = s.src; if(s.defer) n.defer = true; }
        else { n.textContent = s.textContent; }
        if(s.type) n.type = s.type;
        document.body.appendChild(n);
        s.remove();
      });
    })
    .catch(function(err){
      console.error('[zenq] Failed to load section "'+section+'":', err);
      mount.innerHTML = '<div style="color:#b00;font-weight:700">Failed to load section.</div>';
    });
})();
</script>
