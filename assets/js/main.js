(function(){
  const btn = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('#site-nav');

  // Mobile menu toggle
  if(btn && nav){
    const toggle = () => {
      nav.classList.toggle('open');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
    };

    // click + touchstart improves reliability on some iOS Safari cases
    btn.addEventListener('click', toggle);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); toggle(); }, {passive:false});

    // Close menu after tapping a link (mobile)
    nav.querySelectorAll('a').forEach(a => {
      const close = () => {
        if(window.matchMedia && window.matchMedia('(max-width: 860px)').matches){
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      };
      a.addEventListener('click', close);
      a.addEventListener('touchstart', (e) => { /* allow navigation */ close(); }, {passive:true});
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

    // Update button state
    document.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.getAttribute('data-lang') === safe;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };

  try {
    const stored = localStorage.getItem('lang');
    if(stored) applyLang(stored);
  } catch(e) {}

  document.querySelectorAll('[data-lang]').forEach(el => {
    const handler = (e) => { if(e) e.preventDefault(); applyLang(el.getAttribute('data-lang')); };
    el.addEventListener('click', handler);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); handler(e); }, {passive:false});
  });

  // Footer year
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();
