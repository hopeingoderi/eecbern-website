/* ==========================================================
   EEC Bern — Mobile menu + small helpers
   File: /assets/js/main.js
   ========================================================== */
(() => {
  const $ = (s, el=document) => el.querySelector(s);

  function ready(fn){
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once:true });
  }

  ready(() => {
    // Year in footer
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

    const btn = $("[data-mobile-toggle]");
    const nav = $("#site-nav");
    const backdrop = $("[data-nav-backdrop]");

    if (!btn || !nav) return;

    // Ensure IDs + aria
    if (!nav.id) nav.id = "site-nav";
    btn.setAttribute("aria-controls", nav.id);
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-expanded", "false");

    const html = document.documentElement;
    const isOpen = () => html.classList.contains("nav-open");

    const openMenu = () => {
      html.classList.add("nav-open");
      btn.setAttribute("aria-expanded", "true");
      const first = nav.querySelector("a");
      if (first) first.focus({ preventScroll:true });
    };

    const closeMenu = () => {
      html.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus({ preventScroll:true });
    };

    const toggleMenu = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (isOpen()) closeMenu();
      else openMenu();
    };

    btn.addEventListener("click", toggleMenu, { passive:false });
    btn.addEventListener("touchstart", toggleMenu, { passive:false });

    if (backdrop){
      backdrop.addEventListener("click", (e) => { e.preventDefault(); closeMenu(); });
      backdrop.addEventListener("touchstart", (e) => { e.preventDefault(); closeMenu(); }, { passive:false });
    }

    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => { if (isOpen()) closeMenu(); });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) closeMenu();
    });

    const mq = window.matchMedia("(min-width: 981px)");
    const onMq = () => { if (mq.matches && isOpen()) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else mq.addListener(onMq);
  });
})();
