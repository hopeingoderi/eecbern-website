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

    /* ----------------------------------------------
       Reveal-on-scroll (premium motion, safe)
       Usage: add data-reveal to any element
       ---------------------------------------------- */
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
    if (revealEls.length) {
      if (prefersReduced) {
        revealEls.forEach(el => el.classList.add("is-in"));
      } else if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(ent => {
            if (ent.isIntersecting) {
              ent.target.classList.add("is-in");
              io.unobserve(ent.target);
            }
          });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
        revealEls.forEach(el => io.observe(el));
      } else {
        revealEls.forEach(el => el.classList.add("is-in"));
      }
    }

    /* ----------------------------------------------
       Lazy YouTube embeds
       Markup:
         <div class="yt" data-youtube="VIDEO_ID"></div>
       ---------------------------------------------- */
    document.querySelectorAll(".yt[data-youtube]").forEach((wrap) => {
      const id = wrap.getAttribute("data-youtube");
      if (!id) return;

      // Lightweight poster button (no external requests until click)
      wrap.innerHTML = `
        <button class="yt-btn" type="button" aria-label="Play sermon video">
          <span class="yt-play" aria-hidden="true"></span>
          <span class="yt-text">Play</span>
        </button>
      `;

      wrap.querySelector(".yt-btn")?.addEventListener("click", () => {
        const iframe = document.createElement("iframe");
        iframe.width = "560";
        iframe.height = "315";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
        wrap.innerHTML = "";
        wrap.appendChild(iframe);
      });
    });
  });
})();
