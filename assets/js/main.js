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

  // highlight active link (supports absolute URLs)
  const path = (location.pathname || '/').replace(/\/+$/, '/');
  const toPath = (href) => {
    try {
      const u = new URL(href, location.origin);
      return (u.pathname || '/').replace(/\/+$/, '/');
    } catch(e){
      return '';
    }
  };

  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const p = toPath(href);
    if(p && (path === p || (p !== '/' && path.startsWith(p)))) a.classList.add('active');
  });

  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();
