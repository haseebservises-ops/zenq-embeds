// 1) shared CSS
link.href = CDN + 'dist/zenq.css' + '?v=' + Date.now();

// 2) section HTML
fetch(CDN + 'dist/sections/' + section + '.html' + '?v=' + Date.now(), { cache: 'no-store' })
