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

  // Language switch (EN / DE)
  function applyI18n(lang){
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = lang === 'de' ? 'data-de' : 'data-en';
      const val = el.getAttribute(key);
      if(val) el.textContent = val;
    });
    // update active state
    document.querySelectorAll('[data-lang]').forEach(btn => {
      const isActive = (btn.getAttribute('data-lang') || '').toLowerCase() === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  const savedLang = (localStorage.getItem('eec_lang') || '').toLowerCase();
  if(savedLang === 'de' || savedLang === 'en') applyI18n(savedLang);

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = (btn.getAttribute('data-lang') || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
      localStorage.setItem('eec_lang', lang);
      applyI18n(lang);
    });
  });

  // Verse of the week (auto-rotating)
  const verses = [
    {
      en: { text: '“Come to me, all you who are weary and burdened, and I will give you rest.”', ref: 'Matthew 11:28' },
      de: { text: '“Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.”', ref: 'Matthäus 11,28' }
    },
    {
      en: { text: '“The Lord is my shepherd; I shall not want.”', ref: 'Psalm 23:1' },
      de: { text: '“Der HERR ist mein Hirte, mir wird nichts mangeln.”', ref: 'Psalm 23,1' }
    },
    {
      en: { text: '“Do not be anxious about anything… and the peace of God… will guard your hearts.”', ref: 'Philippians 4:6–7' },
      de: { text: '“Sorgt euch um nichts… und der Friede Gottes… wird eure Herzen bewahren.”', ref: 'Philipper 4,6–7' }
    },
    {
      en: { text: '“Trust in the Lord with all your heart… and he will make straight your paths.”', ref: 'Proverbs 3:5–6' },
      de: { text: '“Vertraue auf den HERRN von ganzem Herzen… und er wird deine Wege ebnen.”', ref: 'Sprüche 3,5–6' }
    },
    {
      en: { text: '“I am the way, and the truth, and the life.”', ref: 'John 14:6' },
      de: { text: '“Ich bin der Weg und die Wahrheit und das Leben.”', ref: 'Johannes 14,6' }
    }
  ];

  function getISOWeek(d){
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  }

  function getCurrentLang(){
    const html = document.documentElement;
    const langAttr = (html.getAttribute('data-lang') || html.getAttribute('lang') || '').toLowerCase();
    if(langAttr.startsWith('de')) return 'de';
    return 'en';
  }

  function applyVerse(){
    const verseTextEl = document.querySelector('[data-verse-text]');
    const verseRefEl  = document.querySelector('[data-verse-ref]');
    if(!verseTextEl || !verseRefEl) return;

    const idx = getISOWeek(new Date()) % verses.length;
    const lang = getCurrentLang();
    const v = verses[idx][lang] || verses[idx].en;

    verseTextEl.textContent = v.text;
    verseRefEl.textContent = v.ref;
  }

  // run once on load
  applyVerse();

  // if language buttons exist, re-apply the verse after switching
  document.addEventListener('click', (e) => {
    const t = e.target;
    if(!(t instanceof Element)) return;
    if(t.matches('[data-lang]')){
      // allow any existing handler to run first
      setTimeout(applyVerse, 0);
    }
  });
})();
