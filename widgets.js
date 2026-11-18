/* ==========================================================================
   CardioPatch 4.0 — Interactive Page Widgets
   ========================================================================== */

// 1. Live ECG + Skin Temperature Telemetry Canvas (index.html)
function initTelemetryPlayer() {
  const canvas = document.getElementById("ecgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const presets = {
    normal: { bpm: 68, temp: "36.6 °C", status: "Normal Sinus Rhythm · Edge AI Tier 0 (Logged Silently)", stShift: 0, color: "#246a59" },
    silent: { bpm: 104, temp: "35.8 °C", status: "Silent ST-Depression + Cool Diaphoresis · Tier 1 Alert!", stShift: 16, color: "#b8293d" },
    burst: { bpm: 118, temp: "35.6 °C", status: "30s Pre/Post ECG Strip Dispatched to Django REST Cloud", stShift: 22, color: "#e04f5f" }
  };

  let currentMode = "normal";
  let playing = true;
  let phase = 0;

  const readoutEl = document.getElementById("telemetryReadout");
  const playBtn = document.getElementById("telemetryPlayBtn");

  function updateReadout() {
    const p = presets[currentMode];
    if (readoutEl) {
      readoutEl.innerHTML = `<strong>${p.bpm} BPM</strong> · Skin Temp: <strong>${p.temp}</strong> · <span style="color:${p.color};font-weight:700;">${p.status}</span>`;
    }
  }

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-preset]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.preset;
      updateReadout();
    });
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      playing = !playing;
      playBtn.textContent = playing ? "❚❚" : "▶";
    });
  }

  function ecgSample(t, stShift) {
    const x = t % 1;
    if (x > 0.12 && x < 0.2) return -6 * Math.sin(((x - 0.12) / 0.08) * Math.PI);
    if (x >= 0.26 && x < 0.29) return 10;
    if (x >= 0.29 && x < 0.33) return -34;
    if (x >= 0.33 && x < 0.37) return 14 + stShift;
    if (x >= 0.37 && x < 0.46) return stShift * 0.85;
    if (x >= 0.48 && x < 0.62) return -9 * Math.sin(((x - 0.48) / 0.14) * Math.PI);
    return 0;
  }

  function render() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const p = presets[currentMode];
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();

    for (let px = 0; px < w; px++) {
      const t = (px / 115) + phase;
      const y = h * 0.56 + ecgSample(t, p.stShift);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    if (playing) phase += currentMode === "normal" ? 0.012 : 0.02;
    requestAnimationFrame(render);
  }

  updateReadout();
  render();
}

// 2. Interactive 3-Step Escalation Simulator (problem.html)
function initEscalationSimulator() {
  const buttons = document.querySelectorAll("[data-esc-step]");
  const box = document.getElementById("escalationOutput");
  if (!buttons.length || !box) return;

  const steps = {
    "1": {
      title: "Step 1 (0–30s) · Calm Patient Self-Check (Javier Mendizabal)",
      detail: "Soft haptic chime + neutral sage card: 'Unusual heart pattern noticed. Are you feeling comfortable?' Prevents blood-pressure spikes from false red alarms."
    },
    "2": {
      title: "Step 2 (30–90s) · Caregiver Push Escalation (Carmen Mendizabal)",
      detail: "If Javier does not confirm or reports discomfort, Carmen receives a high-priority mobile alert with GPS location and live status summary."
    },
    "3": {
      title: "Step 3 (>90s) · Clinical Triage & 30s ECG Strip (Dr. Jon Azpeitia)",
      detail: "Encrypted 30-second pre- and post-event ECG + skin temperature trend routes via the Django REST API to the cardiology triage dashboard."
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const s = steps[btn.dataset.escStep];
      box.innerHTML = `<h4 style="margin-bottom:8px;">${s.title}</h4><p>${s.detail}</p>`;
    });
  });
}

// 3. D4ALL Patient View vs Clinician Triage View Switcher (validation.html)
function initRoleViewToggle() {
  const btns = document.querySelectorAll("[data-role-view]");
  const panel = document.getElementById("roleViewPanel");
  if (!btns.length || !panel) return;

  const views = {
    patient: `
      <div style="background:#eef5f2;border:1px solid rgba(36,106,89,0.25);border-radius:20px;padding:24px;color:#141619;">
        <span class="badge badge--yes">D4ALL Senior Mode · Large 20px Type</span>
        <h3 style="margin-top:12px;font-size:1.6rem;">System Active — Heart Rhythm Stable</h3>
        <p style="margin-top:8px;color:#4a5058;">Patch adhesion: <strong>Good (IP67)</strong> · Battery: <strong>84%</strong> · Next check: Automatic</p>
        <p style="margin-top:12px;font-size:0.92rem;">No raw ECG numbers or red warning lights are displayed, directly honoring Javier Mendizabal's feedback to avoid anxiety.</p>
      </div>`,
    clinician: `
      <div style="background:#191c20;border:1px solid rgba(255,255,255,0.14);border-radius:20px;padding:24px;color:#faf7f4;">
        <span class="badge badge--alert">Cardiology Triage · Tier-1 Anomaly Event</span>
        <h3 style="margin-top:12px;font-size:1.45rem;">Patient #04 (68M, Prior AMI) — ST Depression -1.4 mm</h3>
        <p style="margin-top:8px;opacity:0.85;">30s Pre/Post ECG Strip attached · Skin Temp drop: -0.8 °C over 12 min · Step-1 patient check unacknowledged (45s).</p>
        <p style="margin-top:12px;font-size:0.88rem;opacity:0.75;">Filtered by Edge AI to eliminate benign sinus tachycardia and prevent Dr. Azpeitia's alarm fatigue.</p>
      </div>`
  };

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      panel.innerHTML = views[btn.dataset.roleView];
    });
  });
}

// 4. Filterable Gantt Table (roadmap.html)
function initGanttFilter() {
  const tbody = document.getElementById("ganttBody");
  const filterBtns = document.querySelectorAll("[data-gantt-filter]");
  if (!tbody) return;

  function renderRows(filter) {
    const list = filter === "All"
      ? PROJECT_DATA.ganttTasks
      : PROJECT_DATA.ganttTasks.filter((t) => t.status === filter);

    tbody.innerHTML = list
      .map(
        (t) => `
        <tr>
          <td><strong>${t.week}</strong></td>
          <td>${t.phase}</td>
          <td>${t.owner}</td>
          <td>${t.task}</td>
          <td><span class="badge ${t.status === "Done" ? "badge--yes" : t.status === "In Progress" ? "badge--todo" : "badge--no"}">${t.status}</span></td>
        </tr>`
      )
      .join("");
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderRows(btn.dataset.ganttFilter);
    });
  });

  renderRows("All");
}

document.addEventListener("DOMContentLoaded", () => {
  initTelemetryPlayer();
  initEscalationSimulator();
  initRoleViewToggle();
  initGanttFilter();
});
