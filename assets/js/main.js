(function(){
  const btn = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('#site-nav');

  // Mobile menu toggle
  if(btn && nav){
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
    });

    // Close menu after tapping a link (mobile)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if(window.matchMedia && window.matchMedia('(max-width: 860px)').matches){
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Highlight active link
  const path = (location.pathname || '/').replace(/\/+$/, '/');
  const toPath = (href) => {
    try {
      const u = new URL(href, location.origin);
      return (u.pathname || '/').replace(/\/+$/, '/');
    } catch(e){
      return '';
    }
  };

  document.querySelectorAll('#site-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const p = toPath(href);
    if(p && (path === p || (p !== '/' && path.startsWith(p)))) a.classList.add('active');
  });

  // Language switch (keeps preference in localStorage)
  const applyLang = (lang) => {
    const safe = (lang === 'de' || lang === 'en') ? lang : 'en';
    document.documentElement.setAttribute('lang', safe);
    document.body.setAttribute('data-lang', safe);
    try { localStorage.setItem('lang', safe); } catch(e) {}

    // Optional text swap for elements that provide data-en / data-de
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = el.getAttribute(`data-${safe}`);
      if(v) el.textContent = v;
    });
  };

  try {
    const stored = localStorage.getItem('lang');
    if(stored) applyLang(stored);
  } catch(e) {}

  document.querySelectorAll('[data-lang]').forEach(el => {
    el.addEventListener('click', () => applyLang(el.getAttribute('data-lang')));
  });

  // Footer year
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();
