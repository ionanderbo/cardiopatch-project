/* ==========================================================================
   CardioPatch 4.0 — Shared Navigation, Drawer, Footer & Animation Triggers
   ========================================================================== */

function getCurrentFile() {
  const path = window.location.pathname.split("/").pop();
  return path === "" ? "index.html" : path;
}

function makeRollButton(label, href, variant = "primary") {
  return `
    <a href="${href}" class="btn-roll btn-roll--${variant} btn-wipe">
      <span class="roll-track">
        <span>${label}</span>
        <span>${label} →</span>
      </span>
    </a>
  `;
}

function injectLayoutShell() {
  const current = getCurrentFile();

  const navLinksHTML = PROJECT_DATA.nav
    .map(
      (item) => `
      <li>
        <a href="${item.href}" class="nav-link nav-wipe ${current === item.href ? "active" : ""}">
          ${item.label}
        </a>
      </li>`
    )
    .join("");

  const drawerLinksHTML = PROJECT_DATA.nav
    .map(
      (item) => `
      <li>
        <a href="${item.href}" class="btn-wipe">
          <span>${item.label}</span>
          <small style="font-size:0.75rem;opacity:0.7;">${item.chapter}</small>
        </a>
      </li>`
    )
    .join("");

  const headerEl = document.getElementById("site-header");
  if (headerEl) {
    headerEl.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-trigger" id="openDrawerBtn" aria-label="Open project menu">☰</button>
          <a href="index.html" class="brand-mark">
            <span class="brand-pulse"></span>
            <span>CardioPatch 4.0</span>
          </a>
        </div>
        <ul class="nav-links">${navLinksHTML}</ul>
        <div class="topbar-right">
          ${makeRollButton("Live Prototype", "validation.html", "crimson")}
        </div>
      </header>

      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <aside class="nav-drawer" id="navDrawer" aria-hidden="true">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="eyebrow eyebrow--light">Group 06 · Health 4.0</span>
            <button class="menu-trigger" id="closeDrawerBtn" aria-label="Close menu">✕</button>
          </div>
          <ul class="drawer-links">${drawerLinksHTML}</ul>
        </div>
        <div style="font-size:0.82rem;opacity:0.75;border-top:1px solid rgba(255,255,255,0.15);padding-top:16px;">
          ${PROJECT_DATA.meta.course}<br/>
          Professors: ${PROJECT_DATA.meta.professors.join(" · ")}
        </div>
      </aside>
    `;
  }

  const footerEl = document.getElementById("site-footer");
  if (footerEl) {
    footerEl.innerHTML = `
      <footer class="site-footer">
        <div>
          <strong style="font-size:1.1rem;">CardioPatch 4.0 · Group 06</strong>
          <p style="font-size:0.85rem;opacity:0.75;margin-top:4px;">
            ${PROJECT_DATA.meta.fullTitle} — ${PROJECT_DATA.meta.course}
          </p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${makeRollButton("Overview", "index.html", "outline")}
          ${makeRollButton("Health 4.0 Architecture", "solution.html", "crimson")}
        </div>
      </footer>
    `;
  }

  // Drawer interactions
  const openBtn = document.getElementById("openDrawerBtn");
  const closeBtn = document.getElementById("closeDrawerBtn");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  function toggleDrawer(show) {
    if (!drawer || !backdrop) return;
    drawer.classList.toggle("open", show);
    backdrop.classList.toggle("open", show);
    drawer.setAttribute("aria-hidden", String(!show));
  }

  if (openBtn) openBtn.addEventListener("click", () => toggleDrawer(true));
  if (closeBtn) closeBtn.addEventListener("click", () => toggleDrawer(false));
  if (backdrop) backdrop.addEventListener("click", () => toggleDrawer(false));
}

function initTwoToneScrollSweeps() {
  const bands = document.querySelectorAll(".two-tone-sweep");
  if (!bands.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  bands.forEach((band) => observer.observe(band));
}

document.addEventListener("DOMContentLoaded", () => {
  injectLayoutShell();
  initTwoToneScrollSweeps();
});
