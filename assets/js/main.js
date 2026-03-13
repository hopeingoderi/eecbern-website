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
    $$('[data-verse-ref], [data-page-verse-ref]').forEach(el => el.textContent = verse.ref);
    $$('[data-verse-text], [data-page-verse-text]').forEach(el => el.textContent = verse[lang] || verse.en);
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



// V30 hero slider
(function(){
  const slider = document.querySelector('[data-hero-slider]');
  if(!slider) return;
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(slider.querySelectorAll('.hero-slider__dots button'));
  const prev = slider.querySelector('.hero-slider__btn--prev');
  const next = slider.querySelector('.hero-slider__btn--next');
  let index = 0;
  let timer = null;

  function show(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === index));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === index));
  }
  function start(){
    if(timer) clearInterval(timer);
    timer = setInterval(() => show(index + 1), 4800);
  }
  if(prev) prev.addEventListener('click', ()=>{ show(index - 1); start(); });
  if(next) next.addEventListener('click', ()=>{ show(index + 1); start(); });
  dots.forEach((d, i) => d.addEventListener('click', ()=>{ show(i); start(); }));
  show(0); start();
})();

// V30 language dropdown
(function(){
  const item = document.querySelector('.nav-item--lang');
  const toggle = item ? item.querySelector('.lang-toggle') : null;
  if(toggle && item){
    toggle.addEventListener('click', function(e){
      e.preventDefault();
      item.classList.toggle('is-open');
    });
  }
  document.querySelectorAll('.lang-menu [data-set-lang]').forEach(btn => {
    btn.addEventListener('click', function(){
      const lang = this.getAttribute('data-set-lang');
      localStorage.setItem('lang', lang);
      if (typeof window.setLang === 'function') {
        window.setLang(lang);
      } else {
        document.documentElement.setAttribute('lang', lang);
        location.reload();
      }
    });
  });
})();
