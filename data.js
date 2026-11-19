/* ==========================================================================
   CardioPatch — Simplified Data Store
   ========================================================================== */

const PROJECT_DATA = {
  meta: {
    brand: "CardioPatch",
    tagline: "Continuous AI Heart Monitoring · Built in the Basque Country",
    disclaimer: "CardioPatch is a continuous monitoring and early-warning support device. It does not replace physicians or guarantee prediction of every cardiac event."
  },

  nav: [
    { href: "index.html", label: "01 · Overview", desc: "Meet the CardioPatch device" },
    { href: "clinical-needs.html", label: "02 · Clinical Needs", desc: "Why continuous monitoring matters" },
    { href: "why-us.html", label: "03 · Why Us?", desc: "Competitors, testimonials & safety" },
    { href: "health40.html", label: "04 · Health 4.0", desc: "8-area wheel & live signal demo" }
  ],

  /* 03. Why Us? — Competitor Comparison (Moved from Section 2.2) */
  competitors: [
    {
      name: "Philips ePatch",
      provider: "Philips",
      monitoring: "Continuous ECG (up to 14 days)",
      alerting: "Retrospective review only — no live alerts",
      focus: "General heart rhythm / arrhythmia"
    },
    {
      name: "Zio Monitor",
      provider: "iRhythm Technologies",
      monitoring: "Water-resistant single patch",
      alerting: "Offline analysis after mail-back return",
      focus: "Arrhythmia classification"
    },
    {
      name: "CardioSTAT",
      provider: "Icentia",
      monitoring: "Portable 6-lead handheld ECG",
      alerting: "Manual spot-checking required",
      focus: "Rhythm disorders, not silent heart attacks"
    },
    {
      name: "CardioPatch (Ours)",
      provider: "Basque Health-Tech Startup · Group 06",
      monitoring: "24/7 ECG + Skin Temperature (IP67 shower-proof)",
      alerting: "Real-time Edge AI + instant 30s ECG strip alert",
      focus: "Early warning for silent & acute cardiac events",
      highlight: true
    }
  ],

  /* 03. Why Us? — Stakeholder Voices (Moved from Section 2.3) */
  testimonials: [
    {
      person: "Dr. Jon Azpeitia",
      role: "Specialist in Cardiology",
      quote: "If your AI patch sends me 15 notifications a day for simple sinus tachycardia while a patient walks up stairs, doctors will throw the system away within a week.",
      takeaway: "Our on-patch AI filters out normal exertion and only alerts doctors when real warning signs appear."
    },
    {
      person: "Mikel Unanue",
      role: "Lead Nurse, Cardiac Rehabilitation",
      quote: "Patients stop wearing patches for two main reasons: skin itchiness from cheap hydrogels and having to take it off every time they shower.",
      takeaway: "We built a reusable IP67 waterproof core with disposable, breathable, hypoallergenic silicone patches."
    },
    {
      person: "Javier Mendizabal",
      role: "Patient (68 yrs, Hypertension & Prior Heart Attack)",
      quote: "After my heart attack, every minor twinge makes me freeze. If the patch starts beeping or flashing red by mistake, my blood pressure will spike from fear.",
      takeaway: "Your smartphone app stays calm and reassuring ('System Active — Heart Rhythm Stable') with zero scary flashing lights."
    },
    {
      person: "Carmen Mendizabal",
      role: "Family Caregiver / Daughter",
      quote: "I live away from my father. I don't need to check his heart rate every minute, but I want the app to ring loud if something actually goes wrong.",
      takeaway: "A smart 3-step alert ladder checks with the patient first, then notifies family caregivers, and escalates to medical care."
    }
  ],

  /* 03. Why Us? — Engineering Safeguards (Moved from Section 4.2 Risk Analysis) */
  safeguards: [
    {
      challenge: "Preventing False Alarms",
      solution: "On-device AI distinguishes normal heart rate rises (like climbing stairs) from dangerous ST-segment and HRV patterns before sending an alert."
    },
    {
      challenge: "All-Day Comfort & Shower Adhesion",
      solution: "Medical-grade breathable silicone adhesive prevents skin irritation and stays firmly attached during sweat and daily showers (IP67)."
    },
    {
      challenge: "Multi-Day Battery & Offline Memory",
      solution: "Low-power edge processing extends battery life and stores 24 hours of heart data locally if mobile signal drops in rural areas."
    },
    {
      challenge: "Clean, Noise-Free Readings",
      solution: "Built-in digital signal filtering removes movement and breathing interference so clinicians receive crisp, reliable 30-second ECG strips."
    }
  ],

  /* 04. Health 4.0 — Section 3.1 Review of the 8 Technological Areas (Kept Intact) */
  health40Review: [
    {
      area: "Artificial Intelligence and Quantum",
      useful: "Yes (AI) · No (Quantum)",
      justification: "AI finds unusual patterns in heart signals 24/7 to detect silent heart events and reduce false alarms. Quantum computing is not needed because our model must stay small and low-power.",
      role: "A small AI model runs on the patch and decides what matters: faster heartbeats when climbing stairs are saved quietly, while concerning signs trigger a doctor alert."
    },
    {
      area: "Biosignal Processing",
      useful: "Yes",
      justification: "ECG and skin temperature signals contain noise from movement, breathing, and skin contact, so they must be cleaned before AI analysis.",
      role: "Cleans raw signals, detects each heartbeat, measures heart rate and ECG shape changes, and saves a 30-second ECG strip before and after unusual events."
    },
    {
      area: "Internet of Things (IoT)",
      useful: "Yes",
      justification: "The patch must send data automatically without requiring any technical effort from the patient.",
      role: "Connects the chest sensors to the smartphone via Bluetooth Low Energy and forwards summaries and alerts to caregivers and doctors."
    },
    {
      area: "Cyber Security",
      useful: "Yes",
      justification: "Cardiovascular records are highly sensitive health data protected under European GDPR law.",
      role: "Encrypts data in transit and at rest, enforces secure login, and restricts access by role (doctors see clinical data; caregivers receive alerts)."
    },
    {
      area: "Cloud Computing",
      useful: "Yes",
      justification: "Healthcare professionals need one secure place to review alerts and history from any location, especially for rural patients.",
      role: "Powers the CardioPatch web platform and clinical dashboard where doctors review daily summaries, alerts, and patient history."
    },
    {
      area: "Additive Manufacturing",
      useful: "Yes",
      justification: "3D printing allows fast, low-cost prototyping of custom ergonomic enclosures.",
      role: "Produces a compact, lightweight, IP67 water-resistant case for the reusable electronics hub so patients can shower safely."
    },
    {
      area: "Augmented Reality",
      useful: "No",
      justification: "Does not help detect cardiac events and would add unnecessary cost and complexity for older adults.",
      role: "Not used."
    },
    {
      area: "Autonomous Robots",
      useful: "No",
      justification: "The patch is worn directly on the chest and requires no robotic movement or physical actuation.",
      role: "Not used."
    }
  ]
};
