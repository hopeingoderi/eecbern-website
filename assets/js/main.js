(function(){
  'use strict';

  // -----------------------------
  // Mobile menu (extra-robust for iPhone/Android)
// ------------------------------
const btn = document.querySelector('[data-mobile-toggle]');
const nav = document.querySelector('#site-nav');

// Some mobile browsers can be picky about click/touch on elements in complex headers.
// We'll listen to multiple event types (click / touchstart / pointerup) and also
// use a document-level capture as a fallback.
let lastToggleAt = 0;

const toggleMenu = (e) => {
  const now = Date.now();
  // prevent double-toggle when iOS fires multiple events
  if (now - lastToggleAt < 250) return;
  lastToggleAt = now;

  if (e) {
    // prevent ghost clicks / scrolling side-effects
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
    e.stopPropagation();
  }

  if (!nav) return;

  nav.classList.toggle('open');
  const isOpen = nav.classList.contains('open');

  if (btn) btn.setAttribute('aria-expanded', String(isOpen));

  // Lock page scroll behind the menu for better mobile UX
  document.documentElement.classList.toggle('nav-open', isOpen);

  // Close the menu when navigating
  if (isOpen) {
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        document.documentElement.classList.remove('nav-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }, { once: true });
    });
  }
};

if (btn) {
  // make sure it is focusable/clickable
  btn.setAttribute('type', 'button');

  btn.addEventListener('click', toggleMenu, { capture: true });
  btn.addEventListener('touchstart', toggleMenu, { passive: false, capture: true });
  btn.addEventListener('pointerup', toggleMenu, { capture: true });
}

// Fallback: if something sits on top of the button, capture clicks and
// trigger when the event originated from the toggle button anyway.
document.addEventListener('click', (e) => {
  const t = e.target && e.target.closest ? e.target.closest('[data-mobile-toggle]') : null;
  if (t) toggleMenu(e);
}, true);

document.addEventListener('touchstart', (e) => {
  const t = e.target && e.target.closest ? e.target.closest('[data-mobile-toggle]') : null;
  if (t) toggleMenu(e);
}, { passive: false, capture: true });

// Close menu when tapping outside (backdrop)
const closeMenu = () => {
  if (!nav) return;
  nav.classList.remove("open");
  document.documentElement.classList.remove("nav-open");
  if (btn) btn.setAttribute("aria-expanded", "false");
};

const isClickInsideNav = (e) => {
  const t = e.target;
  if (!t || !t.closest) return false;
  if (t.closest("#site-nav")) return true;
  if (t.closest("[data-mobile-toggle]")) return true;
  return false;
};

document.addEventListener("click", (e) => {
  if (!nav || !nav.classList.contains("open")) return;
  if (isClickInsideNav(e)) return;
  closeMenu();
}, true);

document.addEventListener("touchstart", (e) => {
  if (!nav || !nav.classList.contains("open")) return;
  if (isClickInsideNav(e)) return;
  closeMenu();
}, { passive: true, capture: true });

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
