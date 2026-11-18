/* ==========================================================================
   CardioPatch 4.0 — Centralized Project Data (Final Report Template Sync)
   Edit ONLY this file to fill remaining [TODO] slots in Chapters 3, 4, 5 & Annexes.
   ========================================================================== */

const PROJECT_DATA = {
  meta: {
    title: "CardioPatch 4.0",
    fullTitle: "Smart Wearable Patch with AI for Early Detection of Heart Attacks",
    subtitle: "Health 4.0 solution for the selected need in the social health care sector",
    course: "Introduction to Biomedical Engineering · Academic Year 2026–2027 · Competence SC3",
    group: "Group 06",
    submissionDate: "01/11/2026",
    professors: ["Begoña García-Zapirain Soto", "Cyrille Kesiku Yetuyetu"]
  },

  nav: [
    { href: "index.html", label: "01 · Overview", chapter: "Chapter 1 · Introduction" },
    { href: "problem.html", label: "02 · Clinical Need", chapter: "Chapter 2 · Background & Interviews" },
    { href: "solution.html", label: "03 · Health 4.0", chapter: "Chapter 3 · Architecture & 8 Areas" },
    { href: "validation.html", label: "04 · D4ALL & Trials", chapter: "Chapter 2.4 & 3.3 · Validation" },
    { href: "roadmap.html", label: "05 · Work Plan", chapter: "Chapter 4 · Gantt & Risk Matrix" },
    { href: "team.html", label: "06 · Team & Annexes", chapter: "Chapter 5 · Conclusions & Annexes" }
  ],

  options: [
    {
      id: "opt1",
      number: "Option 1",
      title: "Portable AI System for Rapid Anemia and Sepsis Diagnosis",
      proposer: "Ion Ander Bolado Gracia",
      selected: false,
      stats: "1.92B anemia cases (24.3%) [1]; 48.9M sepsis cases & 11M deaths/yr [2]; +7.6% mortality/hr delay [3].",
      summary: "Point-of-care microfluidic + spectroscopy cartridge analyzing a capillary blood drop offline with edge ML.",
      decisionNote: "Not selected: blood analysis requires specialized microfluidic and optical hardware beyond prototype scope."
    },
    {
      id: "opt2",
      number: "Option 2 · SELECTED",
      title: "Smart Wearable Patch with AI for Early Detection of Heart Attacks",
      proposer: "Sofía Bastero Echevarría",
      selected: true,
      stats: "17.9M CVD deaths/yr (32% of all deaths) [4,12]; €282B annual EU burden [13]; 45% silent MIs [14].",
      summary: "Chest-worn hypoallergenic IP67 patch streaming single-lead ECG + skin temperature to low-power AI and a secure clinical triage cloud.",
      decisionNote: "Selected for high clinical urgency, prototype feasibility, multi-area Health 4.0 synergy, and strong user value."
    },
    {
      id: "opt3",
      number: "Option 3",
      title: "AI-Powered Soft Robotic Glove with Haptic Feedback for Stroke Rehab",
      proposer: "Paula de Saja Santos",
      selected: false,
      stats: "11.9M global stroke cases in 2021 [7]; repetitive therapy limits hand motor recovery [8].",
      summary: "Flexible actuated rehabilitation glove adapting finger exercises via AI and tactile haptic cues.",
      decisionNote: "Not selected: soft robotic actuation and pneumatic/tendon mechanics add excessive hardware complexity."
    },
    {
      id: "opt4",
      number: "Option 4",
      title: "Smart Pillbox for Home Medication Management in Seniors",
      proposer: "Uxue San Juan Andion",
      selected: false,
      stats: "50% chronic non-adherence [9]; 10–30% elderly admissions from medication errors [10]; >2M seniors living alone in Spain [11].",
      summary: "3D-printed WiFi IoT pillbox with door sensors, LED/sound prompts, and family missed-dose alerts.",
      decisionNote: "Not selected: focuses primarily on adherence reminders rather than physiological biosignal AI analysis."
    }
  ],

  literatureTable: [
    {
      ref: "[12] Saha et al., Cureus",
      year: "2024",
      context: "Global populations across all regions & income levels",
      figures: "17.9M CVD deaths/year (32% of global fatalities); 85% caused by heart attacks and strokes.",
      relevance: "Establishes the global mortality scale and urgency for accessible early-detection wearables."
    },
    {
      ref: "[13] Luengo-Fernandez et al., Eur. Heart J.",
      year: "2023",
      context: "27 European Union (EU) member states",
      figures: "€282 billion/year in direct healthcare expenditure, informal care, and lost productivity.",
      relevance: "Demonstrates the macroeconomic imperative for preventative outpatient monitoring."
    },
    {
      ref: "[14] Martin et al., Circulation (AHA Update)",
      year: "2024",
      context: "General & high-risk cardiovascular populations",
      figures: "45% of all myocardial infarctions occur 'silently' without classic chest pain.",
      relevance: "Proves why symptom-driven emergency calls fail and continuous AI monitoring is essential."
    },
    {
      ref: "[15–26] Additional 2022–2025 PubMed/IEEE Studies",
      year: "2022–2025",
      context: "Wearable ECG AI, ST-segment shift & skin thermoregulation",
      figures: "[TODO: Insert remaining 12 references from Final Report bibliography]",
      relevance: "Supports multi-modal ECG + skin temperature anomaly classification."
    }
  ],

  competitors: [
    {
      name: "Philips ePatch",
      provider: "Philips",
      tech: "Continuous ECG (up to 14 days), Cloud, AI arrhythmia review",
      limitation: "Retrospective data analysis only; no real-time telemetry or acute ischemic alerts."
    },
    {
      name: "Zio Monitor",
      provider: "iRhythm Technologies",
      tech: "Water-resistant single patch, Deep Learning arrhythmia classifier",
      limitation: "Offline review after device mail-back; zero live emergency escalation."
    },
    {
      name: "CardioSTAT",
      provider: "Icentia",
      tech: "Portable 6-lead ECG (48h–14d), FDA-cleared AI + mobile app",
      limitation: "Requires manual spot-checking; targets rhythm disorders rather than silent MI."
    },
    {
      name: "CardioPatch 4.0 (Proposed)",
      provider: "Group 06 · Deusto BioEng",
      tech: "Continuous ECG + Skin Temp + Edge AI + Real-Time Triage Cloud",
      limitation: "Investigational prototype requiring clinical validation; decision-support tool (does not replace physicians)."
    }
  ],

  interviews: [
    {
      role: "Specialist in Cardiology",
      person: "Dr. Jon Azpeitia",
      date: "20/10/2026 · In person",
      quote: "If your AI patch sends me 15 notifications a day for simple sinus tachycardia while a patient walks up stairs, doctors will throw the system away within a week.",
      designAction: "Two-tier Edge AI filtering: benign physiological variations log silently; only ischemic/arrhythmic threshold crossings transmit a 30s pre/post-event ECG strip."
    },
    {
      role: "Lead Nurse, Cardiac Rehabilitation",
      person: "Mikel Unanue",
      date: "21/10/2026 · In person",
      quote: "Patients stop wearing patches for two main reasons: skin itchiness from cheap hydrogels and having to take it off every time they shower.",
      designAction: "Modular reusable electronics hub + disposable breathable hypoallergenic silicone patch rated IP67 water-resistant for uninterrupted showering."
    },
    {
      role: "High-Risk Patient (68 yrs, Hypertension & Prior AMI)",
      person: "Javier Mendizabal",
      date: "21/10/2026 · Online",
      quote: "After my heart attack, every minor twinge makes me freeze. If the patch starts beeping or flashing red by mistake, my blood pressure will spike from fear.",
      designAction: "Calm D4ALL patient UI ('System Active — Heart Rhythm Stable') using neutral sage/alabaster tones instead of alarming red gauges."
    },
    {
      role: "Informal Caregiver / Daughter",
      person: "Carmen Mendizabal",
      date: "23/10/2026 · Online",
      quote: "I live away from my father. I don't need to check his heart rate every minute, but I want the app to ring loud if something actually goes wrong.",
      designAction: "3-step escalation tree: (1) gentle patient status check-in, (2) high-priority caregiver push alert if unconfirmed, (3) emergency triage dispatch."
    }
  ],

  health40Areas: [
    { area: "Artificial Intelligence & Quantum", used: true, role: "Edge anomaly classifier distinguishing benign exertion from ST-segment / HRV / thermal ischemia signatures." },
    { area: "Biosignal Processing", used: true, role: "Real-time bandpass filtering (0.5–40 Hz), R-peak detection, HRV extraction, and skin temperature trend smoothing." },
    { area: "Internet of Things (IoT)", used: true, role: "BLE 5.0 low-energy telemetry from chest hub to smartphone gateway and cloud broker." },
    { area: "Cyber Security", used: true, role: "TLS 1.3 in-transit encryption, AES-256 at rest, pseudonymized patient IDs, and RBAC clinician login (GDPR/EU hosting)." },
    { area: "Cloud Computing", used: true, role: "Project web portal, clinician triage dashboard, EHR interoperability layer, and 30s event strip storage." },
    { area: "Additive Manufacturing", used: true, role: "3D-printed ergonomic biocompatible enclosure housing the reusable sensor hub." },
    { area: "Augmented Reality", used: false, role: "Not used: elderly target users (D4ALL) require zero-friction interfaces without AR headsets or overlays." },
    { area: "Autonomous Robots", used: false, role: "Not used: outpatient continuous monitoring relies on passive wearable sensing rather than robotic actuation." }
  ],

  ganttTasks: [
    { week: "W1–W2", phase: "Stage 1–2", owner: "All Team", task: "Topic selection (Option 2), WHO/EU/AHA literature review & 15+ PubMed references", status: "Done" },
    { week: "W3–W4", phase: "Stage 2", owner: "Sofía & Uxue", task: "Stakeholder interviews (Dr. Azpeitia, Mikel, Javier, Carmen) & D4ALL requirements", status: "Done" },
    { week: "W5–W6", phase: "Stage 3", owner: "Ion Ander", task: "Health 4.0 architecture, ECG + temperature sensor breadboard & signal filtering", status: "In Progress" },
    { week: "W7–W8", phase: "Stage 3", owner: "Paula & Sofía", task: "Lightweight AI anomaly model training (MIT-BIH / PTB-XL datasets) & 3D hub casing", status: "In Progress" },
    { week: "W9–W10", phase: "Stage 3–4", owner: "Ion Ander & Paula", task: "Web platform deployment, 3-phase Living Lab pilot & SUS usability testing", status: "Planned" },
    { week: "W11–W12", phase: "Stage 5", owner: "All Team", task: "Final report (01/11/2026), 4-page conference paper, poster & 10-min oral exam rehearsal", status: "Planned" }
  ],

  risks: [
    { risk: "False Positive Alarm Fatigue", prob: "Medium", impact: "High", mitigation: "Two-tier Edge AI threshold + 30s pre/post ECG strip verification before clinician escalation." },
    { risk: "Motion Artifacts & Electrode Detachment", prob: "Medium", impact: "High", mitigation: "Breathable hypoallergenic silicone adhesive (IP67) + accelerometer-assisted adaptive filtering." },
    { risk: "Rural Connectivity Dropouts", prob: "High", impact: "Medium", mitigation: "Local ring-buffer flash memory on patch hub storing 24h of telemetry until cellular/Wi-Fi reconnects." },
    { risk: "Patient Anxiety from False Alerts", prob: "Medium", impact: "Medium", mitigation: "Calm neutral D4ALL patient screen with step-1 self-check confirmation before family/EMS escalation." }
  ],

  team: [
    { name: "Sofía Bastero Echevarría", id: "[ID Slot]", role: "Option 2 Proposer · Clinical Need & AI Lead", focus: "Cardiovascular pathology framing, ST/HRV feature engineering, and clinical interview synthesis." },
    { name: "Ion Ander Bolado Gracia", id: "79113175Y", role: "Biosignal Hardware & Web Cloud Architect", focus: "ECG + thermal front-end acquisition, IoT telemetry pipeline, and Health 4.0 web portal." },
    { name: "Paula de Saja Santos", id: "[ID Slot]", role: "Ergonomics, Additive Casing & Validation", focus: "IP67 modular hub CAD/3D printing, 3-phase pilot protocol, and SUS assessment metrics." },
    { name: "Uxue San Juan Andion", id: "79177692P", role: "D4ALL Accessibility & Caregiver Workflow", focus: "Senior usability design, 3-tier escalation tree, risk matrix, and project documentation." }
  ]
};
