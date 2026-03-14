/* EEC Bern — main interactions (mobile menu + languages + gallery) */
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
    $$('.languageSelect').forEach(sel => { sel.value = safe; });
    renderVerses();
  }

  function initLang(){
    const current = getSavedLang();
    applyLang(current);

    $$('.lang-btn').forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      applyLang(btn.getAttribute('data-lang'));
    }));

    $$('.languageSelect').forEach(sel => {
      sel.value = current;
      sel.addEventListener('change', (e) => {
        applyLang(e.target.value);
      });
    });
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
    $$('[data-verse-ref], [data-page-verse-ref]').forEach(el => el.textContent = verse.ref);
    $$('[data-verse-text], [data-page-verse-text]').forEach(el => el.textContent = verse[lang] || verse.en);
  }

  function initVerseRotation(){
    $$('.languageSelect').forEach(sel => { sel.value = safe; });
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
    const closeBtn = $('[data-lightbox-close]', box);
    const zoomBtn = $('[data-lightbox-zoom]', box);
    const nextBtn = $('[data-lightbox-next]', box);
    const prevBtn = $('[data-lightbox-prev]', box);
    const caption = $('[data-lightbox-caption]', box);
    let scale = 1;
    let gallery = [];
    let currentIndex = 0;

    const resetZoom = () => {
      scale = 1;
      img.style.transform = 'scale(1)';
      box.classList.remove('is-zoomed');
      if(zoomBtn) zoomBtn.textContent = '＋';
    };
    const syncButtons = () => {
      if(prevBtn) prevBtn.style.visibility = gallery.length > 1 ? 'visible' : 'hidden';
      if(nextBtn) nextBtn.style.visibility = gallery.length > 1 ? 'visible' : 'hidden';
    };
    const renderSlide = () => {
      const item = gallery[currentIndex];
      if(!item) return;
      img.src = item.href;
      img.alt = item.alt || '';
      if(caption) caption.textContent = item.title || item.alt || '';
      syncButtons();
      resetZoom();
    };
    const open = (items, index=0) => {
      gallery = items;
      currentIndex = index;
      renderSlide();
      box.classList.add('open');
      document.body.classList.add('menu-open');
    };
    const close = () => {
      box.classList.remove('open');
      document.body.classList.remove('menu-open');
      resetZoom();
      img.src = '';
    };
    const next = () => {
      if(!gallery.length) return;
      currentIndex = (currentIndex + 1) % gallery.length;
      renderSlide();
    };
    const prev = () => {
      if(!gallery.length) return;
      currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
      renderSlide();
    };
    const toggleZoom = () => {
      scale = scale === 1 ? 1.9 : 1;
      img.style.transform = `scale(${scale})`;
      box.classList.toggle('is-zoomed', scale > 1);
      if(zoomBtn) zoomBtn.textContent = scale > 1 ? '↺' : '＋';
    };

    $$('[data-gallery]').forEach(group => {
      const items = $$('a', group).map(a => ({
        href: a.getAttribute('href'),
        alt: $('img', a)?.getAttribute('alt') || '',
        title: a.getAttribute('data-title') || $('img', a)?.getAttribute('alt') || ''
      }));
      $$('a', group).forEach((a, index) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          open(items, index);
        });
      });
    });
    if(closeBtn){ closeBtn.innerHTML='✕'; closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); }); }
    if(zoomBtn) zoomBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });
    if(nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });
    if(prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    img && img.addEventListener('click', (e) => { e.stopPropagation(); toggleZoom(); });
    box.addEventListener('click', () => close());
    $('.lightbox__stage', box)?.addEventListener('click', (e) => e.stopPropagation());
    $('.lightbox__toolbar', box)?.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', (e) => {
      if(!box.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
      if(e.key.toLowerCase() === 'z') toggleZoom();
    });
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


// Safe mobile mega menu toggle
(function(){
  const megaLink = document.querySelector('[data-mega-toggle]');
  const nav = document.getElementById('site-nav');
  if(!megaLink || !nav) return;
  megaLink.addEventListener('click', function(e){
    if(window.innerWidth <= 980 && nav.classList.contains('open')){
      const item = megaLink.closest('.nav-item--mega');
      if(item){
        e.preventDefault();
        item.classList.toggle('is-open');
        const menu = item.querySelector('.mega-menu');
        if(menu){
          menu.style.display = item.classList.contains('is-open') ? 'block' : 'none';
        }
      }
    }
  });
})();



// V21 amazing upgrade: verse rotation + gallery slider
(function(){
  const rotator = document.querySelector('[data-verse-rotator]');
  if(rotator){
    const refEl = rotator.querySelector('[data-verse-ref]');
    const textEl = rotator.querySelector('[data-verse-text]');
    const verseSet = [
      {ref:'Psalm 100:2', text:'“Worship the Lord with gladness; come before him with joyful songs.”'},
      {ref:'Hebrews 10:25', text:'“Let us not give up meeting together, but encourage one another.”'},
      {ref:'1 Peter 4:10', text:'“Each of you should use whatever gift you have received to serve others.”'},
      {ref:'Matthew 18:20', text:'“For where two or three gather in my name, there am I with them.”'}
    ];
    let v = 0;
    setInterval(() => {
      v = (v + 1) % verseSet.length;
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        refEl.textContent = verseSet[v].ref;
        textEl.textContent = verseSet[v].text;
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
      }, 180);
    }, 4200);
  }

  const slider = document.querySelector('[data-gallery-slider]');
  if(slider){
    const track = slider.querySelector('[data-gallery-track]');
    const prev = slider.querySelector('.gallery-nav--prev');
    const next = slider.querySelector('.gallery-nav--next');
    const slides = Array.from(track.children);
    let index = 0;

    function slidesPerView(){
      if(window.innerWidth <= 700) return 1;
      if(window.innerWidth <= 980) return 2;
      return 3;
    }
    function update(){
      const perView = slidesPerView();
      const slideWidth = slides[0].getBoundingClientRect().width + 18;
      const maxIndex = Math.max(0, slides.length - perView);
      index = Math.max(0, Math.min(index, maxIndex));
      track.style.transform = `translateX(-${index * slideWidth}px)`;
    }
    if(prev) prev.addEventListener('click', () => { index -= 1; update(); });
    if(next) next.addEventListener('click', () => { index += 1; update(); });
    window.addEventListener('resize', update);
    update();
  }
})();


document.addEventListener("scroll",function(){
document.querySelectorAll(".section").forEach(el=>{
const rect = el.getBoundingClientRect()
if(rect.top < window.innerHeight-80){
el.classList.add("reveal","show")
}
})
})

// gallery zoom

document.querySelectorAll('.gallery-item').forEach(el=>{
el.addEventListener('click',()=>{
const overlay=document.createElement('div')
overlay.style.position='fixed'
overlay.style.inset='0'
overlay.style.background='rgba(0,0,0,.8)'
overlay.style.display='flex'
overlay.style.alignItems='center'
overlay.style.justifyContent='center'
overlay.innerHTML='<div style="background:white;padding:40px;border-radius:20px">'+el.innerText+'</div>'
overlay.onclick=()=>overlay.remove()
document.body.appendChild(overlay)
})
})



// V25: fellowship slider (one square photo at a time)
(function(){
  const slider = document.querySelector('[data-fellowship-slider]');
  if(!slider) return;
  const track = slider.querySelector('.fellowship-slider__track');
  const slides = Array.from(track.children);
  const prev = slider.querySelector('.slider-btn--prev');
  const next = slider.querySelector('.slider-btn--next');
  let index = 0;

  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;
    if(prev) prev.disabled = index === 0;
    if(next) next.disabled = index === slides.length - 1;
    if(prev) prev.style.opacity = index === 0 ? '.45' : '1';
    if(next) next.style.opacity = index === slides.length - 1 ? '.45' : '1';
  }
  if(prev) prev.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
  if(next) next.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); update(); });
  update();
})();



// V26: one-photo-at-a-time fellowship slider
(function(){
  const slider = document.querySelector('[data-fellowship-slider]');
  if(!slider) return;
  const track = slider.querySelector('.fellowship-slider__track');
  const slides = Array.from(track.children);
  const prev = slider.querySelector('.slider-btn--prev');
  const next = slider.querySelector('.slider-btn--next');
  let index = 0;
  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;
    if(prev){ prev.disabled = index === 0; prev.style.opacity = index === 0 ? '.45' : '1'; }
    if(next){ next.disabled = index === slides.length - 1; next.style.opacity = index === slides.length - 1 ? '.45' : '1'; }
  }
  if(prev) prev.addEventListener('click', ()=>{ index = Math.max(0, index-1); update(); });
  if(next) next.addEventListener('click', ()=>{ index = Math.min(slides.length-1, index+1); update(); });
  update();
})();

// V26: lightbox with zoom and close
(function(){
  if(document.querySelector('.lightbox')) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = `
    <div class="lightbox__inner">
      <div class="lightbox__toolbar">
        <button class="lightbox__btn lightbox__btn--zoom" type="button">Zoom</button>
        <button class="lightbox__btn lightbox__btn--close" type="button">Close</button>
      </div>
      <div class="lightbox__stage"><img alt=""></div>
      <div class="lightbox__caption"></div>
    </div>`;
  document.body.appendChild(box);

  const img = box.querySelector('img');
  const caption = box.querySelector('.lightbox__caption');
  const zoomBtn = box.querySelector('.lightbox__btn--zoom');
  const closeBtn = box.querySelector('.lightbox__btn--close');
  let zoomed = false;

  function openLightbox(src, title){
    img.src = src;
    caption.textContent = title || '';
    img.style.transform = 'scale(1)';
    img.style.transition = 'transform .22s ease';
    zoomed = false;
    zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
  }
  function closeLightbox(){ box.classList.remove('is-open'); }

  document.addEventListener('click', function(e){
    const link = e.target.closest('[data-gallery] a, a[data-title].fellowship-slide, .church-gallery-card, .ministry-photo-link');
    if(!link) return;
    if(link.getAttribute('href')){
      e.preventDefault();
      openLightbox(link.getAttribute('href'), link.getAttribute('data-title') || link.textContent.trim());
    }
  });

  zoomBtn.addEventListener('click', function(){
    zoomed = !zoomed;
    img.style.transform = zoomed ? 'scale(1.35)' : 'scale(1)';
    zoomBtn.textContent = zoomed ? 'Reset' : 'Zoom';
  });
  closeBtn.addEventListener('click', closeLightbox);
  box.addEventListener('click', function(e){ if(e.target === box) closeLightbox(); });
})();



// V27: refined lightbox behavior for uniform gallery and ministry photos
(function(){
  const box = document.querySelector('.lightbox');
  if(!box) return;
  const img = box.querySelector('.lightbox__stage img');
  const caption = box.querySelector('.lightbox__caption');
  const zoomBtn = box.querySelector('.lightbox__btn--zoom');
  const closeBtn = box.querySelector('.lightbox__btn--close');
  let zoomed = false;

  function openLightbox(src, title){
    if(!img) return;
    img.src = src;
    caption.textContent = title || '';
    img.style.transform = 'scale(1)';
    img.style.transition = 'transform .22s ease';
    zoomed = false;
    if(zoomBtn) zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    box.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function(e){
    const link = e.target.closest('.uniform-gallery-card, .ministry-photo-link');
    if(!link) return;
    const src = link.getAttribute('href');
    if(!src) return;
    e.preventDefault();
    openLightbox(src, link.getAttribute('data-title') || '');
  });

  if(zoomBtn){
    zoomBtn.addEventListener('click', function(){
      zoomed = !zoomed;
      if(img) img.style.transform = zoomed ? 'scale(1.22)' : 'scale(1)';
      zoomBtn.textContent = zoomed ? 'Reset' : 'Zoom';
    });
  }
  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
  box.addEventListener('click', function(e){
    if(e.target === box) closeLightbox();
  });
})();



// V28: pastor photo uses same lightbox
(function(){
  document.addEventListener('click', function(e){
    const link = e.target.closest('.pastor-photo-link');
    if(!link) return;
    const box = document.querySelector('.lightbox');
    const img = box ? box.querySelector('.lightbox__stage img') : null;
    const caption = box ? box.querySelector('.lightbox__caption') : null;
    const zoomBtn = box ? box.querySelector('.lightbox__btn--zoom') : null;
    if(!box || !img) return;
    e.preventDefault();
    img.src = link.getAttribute('href');
    if(caption) caption.textContent = link.getAttribute('data-title') || 'Pastor profile';
    img.style.transform = 'scale(1)';
    if(zoomBtn) zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
})();



// V29: unified pastor section uses lightbox
(function(){
  document.addEventListener('click', function(e){
    const link = e.target.closest('.pastor-unified-photo');
    if(!link) return;
    const box = document.querySelector('.lightbox');
    const img = box ? box.querySelector('.lightbox__stage img') : null;
    const caption = box ? box.querySelector('.lightbox__caption') : null;
    const zoomBtn = box ? box.querySelector('.lightbox__btn--zoom') : null;
    if(!box || !img) return;
    e.preventDefault();
    img.src = link.getAttribute('href');
    if(caption) caption.textContent = link.getAttribute('data-title') || 'Pastor profile';
    img.style.transform = 'scale(1)';
    if(zoomBtn) zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
})();



// V34 header language dropdown
(function(){
  const wrap = document.querySelector('.header-lang');
  const toggle = wrap ? wrap.querySelector('.header-lang__toggle') : null;
  if(toggle && wrap){
    toggle.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', wrap.classList.contains('is-open') ? 'true' : 'false');
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)){
        wrap.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  }
})();

// V34 rotating verse middle section
(function(){
  const card = document.querySelector('[data-rotating-verse]');
  if(!card) return;
  const refEl = card.querySelector('[data-verse-ref]');
  const textEl = card.querySelector('[data-verse-text]');
  const verses = [
    {ref:'Psalm 34:18', text:'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'},
    {ref:'Matthew 11:28', text:'Come to me, all you who are weary and burdened, and I will give you rest.'},
    {ref:'John 14:27', text:'Peace I leave with you; my peace I give you.'},
    {ref:'Romans 15:13', text:'May the God of hope fill you with all joy and peace as you trust in him.'}
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % verses.length;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      refEl.textContent = verses[i].ref;
      textEl.textContent = '“' + verses[i].text + '”';
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 180);
  }, 4200);
})();

// V34 pastor photo preview uses existing lightbox
(function(){
  document.addEventListener('click', function(e){
    const link = e.target.closest('.pastor-home-photo');
    if(!link) return;
    const box = document.querySelector('[data-lightbox], .lightbox');
    const img = box ? box.querySelector('.lightbox__stage img, img') : null;
    const caption = box ? box.querySelector('.lightbox__caption') : null;
    const zoomBtn = box ? box.querySelector('.lightbox__btn--zoom, [data-lightbox-zoom]') : null;
    if(!box || !img) return;
    e.preventDefault();
    img.src = link.getAttribute('href');
    if(caption) caption.textContent = link.getAttribute('data-title') || 'Pastor profile';
    img.style.transform = 'scale(1)';
    if(zoomBtn) zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
})();


// V35 working header language dropdown
(function(){
  const wrap = document.querySelector('.header-lang');
  const toggle = wrap ? wrap.querySelector('.header-lang__toggle') : null;
  if(toggle && wrap){
    toggle.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', wrap.classList.contains('is-open') ? 'true' : 'false');
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)){
        wrap.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
    wrap.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        wrap.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        const lang = this.getAttribute('data-lang');
        localStorage.setItem('lang', lang);
        if(typeof window.setLang === 'function'){
          window.setLang(lang);
        } else {
          document.documentElement.setAttribute('lang', lang);
          location.reload();
        }
      });
    });
    const current = localStorage.getItem('lang') || 'en';
    const active = wrap.querySelector('.lang-btn[data-lang="' + current + '"]');
    if(active) active.classList.add('is-active');
  }
})();

// V35 rotating verse
(function(){
  const card = document.querySelector('[data-rotating-verse]');
  if(!card) return;
  const refEl = card.querySelector('[data-verse-ref]');
  const textEl = card.querySelector('[data-verse-text]');
  const verses = [
    {ref:'Psalm 34:18', text:'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'},
    {ref:'Matthew 11:28', text:'Come to me, all you who are weary and burdened, and I will give you rest.'},
    {ref:'John 14:27', text:'Peace I leave with you; my peace I give you.'},
    {ref:'Romans 15:13', text:'May the God of hope fill you with all joy and peace as you trust in him.'},
    {ref:'Isaiah 41:10', text:'Do not fear, for I am with you; do not be dismayed, for I am your God.'}
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % verses.length;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      refEl.textContent = verses[i].ref;
      textEl.textContent = '“' + verses[i].text + '”';
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 180);
  }, 4200);
})();

// V35 pastor photo preview uses existing lightbox
(function(){
  document.addEventListener('click', function(e){
    const link = e.target.closest('.premium-pastor-photo');
    if(!link) return;
    const box = document.querySelector('[data-lightbox], .lightbox');
    const img = box ? box.querySelector('.lightbox__stage img, img') : null;
    const caption = box ? box.querySelector('.lightbox__caption') : null;
    const zoomBtn = box ? box.querySelector('.lightbox__btn--zoom, [data-lightbox-zoom]') : null;
    if(!box || !img) return;
    e.preventDefault();
    img.src = link.getAttribute('href');
    if(caption) caption.textContent = link.getAttribute('data-title') || 'Pastor profile';
    img.style.transform = 'scale(1)';
    if(zoomBtn) zoomBtn.textContent = 'Zoom';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
})();


// V36 language dropdown
(function(){
  const wrap = document.querySelector('.header-lang');
  const toggle = wrap ? wrap.querySelector('.header-lang__toggle') : null;
  if(!wrap || !toggle) return;
  toggle.addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    wrap.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', wrap.classList.contains('is-open') ? 'true' : 'false');
  });
  document.addEventListener('click', function(e){
    if(!wrap.contains(e.target)){
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
  wrap.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      wrap.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('is-active'));
      this.classList.add('is-active');
      const lang = this.getAttribute('data-lang');
      try { localStorage.setItem('lang', lang); } catch(e) {}
      if (typeof window.setLang === 'function') {
        window.setLang(lang);
      } else if (typeof setLang === 'function') {
        setLang(lang);
      } else {
        document.documentElement.setAttribute('lang', lang);
      }
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
    });
  });
  try {
    const current = localStorage.getItem('lang') || document.documentElement.getAttribute('lang') || 'en';
    const active = wrap.querySelector('.lang-btn[data-lang="' + current + '"]');
    if(active) active.classList.add('is-active');
  } catch(e) {}
})();

// V36 rotating verse
(function(){
  const card = document.querySelector('[data-rotating-verse]');
  if(!card) return;
  const refEl = card.querySelector('[data-verse-ref]');
  const textEl = card.querySelector('[data-verse-text]');
  const verses = [
    {ref:'Psalm 34:18', text:'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'},
    {ref:'Matthew 11:28', text:'Come to me, all you who are weary and burdened, and I will give you rest.'},
    {ref:'John 14:27', text:'Peace I leave with you; my peace I give you.'},
    {ref:'Romans 15:13', text:'May the God of hope fill you with all joy and peace as you trust in him.'},
    {ref:'Isaiah 41:10', text:'Do not fear, for I am with you; do not be dismayed, for I am your God.'}
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % verses.length;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      refEl.textContent = verses[i].ref;
      textEl.textContent = '“' + verses[i].text + '”';
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 180);
  }, 4200);
})();

// V36 custom pastor modal
(function(){
  const box = document.getElementById('v36Lightbox');
  const img = document.getElementById('v36LightboxImg');
  const cap = document.getElementById('v36LightboxCaption');
  if(!box || !img || !cap) return;
  function closeBox(){
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function(e){
    const opener = e.target.closest('[data-lightbox-open]');
    if(opener){
      e.preventDefault();
      img.src = opener.getAttribute('data-lightbox-open');
      cap.textContent = opener.getAttribute('data-lightbox-title') || '';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      return;
    }
    if(e.target.closest('[data-lightbox-close]')) closeBox();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeBox();
  });
})();

// V38 globe language menu
(function(){
  const wrap = document.querySelector('.header-lang');
  const toggle = wrap ? wrap.querySelector('.header-lang__toggle') : null;
  const menu = wrap ? wrap.querySelector('.header-lang__menu') : null;
  if(!wrap || !toggle || !menu) return;
  function openMenu(){ wrap.classList.add('is-open'); menu.hidden = false; toggle.setAttribute('aria-expanded','true'); }
  function closeMenu(){ wrap.classList.remove('is-open'); menu.hidden = true; toggle.setAttribute('aria-expanded','false'); }
  toggle.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); wrap.classList.contains('is-open') ? closeMenu() : openMenu(); });
  document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) closeMenu(); });
  wrap.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      wrap.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('is-active'));
      this.classList.add('is-active');
      const lang = this.dataset.lang;
      try { localStorage.setItem('lang', lang); } catch(e) {}
      if (typeof window.setLang === 'function') window.setLang(lang);
      else if (typeof setLang === 'function') setLang(lang);
      else document.documentElement.setAttribute('lang', lang);
      closeMenu();
    });
  });
  try {
    const current = localStorage.getItem('lang') || document.documentElement.getAttribute('lang') || 'en';
    const active = wrap.querySelector('.lang-btn[data-lang="' + current + '"]');
    if(active) active.classList.add('is-active');
  } catch(e) {}
})();

// V38 rotating verse
(function(){
  const card = document.querySelector('[data-rotating-verse]');
  if(!card) return;
  const refEl = card.querySelector('[data-verse-ref]');
  const textEl = card.querySelector('[data-verse-text]');
  const verses = [
    {ref:'Matthew 11:28', text:'Come to me, all you who are weary and burdened, and I will give you rest.'},
    {ref:'Psalm 34:18', text:'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'},
    {ref:'John 14:27', text:'Peace I leave with you; my peace I give you.'},
    {ref:'Romans 15:13', text:'May the God of hope fill you with all joy and peace as you trust in him.'},
    {ref:'Isaiah 41:10', text:'Do not fear, for I am with you; do not be dismayed, for I am your God.'}
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % verses.length;
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      refEl.textContent = verses[i].ref;
      textEl.textContent = '“' + verses[i].text + '”';
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
    }, 180);
  }, 4200);
})();

// V38 contained pastor preview
(function(){
  const box = document.getElementById('homev38Lightbox');
  const img = document.getElementById('homev38LightboxImg');
  const cap = document.getElementById('homev38LightboxCaption');
  if(!box || !img || !cap) return;
  function closeBox(){ box.classList.remove('is-open'); box.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  document.addEventListener('click', function(e){
    const opener = e.target.closest('[data-lightbox-open]');
    if(opener){
      e.preventDefault();
      img.src = opener.getAttribute('data-lightbox-open');
      cap.textContent = opener.getAttribute('data-lightbox-title') || '';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      return;
    }
    if(e.target.closest('[data-lightbox-close]')) closeBox();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeBox(); });
})();


// ===== V43 dropdown language support =====
(function(){
  function syncLanguageSelects(lang){
    document.querySelectorAll('.languageSelect, #languageSelect').forEach(function(sel){
      sel.value = lang;
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var current = 'en';
    try { current = localStorage.getItem('eec_lang') || 'en'; } catch(e){}
    syncLanguageSelects(current);

    document.querySelectorAll('.languageSelect, #languageSelect').forEach(function(sel){
      sel.addEventListener('change', function(){
        var next = this.value || 'en';
        try { localStorage.setItem('eec_lang', next); } catch(e){}
        syncLanguageSelects(next);

        if (typeof window.applyLang === 'function') {
          try { window.applyLang(next); return; } catch(e){}
        }
        if (typeof window.setLang === 'function') {
          try { window.setLang(next); return; } catch(e){}
        }
        if (typeof applyLang === 'function') {
          try { applyLang(next); return; } catch(e){}
        }
        if (typeof setLang === 'function') {
          try { setLang(next); return; } catch(e){}
        }

        document.documentElement.setAttribute('lang', next);
        document.querySelectorAll('.lang-btn').forEach(function(btn){
          btn.classList.toggle('is-active', btn.getAttribute('data-lang') === next);
        });
      });
    });
  });
})();


// ===== V44 robust language sync =====
(function(){
  const LANG_KEY = 'eec_lang';
  const supported = ['en','de','ti'];

  function translateDataAttrs(lang){
    document.querySelectorAll('[data-en],[data-de],[data-ti]').forEach(function(el){
      // Only replace direct text when element does not contain child elements with translations
      const hasNested = el.querySelector && el.querySelector('[data-en],[data-de],[data-ti]');
      const next = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
      if (!next) return;
      if (!hasNested) {
        el.textContent = next;
      }
    });
  }

  function setSelects(lang){
    document.querySelectorAll('#languageSelect, .languageSelect').forEach(function(sel){
      sel.value = lang;
    });
  }

  function setLangButtons(lang){
    document.querySelectorAll('.lang-btn').forEach(function(btn){
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function applyAll(lang){
    const safe = supported.includes(lang) ? lang : 'en';
    try { localStorage.setItem(LANG_KEY, safe); } catch(e){}
    document.documentElement.setAttribute('lang', safe);
    document.documentElement.setAttribute('data-lang', safe);
    setSelects(safe);
    setLangButtons(safe);
    translateDataAttrs(safe);

    if (typeof renderVerses === 'function') {
      try { $$('.languageSelect').forEach(sel => { sel.value = safe; });
    renderVerses(); } catch(e){}
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    let current = 'en';
    try { current = localStorage.getItem(LANG_KEY) || 'en'; } catch(e){}
    applyAll(current);

    document.querySelectorAll('#languageSelect, .languageSelect').forEach(function(sel){
      sel.addEventListener('change', function(){
        applyAll(this.value || 'en');
      });
    });
  });

  window.__eecApplyAllLang = applyAll;
})();

async function loadProgramme(){
 const res = await fetch('/assets/data/sunday-programme.json');
 const data = await res.json();
 const el = document.getElementById('programmeTable');
 if(!el) return;
 data.items.forEach(i=>{
   const row=document.createElement('div');
   row.innerHTML=`<strong>${i.title.en}</strong> — ${i.time} — ${i.room.en}`;
   el.appendChild(row);
 });
}
document.addEventListener('DOMContentLoaded',loadProgramme);


// ===== V47 premium calendar + sunday programme + reveal =====
(function(){
  function initReveal(){
    const items = Array.from(document.querySelectorAll('.reveal'));
    if(!('IntersectionObserver' in window) || !items.length){
      items.forEach(el => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    items.forEach(el=>io.observe(el));
  }

  function renderPremiumProgramme(){
    const table = document.getElementById('programmeTable');
    if(!table) return;
    fetch('/assets/data/sunday-programme.json')
      .then(r=>r.json())
      .then(data=>{
        const lang = localStorage.getItem('eec_lang') || document.documentElement.getAttribute('lang') || 'en';
        const dateEl = document.querySelector('[data-programme-date]');
        if(dateEl && data.date){ dateEl.textContent = data.date.split('-').reverse().join('.'); }
        if(table.dataset.loaded === '1') return;
        const rows = (data.items || []).map(item=>{
          const title = (item.title && (item.title[lang] || item.title.en)) || '';
          const room = (item.room && (item.room[lang] || item.room.en)) || '';
          return `<div class="programme-premium__row"><span>${title}</span><span>${item.time || ''}</span><span>${room}</span></div>`;
        }).join('');
        table.insertAdjacentHTML('beforeend', rows);
        table.dataset.loaded = '1';
      }).catch(()=>{});
  }

  function initCalendarEmbed(){
    const frame = document.querySelector('[data-calendar-embed]');
    if(!frame || !window.EEC_CONFIG) return;
    const empty = document.querySelector('[data-calendar-empty]');
    const url = (window.EEC_CONFIG.googleCalendarEmbedUrl || '').trim();
    if(url){
      frame.src = url;
      if(empty) empty.style.display = 'none';
    } else {
      frame.style.display = 'none';
      if(empty) empty.style.display = 'flex';
    }
  }

  function initProgrammeLightbox(){
    const box = document.getElementById('programmeLightbox');
    if(!box) return;
    const img = document.getElementById('programmeLightboxImg');
    const cap = document.getElementById('programmeLightboxCaption');
    const close = ()=>{
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    };
    document.addEventListener('click', function(e){
      const opener = e.target.closest('[data-programme-open]');
      if(opener){
        e.preventDefault();
        if(img) img.src = opener.getAttribute('data-programme-open') || '';
        if(cap) cap.textContent = opener.getAttribute('data-programme-title') || 'Preview';
        box.classList.add('is-open');
        box.setAttribute('aria-hidden','false');
        document.body.style.overflow='hidden';
        return;
      }
      if(e.target.closest('[data-programme-close]')) close();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initReveal();
    renderPremiumProgramme();
    initCalendarEmbed();
    initProgrammeLightbox();
  });
})();


(function(){
  function renderInlineProgramme(){
    const table = document.getElementById('programmeTableInline');
    if(!table || table.dataset.loaded === '1') return;
    fetch('/assets/data/sunday-programme.json')
      .then(r => r.json())
      .then(data => {
        const lang = localStorage.getItem('eec_lang') || document.documentElement.getAttribute('lang') || 'en';
        const dateEl = document.querySelector('#sunday-programme-inline [data-programme-date]');
        if(dateEl && data.date){ dateEl.textContent = data.date.split('-').reverse().join('.'); }
        const rows = (data.items || []).map(item => {
          const title = (item.title && (item.title[lang] || item.title.en)) || '';
          const room = (item.room && (item.room[lang] || item.room.en)) || '';
          return `<div class="programme-text-card__row"><span>${title}</span><span>${item.time || ''}</span><span>${room}</span></div>`;
        }).join('');
        table.insertAdjacentHTML('beforeend', rows);
        table.dataset.loaded = '1';
      })
      .catch(err => console.warn('Inline programme could not be loaded', err));
  }
  document.addEventListener('DOMContentLoaded', renderInlineProgramme);
})();


(function(){
  function initSharedMenu(){
    const toggle = document.querySelector('[data-mobile-toggle]');
    const nav = document.getElementById('site-nav');
    if(!toggle || !nav) return;
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    };
    const openMenu = () => {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
    };
    toggle.addEventListener('click', function(){
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', function(e){
      if(window.innerWidth > 980) return;
      if(!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth > 980){ nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
    });
  }

  function initSharedLanguage(){
    const selects = Array.from(document.querySelectorAll('.languageSelect'));
    if(!selects.length) return;
    const supported = ['en','de','ti'];
    let current = 'en';
    try{ current = localStorage.getItem('eec_lang') || document.documentElement.getAttribute('lang') || 'en'; }catch(e){}
    if(!supported.includes(current)) current = 'en';
    selects.forEach(sel => sel.value = current);
    selects.forEach(sel => {
      sel.addEventListener('change', function(e){
        const lang = e.target.value;
        try{ localStorage.setItem('eec_lang', lang); }catch(err){}
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('data-lang', lang);
        selects.forEach(other => other.value = lang);
        document.querySelectorAll('[data-en], [data-de], [data-ti]').forEach(el => {
          const next = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
          if(next && !el.querySelector('[data-en],[data-de],[data-ti]')) el.textContent = next;
        });
        if(typeof renderVerses === 'function') renderVerses();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initSharedMenu();
    initSharedLanguage();
  });
})();
