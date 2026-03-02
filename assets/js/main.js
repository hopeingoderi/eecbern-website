(function(){
  const btn = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('nav');
  if(btn && nav){
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // highlight active link (supports /about/ style paths)
  const path = (location.pathname || '/').replace(/\/+$/, '/');
  const normalize = (href) => {
    if(!href) return '';
    if(href === '/' || href === '/index.html') return '/';
    // allow relative folder links like "about/"
    if(!href.endsWith('/')) href = href + '/';
    if(!href.startsWith('/')) href = '/' + href;
    return href;
  };

  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const nh = normalize(href);
    if(nh && (path === nh || (nh !== '/' && path.startsWith(nh)))) a.classList.add('active');
  });

  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();
