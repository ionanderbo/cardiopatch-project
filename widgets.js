/* ==========================================================================
   CardioPatch — Prototype ECG Sinus Wave Simulator (Health 4.0 Page)
   ========================================================================== */

function initPrototypeEcg() {
  const canvas = document.getElementById("ecgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const modes = {
    rest: {
      bpm: "68 BPM",
      temp: "36.6 °C",
      badge: "Normal Sinus Rhythm · Saved silently for daily summary",
      stShift: 0,
      speed: 0.012,
      color: "#246a59"
    },
    stairs: {
      bpm: "112 BPM",
      temp: "36.9 °C",
      badge: "Exertion (Climbing Stairs) · Filtered by AI — No false alarm",
      stShift: 0,
      speed: 0.019,
      color: "#c97a16"
    },
    warning: {
      bpm: "102 BPM",
      temp: "35.8 °C",
      badge: "Silent Warning Sign Detected · Doctor & Caregiver Alerted",
      stShift: 17,
      speed: 0.017,
      color: "#b8293d"
    }
  };

  let activeMode = "rest";
  let isPlaying = true;
  let phase = 0;

  const readout = document.getElementById("telemetryReadout");
  const playBtn = document.getElementById("telemetryPlayBtn");

  function updateStatus() {
    const m = modes[activeMode];
    if (readout) {
      readout.innerHTML = `Heart Rate: <strong>${m.bpm}</strong> · Skin Temp: <strong>${m.temp}</strong> · <span style="color:${m.color};font-weight:700;">${m.badge}</span>`;
    }
  }

  document.querySelectorAll("[data-ecg-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-ecg-mode]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeMode = btn.dataset.ecgMode;
      updateStatus();
    });
  });

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? "❚❚" : "▶";
    });
  }

  function sampleWave(t, stShift) {
    const x = t % 1;
    if (x > 0.12 && x < 0.20) return -6 * Math.sin(((x - 0.12) / 0.08) * Math.PI);
    if (x >= 0.26 && x < 0.29) return 10;
    if (x >= 0.29 && x < 0.33) return -34;
    if (x >= 0.33 && x < 0.37) return 14 + stShift;
    if (x >= 0.37 && x < 0.46) return stShift * 0.85;
    if (x >= 0.48 && x < 0.62) return -9 * Math.sin(((x - 0.48) / 0.14) * Math.PI);
    return 0;
  }

  function draw() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const m = modes[activeMode];
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = 0; px < w; px++) {
      const t = px / 115 + phase;
      const y = h * 0.56 + sampleWave(t, m.stShift);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    if (isPlaying) phase += m.speed;
    requestAnimationFrame(draw);
  }

  updateStatus();
  draw();
}

document.addEventListener("DOMContentLoaded", initPrototypeEcg);
