/* ==========================================================================
   CardioPatch — Shared Header, Menu Drawer & Footer
   ========================================================================== */

function getCurrentPage() {
  const file = window.location.pathname.split("/").pop();
  return file === "" ? "index.html" : file;
}

function rollBtn(label, href, variant = "primary") {
  return `
    <a href="${href}" class="btn-roll btn-roll--${variant} btn-wipe">
      <span class="roll-track">
        <span>${label}</span>
        <span>${label} &rarr;</span>
      </span>
    </a>
  `;
}

function buildChrome() {
  const current = getCurrentPage();

  const navItems = PROJECT_DATA.nav.map((item) => `
    <li>
      <a href="${item.href}" class="nav-link nav-wipe ${current === item.href ? "active" : ""}">
        ${item.label}
      </a>
    </li>
  `).join("");

  const drawerItems = PROJECT_DATA.nav.map((item) => `
    <li>
      <a href="${item.href}" class="btn-wipe">
        <span>${item.label}</span>
        <small style="font-size:0.76rem;opacity:0.72;">${item.desc}</small>
      </a>
    </li>
  `).join("");

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-trigger" id="openDrawerBtn" aria-label="Open menu">&#9776;</button>
          <a href="index.html" class="brand-mark">
            <span class="brand-pulse"></span>
            <span>CardioPatch</span>
          </a>
        </div>
        <ul class="nav-links">${navItems}</ul>
        <div class="topbar-right">
          ${rollBtn("Live Prototype", "health40.html#prototype", "crimson")}
        </div>
      </header>

      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <aside class="nav-drawer" id="navDrawer" aria-hidden="true">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="eyebrow eyebrow--light">CardioPatch &middot; Menu</span>
            <button class="menu-trigger" id="closeDrawerBtn" aria-label="Close menu">&#10005;</button>
          </div>
          <ul class="drawer-links">${drawerItems}</ul>
        </div>
        <p style="font-size:0.82rem;opacity:0.72;border-top:1px solid rgba(255,255,255,0.16);padding-top:16px;">
          ${PROJECT_DATA.meta.tagline}
        </p>
      </aside>
    `;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div style="max-width:640px;">
          <strong style="font-size:1.1rem;">CardioPatch &middot; Group 06</strong>
          <p style="font-size:0.84rem;opacity:0.88;margin-top:6px;">
            Sof&iacute;a Bastero &middot;
            <a href="https://ionanderbo.vercel.app" target="_blank" rel="noopener noreferrer" style="color:#faf7f4;text-decoration:underline;text-underline-offset:3px;font-weight:600;">Ion Ander Bolado</a> &middot;
            Paula de Saja &middot; Uxue San Juan
          </p>
          <p style="font-size:0.78rem;opacity:0.7;margin-top:3px;">
            Introduction to Biomedical Engineering (2026&ndash;2027) &middot; University of Deusto
          </p>
          <p style="font-size:0.82rem;opacity:0.76;margin-top:8px;">
            ${PROJECT_DATA.meta.disclaimer}
          </p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${rollBtn("Why Us?", "why-us.html", "outline")}
          ${rollBtn("Health 4.0", "health40.html", "crimson")}
        </div>
      </footer>
    `;
  }

  const openBtn = document.getElementById("openDrawerBtn");
  const closeBtn = document.getElementById("closeDrawerBtn");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  function setDrawer(open) {
    if (!drawer || !backdrop) return;
    drawer.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", String(!open));
  }

  if (openBtn) openBtn.addEventListener("click", () => setDrawer(true));
  if (closeBtn) closeBtn.addEventListener("click", () => setDrawer(false));
  if (backdrop) backdrop.addEventListener("click", () => setDrawer(false));
}

function initScrollSweeps() {
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
  try {
    buildChrome();
  } catch (err) {
    console.error("Chrome render error:", err);
  }
  try {
    initScrollSweeps();
  } catch (err) {
    document.querySelectorAll(".two-tone-sweep").forEach((b) => b.classList.add("is-revealed"));
  }
});
