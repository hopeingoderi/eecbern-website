/* EEC Bern — main interactions (mobile menu + 3 languages + rotating verses) */
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $  = (sel, root=document) => root.querySelector(sel);
  const LANG_KEY = "eec_lang";
  const html = document.documentElement;
  const supported = ["en","de","ti"];

  const verses = [
    {ref:"Matthew 18:20",en:"For where two or three gather in my name, there am I with them.",de:"Denn wo zwei oder drei in meinem Namen versammelt sind, da bin ich mitten unter ihnen.",ti:"ኣብ ስመይ ክልተ ወይ ሰለስተ ኣብ ዝተኣከቡ ኣነ ኣብ ማእከሎም እየ።"},
    {ref:"Psalm 100:2",en:"Worship the Lord with gladness; come before him with joyful songs.",de:"Dient dem Herrn mit Freude; kommt vor sein Angesicht mit Jubel.",ti:"ንእግዚኣብሄር ብሓጎስ ኣምልኹ፣ ብእልልታ ናብ ቅድሚኡ ንዑ።"},
    {ref:"Hebrews 10:25",en:"Let us not give up meeting together, but encourage one another.",de:"Lasst uns unsere Zusammenkünfte nicht versäumen, sondern einander ermutigen.",ti:"ምትእኽኻብና ኣይንሕደግ፣ ግናኸ ንሓድሕድና ንተባበር።"},
    {ref:"1 Peter 4:10",en:"Use whatever gift you have received to serve others.",de:"Dient einander mit der Gabe, die jeder empfangen hat.",ti:"ነፍሲ ወከፍ ዝተቐበሎ ውህበት ንኻልኦት ንኽገልግል ይጠቀመሉ።"}
  ];

  function getSavedLang(){
    try { return localStorage.getItem(LANG_KEY) || "en"; } catch(e){ return "en"; }
  }

  function setTextByLang(root, lang){
    $$('[data-en], [data-de], [data-ti]', root).forEach(el => {
      const next = el.getAttribute('data-' + lang) || el.getAttribute('data-en') || el.textContent;
      if (next && !el.querySelector('[data-en],[data-de],[data-ti]')) el.textContent = next;
    });
  }

  function applyLang(lang){
    const safe = supported.includes(lang) ? lang : 'en';
    html.setAttribute('data-lang', safe);
    html.setAttribute('lang', safe);
    try { localStorage.setItem(LANG_KEY, safe); } catch(e){}

    $$('.lang-btn').forEach(btn => {
      const active = btn.getAttribute('data-lang') === safe;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // toggle old span-based translations if still present
    ['en','de','ti'].forEach(code => {
      $$('.lang-' + code).forEach(el => {
        el.style.display = code === safe ? '' : 'none';
      });
    });

    setTextByLang(document, safe);
    renderVerses();
  }

  function initLang(){
    applyLang(getSavedLang());
    $$('.lang-btn').forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLang(btn.getAttribute('data-lang'));
    }));
  }

  function initMobileNav(){
    const btn = $('[data-mobile-toggle]');
    const nav = $('#site-nav');
    if(!btn || !nav) return;

    const open = () => {
      nav.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };
    const close = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      nav.classList.contains('open') ? close() : open();
    });

    nav.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && e.target !== btn) close();
    });

    $$('#site-nav a').forEach(a => a.addEventListener('click', () => close()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function initActiveNav(){
    const path = location.pathname.replace(/\/index\.html$/, '/').toLowerCase();
    $$('#site-nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const target = href.replace(/\/index\.html$/, '/');
      if(target !== '#' && (path === target || (target !== '/' && path.startsWith(target)))){
        a.classList.add('is-active');
      }
      if(path === '/' && target === '/') a.classList.add('is-active');
    });
  }

  function renderVerses(){
    const lang = html.getAttribute('data-lang') || 'en';
    const index = Math.floor(Date.now() / 7000) % verses.length;
    const verse = verses[index];
    $$('[data-verse-ref], [data-footer-verse-ref], [data-page-verse-ref]').forEach(el => el.textContent = verse.ref);
    $$('[data-verse-text], [data-footer-verse-text], [data-page-verse-text]').forEach(el => el.textContent = verse[lang] || verse.en);
  }

  function initVerseRotation(){
    renderVerses();
    setInterval(renderVerses, 7000);
  }

  function initYear(){
    $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  function initLightbox(){
    const box = $('[data-lightbox]');
    if(!box) return;
    const img = $('img', box);
    $$('[data-gallery] a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        img.src = a.getAttribute('href');
        box.classList.add('open');
      });
    });
    box.addEventListener('click', () => box.classList.remove('open'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLang();
    initMobileNav();
    initActiveNav();
    initVerseRotation();
    initYear();
    initLightbox();
  });
})();
