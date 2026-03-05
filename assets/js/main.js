
/* EEC Bern — main interactions (mobile menu + language) */
(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $  = (sel, root=document) => root.querySelector(sel);

  // ===== Language (EN / TI) =====
  const LANG_KEY = "eec_lang";
  const html = document.documentElement;

  function applyLang(lang){
    const safe = (lang === "ti") ? "ti" : "en";
    html.setAttribute("data-lang", safe);
    try{ localStorage.setItem(LANG_KEY, safe); }catch(e){}
    $$(".lang-btn").forEach(btn=>{
      const isActive = btn.getAttribute("data-lang") === safe;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function initLang(){
    let saved = "en";
    try{ saved = localStorage.getItem(LANG_KEY) || "en"; }catch(e){}
    applyLang(saved);
    $$(".lang-btn").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  // ===== Mobile nav (works with #site-nav + [data-mobile-toggle]) =====
  function initMobileNav(){
    const btn = $('[data-mobile-toggle]');
    const nav = $('#site-nav');
    if(!btn || !nav) return;

    const open = ()=>{
      nav.classList.add("open");
      btn.setAttribute("aria-expanded","true");
      document.body.classList.add("menu-open");
    };
    const close = ()=>{
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded","false");
      document.body.classList.remove("menu-open");
    };

    btn.addEventListener("click", (e)=>{
      e.preventDefault();
      nav.classList.contains("open") ? close() : open();
    });

    // close after click
    $$("#site-nav a").forEach(a=> a.addEventListener("click", close));
    // ESC
    document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") close(); });

    // iOS tap reliability
    btn.style.pointerEvents="auto";
  }

  // ===== Active link =====
  function initActiveNav(){
    const path = location.pathname.replace(/\/index\.html$/,"/").toLowerCase();
    $$("#site-nav a").forEach(a=>{
      const href=(a.getAttribute("href")||"").toLowerCase();
      if(!href || href==="https://") return;
      const target=href.replace(/\/index\.html$/,"/");
      if(target !== "#" && (path === target || path.startsWith(target))){
        a.classList.add("is-active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    initLang();
    initMobileNav();
    initActiveNav();
  });
})();
