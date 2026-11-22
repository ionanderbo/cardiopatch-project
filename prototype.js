/* ==========================================================================
   CardioPatch — Prototype Login & Real-Time Biosignal Engine
   ========================================================================== */

(function () {
  const SESSION_KEY = "cardiopatch_demo_user_v1";

  const PRESETS = {
    javier: {
      name: "Javier Mendizabal",
      age: 68,
      deviceId: "CP-2026-068",
      email: "javier.mendizabal@cardiopatch.eu",
      location: "Zona Rural (Bizkaia)",
      history: "IAM previo (2024) + Hipertensión",
      risk: "Isquemia silente sin dolor torácico",
      caregiver: "Carmen Mendizabal (Hija)"
    },
    rural: {
      name: "Miren Etxebarria",
      age: 74,
      deviceId: "CP-2026-104",
      email: "miren.etxebarria@cardiopatch.eu",
      location: "Zona Rural (Álava)",
      history: "Diabetes Tipo 2 + Hipertensión",
      risk: "Riesgo cardiovascular elevado",
      caregiver: "Jon Etxebarria (Hijo)"
    }
  };

  let animationStarted = false;
  let isPlaying = true;
  let showGrid = true;
  let activeMode = "normal";
  let ecgPhase = 0;
  let lastBeatIndex = -1;
  let trendHistory = [];

  const MODES = {
    normal: {
      bpm: 68,
      hrv: "HRV (RMSSD): 44 ms · Regular",
      temp: 36.6,
      tempTrend: "Estable (Δ 0.0 °C / 15 min)",
      stText: "0.0",
      aiTier: "TinyML Tier 0 · Sin anomalías",
      bannerText: "Sistema Activo — Ritmo Cardíaco Estable",
      bannerClass: "badge badge--yes",
      stShift: 0,
      noiseAmp: 0.4,
      speed: 0.0115,
      stroke: "#2bb673"
    },
    stairs: {
      bpm: 116,
      hrv: "HRV (RMSSD): 26 ms · Esfuerzo fisiológico",
      temp: 36.9,
      tempTrend: "Ligero ascenso (+0.3 °C por actividad)",
      stText: "-0.1",
      aiTier: "TinyML Tier 0 · Taquicardia sinusal filtrada (0 falsas alarmas)",
      bannerText: "Actividad Física Detectada — Ritmo Sinusal Normal",
      bannerClass: "badge badge--yes",
      stShift: 1.5,
      noiseAmp: 1.1,
      speed: 0.0195,
      stroke: "#f0a538"
    },
    ischemia: {
      bpm: 104,
      hrv: "HRV (RMSSD): 14 ms · Variabilidad reducida",
      temp: 35.7,
      tempTrend: "Descenso periférico (-0.9 °C en 12 min)",
      stText: "-1.6",
      aiTier: "TinyML Tier 1 · ¡Posible Isquemia Silente! Tira 30s enviada",
      bannerText: "Alerta Preventiva Activa — Comprobando Estado con Paciente",
      bannerClass: "badge badge--alert",
      stShift: 18,
      noiseAmp: 0.5,
      speed: 0.0175,
      stroke: "#ff4d64"
    },
    noise: {
      bpm: 74,
      hrv: "HRV (RMSSD): 41 ms · Filtro 0.5–40 Hz + Wavelet activo",
      temp: 36.6,
      tempTrend: "Estable · Artefacto muscular suprimido",
      stText: "0.0",
      aiTier: "Biosignal DSP · Ruido de movimiento eliminado en tiempo real",
      bannerText: "Sistema Activo — Señal Limpia Tras Filtrado DSP",
      bannerClass: "badge badge--yes",
      stShift: 0,
      noiseAmp: 6.5,
      speed: 0.0125,
      stroke: "#4cc9f0"
    }
  };

  function populateUserProfile(user) {
    const firstName = user.name.split(" ")[0] || user.name;
    document.getElementById("dashPatientBadge").textContent = `Paciente Activo · ID ${user.deviceId}`;
    document.getElementById("dashPatientTitle").textContent = `${user.name} · ${user.age} años`;
    document.getElementById("dashPatientSub").textContent = `${user.location || "Zona Rural (Bizkaia)"} · Parche Activo IP65 · Sincronizado vía BLE 5.0 con Cloud UE`;
    document.getElementById("histName").textContent = `${user.name} (${user.age} años)`;

    document.querySelectorAll(".dyn-patient-short").forEach((el) => {
      el.textContent = firstName;
    });
  }

  function showDashboard(user) {
    populateUserProfile(user);
    document.getElementById("loginGateView").style.display = "none";
    document.getElementById("authenticatedDashboard").style.display = "flex";
    if (!animationStarted) {
      animationStarted = true;
      initWaveforms();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showLogin() {
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById("authenticatedDashboard").style.display = "none";
    document.getElementById("loginGateView").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyTelemetryMode(modeKey) {
    activeMode = modeKey;
    const m = MODES[modeKey];

    document.querySelectorAll("[data-rt-mode]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.rtMode === modeKey);
    });

    document.getElementById("kpiBpm").innerHTML = `${m.bpm} <small style="font-size:1rem;font-weight:600;">BPM</small>`;
    document.getElementById("kpiHrv").textContent = m.hrv;
    document.getElementById("kpiTemp").innerHTML = `${m.temp.toFixed(1)} <small style="font-size:1rem;font-weight:600;">&deg;C</small>`;
    document.getElementById("kpiTempTrend").textContent = m.tempTrend;
    document.getElementById("kpiSt").innerHTML = `${m.stText} <small style="font-size:1rem;font-weight:600;">mm</small>`;
    document.getElementById("kpiAiTier").textContent = m.aiTier;

    const banner = document.getElementById("d4allCalmBanner");
    banner.textContent = m.bannerText;
    banner.className = m.bannerClass;

    if (modeKey === "ischemia") {
      triggerEscalationVisual(1);
    } else {
      resetEscalationVisual();
    }
  }

  let escalationTimers = [];
  function resetEscalationVisual() {
    escalationTimers.forEach((t) => clearTimeout(t));
    escalationTimers = [];
    ["escStep1", "escStep2", "escStep3"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("triggered");
    });
  }

  function triggerEscalationVisual(startAt = 1) {
    resetEscalationVisual();
    const steps = ["escStep1", "escStep2", "escStep3"];
    steps.forEach((id, idx) => {
      if (idx + 1 >= startAt) {
        const timer = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.classList.add("triggered");
        }, (idx - (startAt - 1)) * 1100);
        escalationTimers.push(timer);
      }
    });
  }

  function computeEcgSample(t, m, rawIndex) {
    const x = ((t % 1) + 1) % 1;
    let v = 0;

    // P wave
    if (x > 0.10 && x < 0.19) {
      v -= 7.5 * Math.sin(((x - 0.10) / 0.09) * Math.PI);
    }
    // Q dip
    if (x >= 0.24 && x < 0.27) {
      v += 9 * Math.sin(((x - 0.24) / 0.03) * Math.PI);
    }
    // R spike
    if (x >= 0.27 && x < 0.31) {
      v -= 54 * Math.sin(((x - 0.27) / 0.04) * Math.PI);
    }
    // S dip
    if (x >= 0.31 && x < 0.35) {
      v += 18 * Math.sin(((x - 0.31) / 0.04) * Math.PI);
    }
    // ST segment (depressed downward in canvas +Y when stShift > 0)
    if (x >= 0.35 && x < 0.46) {
      v += m.stShift * 0.9;
    }
    // T wave (inverted in ischemia)
    if (x >= 0.46 && x < 0.62) {
      const tWave = Math.sin(((x - 0.46) / 0.16) * Math.PI);
      v += m.stShift > 10 ? 11 * tWave : -13 * tWave;
    }

    // Subtle respiratory baseline wander + high-frequency motion component
    const resp = 2.2 * Math.sin(t * 1.4);
    const hfNoise = m.noiseAmp * (Math.sin(rawIndex * 0.47) * 0.6 + Math.cos(rawIndex * 1.13) * 0.4);
    return v + resp + hfNoise;
  }

  function initWaveforms() {
    const ecgCanvas = document.getElementById("rtEcgCanvas");
    const trendCanvas = document.getElementById("rtTrendCanvas");
    const beatDot = document.getElementById("liveBeatDot");
    if (!ecgCanvas || !trendCanvas) return;

    const ecgCtx = ecgCanvas.getContext("2d");
    const trendCtx = trendCanvas.getContext("2d");

    // Seed initial trend history
    for (let i = 0; i < 90; i++) {
      trendHistory.push({ bpm: 68 + Math.sin(i * 0.2) * 1.5, temp: 36.6 });
    }

    function drawMedicalGrid(ctx, w, h) {
      if (!showGrid) return;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
      ctx.lineWidth = 1;
      const minor = 16;
      for (let x = 0; x < w; x += minor) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += minor) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(224, 79, 95, 0.14)";
      const major = minor * 5;
      for (let x = 0; x < w; x += major) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += major) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    function renderFrame() {
      const dpr = window.devicePixelRatio || 1;
      const m = MODES[activeMode];

      // 1. Primary ECG Canvas
      const r1 = ecgCanvas.parentElement.getBoundingClientRect();
      ecgCanvas.width = r1.width * dpr;
      ecgCanvas.height = r1.height * dpr;
      ecgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w1 = r1.width;
      const h1 = r1.height;
      ecgCtx.clearRect(0, 0, w1, h1);
      drawMedicalGrid(ecgCtx, w1, h1);

      ecgCtx.strokeStyle = m.stroke;
      ecgCtx.lineWidth = 2.4;
      ecgCtx.shadowColor = m.stroke;
      ecgCtx.shadowBlur = 8;
      ecgCtx.beginPath();

      for (let px = 0; px < w1; px++) {
        const t = px / 150 + ecgPhase;
        const y = h1 * 0.56 + computeEcgSample(t, m, px + ecgPhase * 120);
        if (px === 0) ecgCtx.moveTo(px, y);
        else ecgCtx.lineTo(px, y);
      }
      ecgCtx.stroke();
      ecgCtx.shadowBlur = 0;

      // Pulse beat dot on each R-peak cycle
      const beatCycle = Math.floor(ecgPhase);
      if (beatCycle !== lastBeatIndex && isPlaying) {
        lastBeatIndex = beatCycle;
        if (beatDot) {
          beatDot.style.background = m.stroke;
          beatDot.classList.add("pulse");
          setTimeout(() => beatDot.classList.remove("pulse"), 140);
        }
        const jitterBpm = m.bpm + Math.round((Math.random() - 0.5) * 3);
        trendHistory.push({ bpm: jitterBpm, temp: m.temp });
        if (trendHistory.length > 90) trendHistory.shift();
      }

      // 2. Secondary Trend Canvas (BPM + Skin Temp)
      const r2 = trendCanvas.parentElement.getBoundingClientRect();
      trendCanvas.width = r2.width * dpr;
      trendCanvas.height = r2.height * dpr;
      trendCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w2 = r2.width;
      const h2 = r2.height;
      trendCtx.clearRect(0, 0, w2, h2);
      drawMedicalGrid(trendCtx, w2, h2);

      // Heart rate trend line (Cyan/Coral)
      trendCtx.strokeStyle = m.stroke;
      trendCtx.lineWidth = 2.2;
      trendCtx.beginPath();
      trendHistory.forEach((pt, idx) => {
        const x = (idx / (trendHistory.length - 1)) * w2;
        const normBpm = Math.max(45, Math.min(145, pt.bpm));
        const y = h2 - ((normBpm - 45) / 100) * (h2 * 0.72) - 14;
        if (idx === 0) trendCtx.moveTo(x, y);
        else trendCtx.lineTo(x, y);
      });
      trendCtx.stroke();

      // Skin temperature trend line (Soft Amber)
      trendCtx.strokeStyle = "#f5b041";
      trendCtx.lineWidth = 1.8;
      trendCtx.setLineDash([5, 4]);
      trendCtx.beginPath();
      trendHistory.forEach((pt, idx) => {
        const x = (idx / (trendHistory.length - 1)) * w2;
        const normTemp = Math.max(34.5, Math.min(38.0, pt.temp));
        const y = h2 - ((normTemp - 34.5) / 3.5) * (h2 * 0.65) - 16;
        if (idx === 0) trendCtx.moveTo(x, y);
        else trendCtx.lineTo(x, y);
      });
      trendCtx.stroke();
      trendCtx.setLineDash([]);

      if (isPlaying) {
        ecgPhase += m.speed;
      }
      requestAnimationFrame(renderFrame);
    }

    renderFrame();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("prototypeLoginForm");
    if (!form) return;

    // Preset buttons on Login screen
    document.getElementById("fillJavierBtn").addEventListener("click", () => {
      const p = PRESETS.javier;
      document.getElementById("loginPatientName").value = p.name;
      document.getElementById("loginPatientAge").value = p.age;
      document.getElementById("loginPatientId").value = p.deviceId;
      document.getElementById("loginEmail").value = p.email;
    });

    document.getElementById("fillCustomBtn").addEventListener("click", () => {
      const p = PRESETS.rural;
      document.getElementById("loginPatientName").value = p.name;
      document.getElementById("loginPatientAge").value = p.age;
      document.getElementById("loginPatientId").value = p.deviceId;
      document.getElementById("loginEmail").value = p.email;
    });

    // Login Form Submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = {
        name: document.getElementById("loginPatientName").value.trim() || "Javier Mendizabal",
        age: document.getElementById("loginPatientAge").value || 68,
        deviceId: document.getElementById("loginPatientId").value.trim() || "CP-2026-068",
        email: document.getElementById("loginEmail").value.trim()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      showDashboard(user);
    });

    // Logout button
    document.getElementById("logoutDemoBtn").addEventListener("click", showLogin);

    // Real-time Mode Buttons
    document.querySelectorAll("[data-rt-mode]").forEach((btn) => {
      btn.addEventListener("click", () => applyTelemetryMode(btn.dataset.rtMode));
    });

    // Play / Pause
    document.getElementById("rtPlayPauseBtn").addEventListener("click", (e) => {
      isPlaying = !isPlaying;
      e.currentTarget.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9654;";
    });

    // Grid Toggle
    document.getElementById("toggleGridBtn").addEventListener("click", (e) => {
      showGrid = !showGrid;
      e.currentTarget.textContent = `Cuadrícula: ${showGrid ? "ON" : "OFF"}`;
    });

    // Capture 30s ECG Strip
    document.getElementById("captureStripBtn").addEventListener("click", () => {
      const m = MODES[activeMode];
      const now = new Date().toLocaleTimeString("es-ES");
      const notice = document.getElementById("capturedStripNotice");
      notice.style.display = "block";
      notice.innerHTML = `<strong>&#10003; Tira ECG de 30 s capturada (${now}):</strong> FC ${m.bpm} BPM &middot; Temp. ${m.temp.toFixed(1)} &deg;C &middot; Segmento ST ${m.stText} mm &middot; Estado: <em>${m.aiTier}</em> (Listo para revisión del Dr. Jon Azpeitia vía HL7 FHIR).`;
    });

    // Escalation Simulation Buttons
    document.getElementById("simulateEscalationBtn").addEventListener("click", () => triggerEscalationVisual(1));
    document.getElementById("resetEscalationBtn").addEventListener("click", resetEscalationVisual);

    // Restore session if already logged in during current browser session
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        showDashboard(JSON.parse(saved));
      } catch (_) {
        showLogin();
      }
    }
  });
})();
