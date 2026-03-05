
(function(){
  'use strict';

  // Mobile menu
  const btn = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('#site-nav');

  function closeMenu(){
    if(!nav || !btn) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    document.documentElement.classList.remove('nav-open');
  }

  function toggleMenu(e){
    if(e && e.type === 'touchend'){
      e.preventDefault();
      e.stopPropagation();
    }
    if(!nav || !btn) return;
    nav.classList.toggle('open');
    const open = nav.classList.contains('open');
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('nav-open', open);
  }

  if(btn && nav){
    btn.addEventListener('click', toggleMenu);
    btn.addEventListener('touchend', toggleMenu, { passive:false });

    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if(!a) return;
      closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (e) => {
      if(!nav.classList.contains('open')) return;
      const inNav = e.target.closest('#site-nav');
      const inBtn = e.target.closest('[data-mobile-toggle]');
      if(!inNav && !inBtn) closeMenu();
    });
  }

  // Active link
  const path = (location.pathname || '/').replace(/\/$/, '/') || '/';
  const toPath = (href) => {
    try{
      const u = new URL(href, location.origin);
      return (u.pathname || '/').replace(/\/$/, '/') || '/';
    }catch{return '';}
  };
  document.querySelectorAll('#site-nav a').forEach(a=>{
    const p = toPath(a.getAttribute('href') || '');
    if(p && (path === p || (p !== '/' && path.startsWith(p)))) a.classList.add('active');
  });

  // Footer year
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();

  // Verse rotation (homepage)
  const verseText = document.querySelector('[data-verse-text]');
  const verseRef  = document.querySelector('[data-verse-ref]');
  const VERSES = [
    { ref:'Matthew 11:28', text:'Come to me, all who are weary and burdened, and I will give you rest.' },
    { ref:'Psalm 23:1', text:'The LORD is my shepherd; I shall not want.' },
    { ref:'Proverbs 3:5', text:'Trust in the LORD with all your heart and lean not on your own understanding.' },
    { ref:'Joshua 1:9', text:'Be strong and courageous… for the LORD your God will be with you wherever you go.' },
    { ref:'1 Corinthians 16:14', text:'Let all that you do be done in love.' }
  ];
  let v = 0;
  function rotateVerse(){
    if(!verseText || !verseRef) return;
    v = (v + 1) % VERSES.length;
    verseRef.textContent = VERSES[v].ref;
    verseText.textContent = '“' + VERSES[v].text + '”';
  }
  if(verseText && verseRef){
    setInterval(rotateVerse, 10000);
  }

  // Lightbox gallery
  const lb = document.querySelector('[data-lightbox]');
  const lbImg = lb ? lb.querySelector('img') : null;

  function openLightbox(src, alt){
    if(!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove('open');
    document.documentElement.style.overflow = '';
  }

  document.querySelectorAll('[data-gallery] a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const img = a.querySelector('img');
      openLightbox(img ? img.getAttribute('src') : a.getAttribute('href'), img ? img.alt : '');
    });
  });

  if(lb){
    lb.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
  }

})();
