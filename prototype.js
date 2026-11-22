/* ==========================================================================
   CardioPatch — Prototype Login, Clinical Profiles & Real-Time ECG Engine
   ========================================================================== */

const DEMO_PATIENTS = {
  javier: {
    key: "javier",
    id: "CP-2026-014",
    token: "CP-TOKEN-JM68",
    name: "Javier Mendizabal",
    ageSex: "68 yrs · Male",
    location: "Bilbao, Basque Country",
    hubId: "CardioPatch #CP-04A",
    hasArrhythmiaEvent: false,
    baseline: {
      bpm: 68,
      stMm: 0.0,
      tempC: 36.6,
      hrvMs: 42
    },
    clinicalHistory: {
      primaryDiagnosis: "Essential Hypertension & Prior Acute Myocardial Infarction (2023)",
      medications: "Aspirin 100 mg, Bisoprolol 5 mg, Atorvastatin 40 mg, Ramipril 5 mg",
      allergies: "None reported (Hypoallergenic silicone patch compatible)",
      familyHistory: "Father suffered acute myocardial infarction at age 64; mother diagnosed with chronic hypertension and hypercholesterolemia.",
      caregiver: "Carmen Mendizabal (Daughter · Authorized Secondary Alert Recipient)"
    },
    deviceSpecs: {
      model: "CardioPatch Hub v1.4 + Disposable Silicone Gel Patch",
      biosensors: "Single-Lead ECG (AD8232/MAX30003, 250 Hz) + Medical NTC Skin Thermistor",
      ingressProtection: "IP67 Water-Resistant (Continuous 24/7 wear including showering)",
      edgeAi: "TinyML 2-Tier Classifier (Filters benign exertion; flags silent ischemia/arrhythmia)",
      connectivity: "BLE 5.0 → Smartphone Gateway → TLS 1.3 EU Cloud + 24h Offline Flash Buffer",
      battery: "88% (6.1 days remaining)",
      impedance: "Optimal (< 4.2 kΩ · Good Skin Adhesion)"
    }
  },
  elena: {
    key: "elena",
    id: "CP-2026-029",
    token: "CP-TOKEN-EE72",
    name: "Elena Etxebarria",
    ageSex: "72 yrs · Female",
    location: "Rural Bizkaia (42 km from Tertiary Cardiology)",
    hubId: "CardioPatch #CP-09B",
    hasArrhythmiaEvent: true,
    baseline: {
      bpm: 76,
      stMm: -0.1,
      tempC: 36.5,
      hrvMs: 36
    },
    arrhythmiaState: {
      bpm: 134,
      stMm: -1.6,
      tempC: 35.7,
      hrvMs: 14
    },
    clinicalHistory: {
      primaryDiagnosis: "Type 2 Diabetes Mellitus, Dyslipidemia & Prior Silent Myocardial Ischemia",
      medications: "Metformin 850 mg, Empagliflozin 10 mg, Clopidogrel 75 mg, Losartan 50 mg",
      allergies: "Mild adhesive sensitivity to standard acrylic tape (Solved via breathable medical silicone)",
      familyHistory: "Mother experienced late-onset atrial fibrillation and silent myocardial infarction at age 70; brother treated for Type 2 diabetes and coronary artery disease.",
      caregiver: "Ander Etxebarria (Son · Primary Family Emergency Contact)"
    },
    deviceSpecs: {
      model: "CardioPatch Hub v1.4 + Disposable Silicone Gel Patch",
      biosensors: "Single-Lead ECG (AD8232/MAX30003, 250 Hz) + Medical NTC Skin Thermistor",
      ingressProtection: "IP67 Water-Resistant (Continuous 24/7 wear including showering)",
      edgeAi: "TinyML 2-Tier Classifier (Active 30s Pre/Post ECG Strip Capture Enabled)",
      connectivity: "BLE 5.0 → Smartphone Gateway → TLS 1.3 EU Cloud + 24h Offline Flash Buffer",
      battery: "81% (5.6 days remaining)",
      impedance: "Optimal (< 4.8 kΩ · Good Skin Adhesion)"
    }
  }
};

let selectedPatientKey = "javier";
let activePatient = null;
let sessionStartTime = 0;
let arrhythmiaActive = false;
let arrhythmiaAlertShown = false;
let isStreaming = true;
let sweepSpeedMultiplier = 1; // 1 = 25 mm/s, 2 = 50 mm/s
let audioEnabled = false;
let audioCtx = null;

// Real-time oscilloscope buffers
const ECG_BUFFER_LEN = 650;
const TEMP_BUFFER_LEN = 240;
let ecgHistory = new Array(ECG_BUFFER_LEN).fill(0);
let tempHistory = new Array(TEMP_BUFFER_LEN).fill(36.6);
let hrvHistory = new Array(TEMP_BUFFER_LEN).fill(42);
let writeCursor = 0;
let cardiacPhase = 0;
let lastBeatFlash = 0;
let lastFrameTime = performance.now();
let secondaryTickAccum = 0;

function playMedicalBeep(isAlert) {
  if (!audioEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = isAlert ? "sawtooth" : "sine";
    osc.frequency.value = isAlert ? 880 : 520;
    gain.gain.setValueAtTime(isAlert ? 0.08 : 0.025, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (isAlert ? 0.28 : 0.07));
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (isAlert ? 0.29 : 0.08));
  } catch (e) {
    // Ignore autoplay restrictions if browser blocks audio
  }
}

function updateLoginSelection(key) {
  selectedPatientKey = key;
  const p = DEMO_PATIENTS[key];
  document.querySelectorAll("[data-select-patient]").forEach((card) => {
    card.classList.toggle("selected", card.dataset.selectPatient === key);
  });
  document.getElementById("loginPatientId").textContent = p.id;
  document.getElementById("loginPatientName").textContent = p.name;
  document.getElementById("loginAccessToken").textContent = p.token;
}

function renderStatusBanner() {
  const container = document.getElementById("statusAlertContainer");
  if (!container || !activePatient) return;

  if (!activePatient.hasArrhythmiaEvent) {
    // Javier Mendizabal — Always calm & stable
    container.innerHTML = `
      <div class="stable-banner">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <span class="badge badge--yes">D4ALL Patient &amp; Clinician View &middot; Normal Sinus</span>
            <h3 style="margin-top:8px;font-size:1.25rem;">System Active &mdash; Heart Rhythm Stable</h3>
            <p style="font-size:0.9rem;margin-top:4px;opacity:0.88;">
              Edge AI Tier 0 active: normal sinus rhythm (68 BPM) and stable skin temperature (36.6 &deg;C) are logged quietly for daily clinical summary. Zero false alarms.
            </p>
          </div>
          <span style="font-family:var(--font-mono);font-size:0.82rem;font-weight:700;">NO ANOMALIES DETECTED</span>
        </div>
      </div>
    `;
    return;
  }

  // Elena Etxebarria — Pre-arrhythmia scan vs Sudden Arrhythmia Alert
  if (!arrhythmiaActive) {
    container.innerHTML = `
      <div class="stable-banner">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <span class="badge badge--yes">Edge AI Continuous Scan Active</span>
            <h3 style="margin-top:8px;font-size:1.22rem;">Monitoring Baseline Rhythm &amp; Thermoregulation...</h3>
            <p style="font-size:0.9rem;margin-top:4px;opacity:0.88;">
              Analyzing single-lead ECG morphology and NTC skin temperature in real time for silent ischemic or arrhythmic shifts.
            </p>
          </div>
          <span style="font-family:var(--font-mono);font-size:0.82rem;font-weight:700;">LIVE SCANNING</span>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="arrhythmia-banner" role="alert">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;">
          <div>
            <span class="badge" style="background:#ffffff;color:#9e1f32;">&#9888; CRITICAL EDGE AI ALERT &middot; TIER 1 ANOMALY</span>
            <h3 style="margin-top:10px;font-size:1.45rem;color:#ffffff;">
              Sudden Arrhythmia &amp; Silent ST-Segment Shift Detected (Elena Etxebarria)
            </h3>
            <p style="margin-top:6px;font-size:0.94rem;opacity:0.95;max-width:780px;">
              Irregular tachyarrhythmia (<strong>134 BPM</strong>), <strong>-1.6 mm ST-segment depression</strong>, and <strong>-0.8 &deg;C skin temperature drop</strong> detected without reported chest pain. A 30-second pre/post-event ECG strip has been locked and dispatched.
            </p>
          </div>
          <button type="button" id="ackAlertBtn" class="preset-btn" style="background:#ffffff;color:#9e1f32;border:none;font-weight:800;">
            Acknowledge Clinical Alert
          </button>
        </div>

        <div class="grid-3" style="margin-top:16px;">
          <div class="escalation-step">
            <strong>1. Patient Check-In (0&ndash;30s)</strong>
            <p style="margin-top:4px;opacity:0.9;">Gentle haptic prompt sent to Elena&rsquo;s smartphone: <em>&ldquo;Unusual heart pattern noticed. Are you comfortable?&rdquo;</em></p>
          </div>
          <div class="escalation-step">
            <strong>2. Caregiver Push Dispatched</strong>
            <p style="margin-top:4px;opacity:0.9;">High-priority mobile alert &amp; rural GPS location sent to son <strong>Ander Etxebarria</strong>.</p>
          </div>
          <div class="escalation-step">
            <strong>3. Cardiology Triage Notified</strong>
            <p style="margin-top:4px;opacity:0.9;">Encrypted 30s ECG strip &amp; thermal trend queued on <strong>Dr. Jon Azpeitia&rsquo;s</strong> clinical portal.</p>
          </div>
        </div>
      </div>
    `;

    const ackBtn = document.getElementById("ackAlertBtn");
    if (ackBtn) {
      ackBtn.addEventListener("click", () => {
        ackBtn.textContent = "Alert Acknowledged by Clinician ✓";
        ackBtn.style.background = "#246a59";
        ackBtn.style.color = "#ffffff";
      });
    }
  }
}

function triggerElenaArrhythmia() {
  if (!activePatient || !activePatient.hasArrhythmiaEvent || arrhythmiaActive) return;
  arrhythmiaActive = true;
  arrhythmiaAlertShown = true;
  renderStatusBanner();
  playMedicalBeep(true);
}

function loadPatientDashboard(key) {
  activePatient = DEMO_PATIENTS[key];
  sessionStartTime = performance.now();
  arrhythmiaActive = false;
  arrhythmiaAlertShown = false;

  // Reset buffers to patient baseline
  ecgHistory = new Array(ECG_BUFFER_LEN).fill(0);
  tempHistory = new Array(TEMP_BUFFER_LEN).fill(activePatient.baseline.tempC);
  hrvHistory = new Array(TEMP_BUFFER_LEN).fill(activePatient.baseline.hrvMs);
  writeCursor = 0;
  cardiacPhase = 0;

  // Switch views
  document.getElementById("loginView").style.display = "none";
  const dash = document.getElementById("dashboardView");
  dash.style.display = "flex";

  // Populate headers
  document.getElementById("dashPatientHeader").textContent = `${activePatient.name} (${activePatient.ageSex})`;
  document.getElementById("dashPatientSubheader").textContent =
    `Patient ID: ${activePatient.id} · ${activePatient.location} · Paired Hub: ${activePatient.hubId}`;

  const otherKey = key === "javier" ? "elena" : "javier";
  document.getElementById("switchPatientBtn").textContent = `Switch to ${DEMO_PATIENTS[otherKey].name}`;

  const replayBtn = document.getElementById("replayArrhythmiaBtn");
  replayBtn.style.display = activePatient.hasArrhythmiaEvent ? "inline-block" : "none";

  // Render Clinical & Family History
  const h = activePatient.clinicalHistory;
  document.getElementById("clinicalHistoryContent").innerHTML = `
    <div class="spec-row"><strong>Primary Diagnosis</strong><span style="text-align:right;max-width:62%;">${h.primaryDiagnosis}</span></div>
    <div class="spec-row"><strong>Active Medication</strong><span style="text-align:right;max-width:62%;">${h.medications}</span></div>
    <div class="spec-row"><strong>Allergies / Skin</strong><span style="text-align:right;max-width:62%;">${h.allergies}</span></div>
    <div class="spec-row" style="background:#fff7f8;padding:12px;border-radius:12px;margin-top:6px;">
      <strong style="color:var(--accent-crimson);">Family History</strong>
      <span style="text-align:right;max-width:65%;">${h.familyHistory}</span>
    </div>
    <div class="spec-row" style="margin-top:6px;"><strong>Emergency Contact</strong><span style="text-align:right;max-width:62%;">${h.caregiver}</span></div>
  `;

  // Render Device Characteristics
  const d = activePatient.deviceSpecs;
  document.getElementById("deviceSpecsContent").innerHTML = `
    <div class="spec-row"><strong>Device Model</strong><span style="text-align:right;max-width:62%;">${d.model}</span></div>
    <div class="spec-row"><strong>Biosensors</strong><span style="text-align:right;max-width:62%;">${d.biosensors}</span></div>
    <div class="spec-row"><strong>Water Rating</strong><span style="text-align:right;max-width:62%;">${d.ingressProtection}</span></div>
    <div class="spec-row"><strong>On-Patch Edge AI</strong><span style="text-align:right;max-width:62%;">${d.edgeAi}</span></div>
    <div class="spec-row"><strong>IoT &amp; Security</strong><span style="text-align:right;max-width:62%;">${d.connectivity}</span></div>
    <div class="spec-row"><strong>Battery &amp; Adhesion</strong><span style="text-align:right;max-width:62%;color:var(--accent-sage);font-weight:700;">${d.battery} · ${d.impedance}</span></div>
  `;

  renderStatusBanner();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Synthesize single ECG sample at cardiac phase [0..1)
function computeEcgVoltage(phase, isArrhythmic) {
  let v = (Math.random() - 0.5) * 0.025; // subtle baseline sensor noise

  if (!isArrhythmic) {
    // Clean Normal Sinus P-QRS-T morphology
    if (phase > 0.10 && phase < 0.19) {
      v += 0.14 * Math.sin(((phase - 0.10) / 0.09) * Math.PI); // P wave
    } else if (phase >= 0.24 && phase < 0.265) {
      v -= 0.14 * Math.sin(((phase - 0.24) / 0.025) * Math.PI); // Q wave
    } else if (phase >= 0.265 && phase < 0.305) {
      v += 1.15 * Math.sin(((phase - 0.265) / 0.04) * Math.PI); // R peak
    } else if (phase >= 0.305 && phase < 0.335) {
      v -= 0.28 * Math.sin(((phase - 0.305) / 0.03) * Math.PI); // S wave
    } else if (phase >= 0.45 && phase < 0.62) {
      v += 0.26 * Math.sin(((phase - 0.45) / 0.17) * Math.PI); // T wave
    }
  } else {
    // Sudden Arrhythmia + Silent ST-Segment Depression (-1.6 mm) + Fibrillatory baseline
    v += 0.06 * Math.sin(phase * Math.PI * 14) + 0.04 * Math.cos(phase * Math.PI * 23);
    if (phase >= 0.22 && phase < 0.25) {
      v -= 0.18 * Math.sin(((phase - 0.22) / 0.03) * Math.PI);
    } else if (phase >= 0.25 && phase < 0.31) {
      v += 1.05 * Math.sin(((phase - 0.25) / 0.06) * Math.PI); // Widened irregular QRS
    } else if (phase >= 0.31 && phase < 0.35) {
      v -= 0.38 * Math.sin(((phase - 0.31) / 0.04) * Math.PI);
    } else if (phase >= 0.35 && phase < 0.50) {
      v -= 0.24; // Marked ST-segment depression
    } else if (phase >= 0.50 && phase < 0.66) {
      v -= 0.16 * Math.sin(((phase - 0.50) / 0.16) * Math.PI); // Inverted ischemic T wave
    }
  }
  return v;
}

function drawEcgCanvas() {
  const canvas = document.getElementById("liveEcgCanvas");
  if (!canvas || !activePatient) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  // Medical ECG Grid lines
  ctx.strokeStyle = arrhythmiaActive ? "rgba(224, 79, 95, 0.14)" : "rgba(54, 211, 153, 0.10)";
  ctx.lineWidth = 1;
  const step = 22;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Waveform trace with erase gap ahead of sweeping cursor
  const strokeColor = arrhythmiaActive ? "#ff4d64" : "#36d399";
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.4;
  ctx.beginPath();

  const midY = h * 0.58;
  const amp = h * 0.36;
  const gapSize = 14;

  let started = false;
  for (let i = 0; i < ECG_BUFFER_LEN; i++) {
    const distFromCursor = (i - writeCursor + ECG_BUFFER_LEN) % ECG_BUFFER_LEN;
    if (distFromCursor < gapSize) {
      started = false;
      continue;
    }
    const x = (i / ECG_BUFFER_LEN) * w;
    const y = midY - ecgHistory[i] * amp;
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Leading phosphor dot
  const cursorX = (writeCursor / ECG_BUFFER_LEN) * w;
  const cursorY = midY - ecgHistory[writeCursor] * amp;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cursorX, cursorY, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawTempAndHrvCanvas() {
  const canvas = document.getElementById("liveTempCanvas");
  if (!canvas || !activePatient) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  // Subtle horizontal reference grid
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75].forEach((ratio) => {
    ctx.beginPath();
    ctx.moveTo(0, h * ratio);
    ctx.lineTo(w, h * ratio);
    ctx.stroke();
  });

  // Plot Skin Temperature (35.0 °C to 37.5 °C) in Amber
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < TEMP_BUFFER_LEN; i++) {
    const x = (i / (TEMP_BUFFER_LEN - 1)) * w;
    const norm = (tempHistory[i] - 35.0) / 2.5;
    const y = h - Math.max(0.08, Math.min(0.92, norm)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Plot HRV RMSSD (5 ms to 65 ms) in Sky Blue
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < TEMP_BUFFER_LEN; i++) {
    const x = (i / (TEMP_BUFFER_LEN - 1)) * w;
    const norm = (hrvHistory[i] - 5) / 60;
    const y = h - Math.max(0.08, Math.min(0.92, norm)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function animationLoop(now) {
  const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  if (activePatient && isStreaming) {
    // Automatically trigger sudden arrhythmia on Elena after 5 seconds
    if (activePatient.hasArrhythmiaEvent && !arrhythmiaActive && (now - sessionStartTime) > 5000) {
      triggerElenaArrhythmia();
    }

    const state = arrhythmiaActive ? activePatient.arrhythmiaState : activePatient.baseline;
    // Irregular beat-to-beat jitter during arrhythmia
    const jitter = arrhythmiaActive ? (Math.sin(now * 0.007) * 14 + (Math.random() - 0.5) * 12) : Math.sin(now * 0.0015) * 1.5;
    const instantaneousBpm = Math.max(52, Math.round(state.bpm + jitter));
    const beatsPerSec = instantaneousBpm / 60;

    // Advance oscilloscope samples
    const samplesToAdvance = Math.max(1, Math.round(dt * 125 * sweepSpeedMultiplier));
    for (let s = 0; s < samplesToAdvance; s++) {
      const prevPhase = cardiacPhase;
      cardiacPhase = (cardiacPhase + (beatsPerSec * dt) / samplesToAdvance) % 1;

      // Detect R-peak crossing around phase 0.28
      if (prevPhase < 0.28 && cardiacPhase >= 0.28) {
        lastBeatFlash = now;
        if (!arrhythmiaActive) playMedicalBeep(false);
      }

      writeCursor = (writeCursor + 1) % ECG_BUFFER_LEN;
      ecgHistory[writeCursor] = computeEcgVoltage(cardiacPhase, arrhythmiaActive);
    }

    // Update vital readouts & secondary trend every ~250ms
    secondaryTickAccum += dt;
    if (secondaryTickAccum >= 0.25) {
      secondaryTickAccum = 0;

      const currentTemp = Number((state.tempC + (Math.random() - 0.5) * 0.06).toFixed(1));
      const currentHrv = Math.max(8, Math.round(state.hrvMs + (Math.random() - 0.5) * (arrhythmiaActive ? 8 : 3)));
      tempHistory.push(currentTemp);
      tempHistory.shift();
      hrvHistory.push(currentHrv);
      hrvHistory.shift();

      const bpmEl = document.getElementById("vitalBpm");
      const rhythmEl = document.getElementById("vitalRhythmLabel");
      const stEl = document.getElementById("vitalSt");
      const stLabelEl = document.getElementById("vitalStLabel");
      const tempEl = document.getElementById("vitalTemp");
      const tempLabelEl = document.getElementById("vitalTempLabel");
      const hrvEl = document.getElementById("vitalHrv");
      const aiLabelEl = document.getElementById("vitalAiLabel");

      bpmEl.innerHTML = `${instantaneousBpm} <small style="font-size:0.95rem;">BPM</small>`;
      bpmEl.style.color = arrhythmiaActive ? "#ff4d64" : "#36d399";
      rhythmEl.textContent = arrhythmiaActive ? "Irregular Tachyarrhythmia!" : "Normal Sinus Rhythm";

      stEl.innerHTML = `${state.stMm.toFixed(1)} <small style="font-size:0.95rem;">mm</small>`;
      stEl.style.color = arrhythmiaActive ? "#ff4d64" : "#60a5fa";
      stLabelEl.textContent = arrhythmiaActive ? "Silent ST Depression" : "Isoelectric Baseline";

      tempEl.innerHTML = `${currentTemp.toFixed(1)} <small style="font-size:0.95rem;">&deg;C</small>`;
      tempEl.style.color = arrhythmiaActive ? "#ff8a98" : "#fbbf24";
      tempLabelEl.textContent = arrhythmiaActive ? "Cool Diaphoresis Drop" : "NTC Thermistor Stable";

      hrvEl.innerHTML = `${currentHrv} <small style="font-size:0.95rem;">ms</small>`;
      aiLabelEl.textContent = arrhythmiaActive ? "Edge AI: TIER 1 ALERT" : "Edge AI: Tier 0 (Quiet)";
      aiLabelEl.style.color = arrhythmiaActive ? "#ff4d64" : "#e2e8f0";
    }

    // Heartbeat icon flash
    const heartIcon = document.getElementById("beatHeartIcon");
    if (heartIcon) {
      const isFlashing = (now - lastBeatFlash) < 140;
      heartIcon.style.color = arrhythmiaActive ? "#ff4d64" : "#36d399";
      heartIcon.style.transform = isFlashing ? "scale(1.35)" : "scale(1)";
      heartIcon.style.display = "inline-block";
      heartIcon.style.transition = "transform 0.08s ease";
    }

    drawEcgCanvas();
    drawTempAndHrvCanvas();
  }

  requestAnimationFrame(animationLoop);
}

document.addEventListener("DOMContentLoaded", () => {
  // Patient card selection on login screen
  document.querySelectorAll("[data-select-patient]").forEach((card) => {
    card.addEventListener("click", () => updateLoginSelection(card.dataset.selectPatient));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        updateLoginSelection(card.dataset.selectPatient);
      }
    });
  });

  // Sign in button
  const signInBtn = document.getElementById("signInDemoBtn");
  if (signInBtn) {
    signInBtn.addEventListener("click", () => loadPatientDashboard(selectedPatientKey));
  }

  // Switch patient button inside dashboard
  const switchBtn = document.getElementById("switchPatientBtn");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      const nextKey = activePatient && activePatient.key === "javier" ? "elena" : "javier";
      updateLoginSelection(nextKey);
      loadPatientDashboard(nextKey);
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutDemoBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      activePatient = null;
      arrhythmiaActive = false;
      document.getElementById("dashboardView").style.display = "none";
      document.getElementById("loginView").style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Stream controls
  const sweepBtn = document.getElementById("toggleSweepBtn");
  if (sweepBtn) {
    sweepBtn.addEventListener("click", () => {
      isStreaming = !isStreaming;
      sweepBtn.textContent = isStreaming ? "Pause Stream" : "Resume Stream";
      sweepBtn.classList.toggle("active", isStreaming);
    });
  }

  const speedBtn = document.getElementById("toggleSpeedBtn");
  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      sweepSpeedMultiplier = sweepSpeedMultiplier === 1 ? 2 : 1;
      speedBtn.textContent = sweepSpeedMultiplier === 1 ? "Speed: 25 mm/s" : "Speed: 50 mm/s";
    });
  }

  const audioBtn = document.getElementById("toggleAudioBtn");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      audioBtn.textContent = audioEnabled ? "Audio Alert: On" : "Audio Alert: Off";
      audioBtn.classList.toggle("active", audioEnabled);
    });
  }

  const replayBtn = document.getElementById("replayArrhythmiaBtn");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      arrhythmiaActive = false;
      arrhythmiaAlertShown = false;
      sessionStartTime = performance.now() - 3500; // Re-triggers arrhythmia in 1.5s
      renderStatusBanner();
    });
  }

  requestAnimationFrame(animationLoop);
});
