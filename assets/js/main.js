(function(){
  'use strict';

  // -----------------------------
  // Mobile menu
  // -----------------------------
  const btn = document.querySelector('[data-mobile-toggle]');
  const nav = document.querySelector('nav');

  if(btn && nav){
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
    });

    // Close menu after tapping a link (mobile)
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if(!a) return;
      if(nav.classList.contains('open')){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // -----------------------------
  // Active link highlight
  // -----------------------------
  const path = (location.pathname || '/').replace(/\/$/, '/') || '/';
  const toPath = (href) => {
    try {
      const u = new URL(href, location.origin);
      return (u.pathname || '/').replace(/\/$/, '/') || '/';
    } catch {
      return '';
    }
  };
  document.querySelectorAll('nav a').forEach(a => {
    const p = toPath(a.getAttribute('href') || '');
    if(p && (path === p || (p !== '/' && path.startsWith(p)))) a.classList.add('active');
  });

  // -----------------------------
  // Language switch + i18n
  // -----------------------------
  const LANG_KEY = 'eec_lang';
  const getLang = () => localStorage.getItem(LANG_KEY) || 'en';
  const setLang = (lang) => localStorage.setItem(LANG_KEY, lang);

  function applyI18n(lang){
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = el.getAttribute(`data-${lang}`);
      if(v) el.textContent = v;
    });
  }

  function setActiveLangButton(lang){
    document.querySelectorAll('[data-lang]').forEach(b => {
      const active = b.getAttribute('data-lang') === lang;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }

  document.querySelectorAll('[data-lang]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = b.getAttribute('data-lang') || 'en';
      setLang(lang);
      applyI18n(lang);
      setActiveLangButton(lang);
      // Update verse text immediately when switching language
      updateVerse(true);
    });
  });

  // init language
  const initialLang = getLang();
  applyI18n(initialLang);
  setActiveLangButton(initialLang);

  // -----------------------------
  // Footer year
  // -----------------------------
  const y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();

  // -----------------------------
  // Verse rotation
  // -----------------------------
  const verseBox = document.querySelector('[data-verse-rotator]');
  const verseText = document.querySelector('[data-verse-text]');
  const verseRef  = document.querySelector('[data-verse-ref]');

  const VERSES = {
    en: [
      { text: 'Come to me, all you who are weary and burdened, and I will give you rest.', ref: 'Matthew 11:28' },
      { text: 'The LORD is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
      { text: 'Trust in the LORD with all your heart and lean not on your own understanding.', ref: 'Proverbs 3:5' },
      { text: 'Let all that you do be done in love.', ref: '1 Corinthians 16:14' },
      { text: 'Be strong and courageous… for the LORD your God will be with you wherever you go.', ref: 'Joshua 1:9' },
    ],
    de: [
      { text: 'Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.', ref: 'Matthäus 11,28' },
      { text: 'Der HERR ist mein Hirte; mir wird nichts mangeln.', ref: 'Psalm 23,1' },
      { text: 'Vertraue auf den HERRN von ganzem Herzen und verlass dich nicht auf deinen Verstand.', ref: 'Sprüche 3,5' },
      { text: 'Alles, was ihr tut, geschehe in Liebe.', ref: '1. Korinther 16,14' },
      { text: 'Sei stark und mutig… denn der HERR, dein Gott, ist mit dir überall, wohin du gehst.', ref: 'Josua 1,9' },
    ]
  };

  let verseIndex = 0;
  let verseTimer = null;

  function updateVerse(immediate){
    if(!verseBox || !verseText || !verseRef) return;
    const lang = getLang();
    const list = VERSES[lang] || VERSES.en;

    // Choose a stable start based on week-of-year, but rotate afterwards
    if(immediate){
      // keep current index but clamp to list
      verseIndex = verseIndex % list.length;
    } else if(verseIndex === 0){
      const start = Math.floor((Date.now() / (7*24*60*60*1000)) % list.length);
      verseIndex = start;
    }

    const v = list[verseIndex];
    verseBox.classList.add('is-fading');
    setTimeout(() => {
      verseText.textContent = v.text;
      verseRef.textContent = v.ref;
      verseBox.classList.remove('is-fading');
    }, 180);
  }

  function startVerseRotation(){
    if(!verseBox) return;
    updateVerse(false);
    if(verseTimer) clearInterval(verseTimer);
    verseTimer = setInterval(() => {
      const lang = getLang();
      const list = VERSES[lang] || VERSES.en;
      verseIndex = (verseIndex + 1) % list.length;
      updateVerse(true);
    }, 12000);
  }

  startVerseRotation();
})();
