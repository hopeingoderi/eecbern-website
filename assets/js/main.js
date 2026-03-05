(function(){
  const body = document.body;
  const header = document.querySelector("header");
  const toggle = document.querySelector("[data-mobile-toggle]");
  const nav = document.querySelector("#site-nav");

  function setHeaderH(){
    if(!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--headerH", h + "px");
  }

  if(toggle && nav){
    const closeMenu = () => {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded","false");
    };
    const openMenu = () => {
      body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded","true");
    };

    toggle.addEventListener("click", () => {
      body.classList.contains("nav-open") ? closeMenu() : openMenu();
    });

    nav.addEventListener("click", (e) => {
      if(e.target === nav) closeMenu();
    });

    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") closeMenu();
    });
  }

  window.addEventListener("load", setHeaderH);
  window.addEventListener("resize", setHeaderH);
  setHeaderH();

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();