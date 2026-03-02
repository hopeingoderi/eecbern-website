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

  // highlight active link
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if(href === path) a.classList.add('active');
  });

  // current year
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();
})();