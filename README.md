# CardioPatch — AI-Powered Smart Wearable Patch for Early Detection of Acute Cardiac Events

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-b8293d?style=for-the-badge&logo=vercel)](https://cardiopatch-project.vercel.app)
[![Course](https://img.shields.io/badge/University_of_Deusto-Biomedical_Engineering_2026--2027-0f172a?style=for-the-badge)](https://www.deusto.es)
[![Status](https://img.shields.io/badge/Status-Investigational_Prototype-246a59?style=for-the-badge)](#disclaimer)

**CardioPatch** is a Health 4.0 biomedical engineering project developed by **Group 06** at the **University of Deusto** (*Introduction to Biomedical Engineering*, Academic Year 2026–2027). It combines continuous chest-worn **single-lead ECG** and **skin thermometry** with **on-patch Edge AI (TinyML)**, **IoT telemetry**, and a **cloud-hosted clinical portal** to detect silent myocardial ischemia and sudden arrhythmias early—without overwhelming clinicians with false alarms.

---

## 1. The Clinical Problem

Cardiovascular diseases (CVDs) remain the leading cause of mortality globally, accounting for approximately **19.05–19.8 million deaths per year** (32% of all deaths) and costing the European Union over **€282 billion annually** in healthcare expenditure and lost productivity.

- **The "Silent" Barrier:** Nearly **45% of myocardial infarctions occur without typical chest pain**, particularly among older adults, diabetic patients, and residents in rural areas with delayed access to specialized cardiology.
- **Limitations of Current Wearables:** Commercial ambulatory patches (such as *Philips ePatch*, *iRhythm Zio Monitor*, and *CardioSTAT*) rely primarily on **retrospective post-wear analysis** rather than live event escalation, leaving high-risk patients unprotected during acute episodes.

---

## 2. How CardioPatch Works

CardioPatch is built as a modular two-piece wearable paired with a three-tier cloud architecture:

1. **Multi-Modal Chest Sensing (Step 1):** A reusable, 3D-printed **IP67 water-resistant electronics hub** snaps onto a disposable, breathable medical-grade silicone adhesive patch. It continuously records **single-lead ECG (250 Hz, AD8232/MAX30003)** and **skin temperature (NTC thermistor)** to detect both electrophysiological shifts and cold diaphoresis.
2. **2-Tier Edge AI Filtering (Step 2):** A lightweight **TinyML** model runs directly on the microcontroller to prevent clinician alarm fatigue:
   - **Tier 0 (Benign Physiological Changes):** Exertion-related sinus tachycardia (e.g., climbing stairs) is logged silently for daily clinical summaries.
   - **Tier 1 (Potential Arrhythmic or Ischemic Anomaly):** Captures and locks a **30-second pre- and post-event ECG strip** for immediate clinical review.
3. **Resilient IoT & Encrypted EU Cloud (Step 3):** Data is relayed via **Bluetooth Low Energy (BLE 5.0)** to the patient's smartphone gateway—backed by **24-hour local flash caching** for rural areas with intermittent connectivity—and synchronized to **EU-hosted cloud infrastructure** protected with **TLS 1.3**, **AES-256**, **OAuth 2.0**, and **Role-Based Access Control (RBAC)** under **GDPR** and **HL7 FHIR** standards.
4. **D4ALL Dual-Role UX & Escalation Ladder (Step 4):** Designed with **Design for All (D4ALL)** principles from stakeholder interviews:
   - **Patient App:** Displays calm, low-anxiety reassurance (*"System Active — Heart Rhythm Stable"*).
   - **Automated Escalation:** Prompts the patient first, notifies designated family caregivers via push alert with smartphone GPS coordinates if unacknowledged, and escalates to cardiology triage / emergency services (112).

---

## 3. Health 4.0 Integration

Out of the eight Health 4.0 technological areas, CardioPatch integrates **six core pillars**:

| Health 4.0 Area | Role in CardioPatch |
| :--- | :--- |
| **Biosignal Processing** | 250 Hz single-lead ECG acquisition, 0.5–40 Hz bandpass & wavelet baseline-wander filtering, Pan-Tompkins R-peak detection, HRV (RMSSD) extraction, and NTC skin thermometry. |
| **Artificial Intelligence** | On-patch TinyML classifier separating benign daily heart-rate fluctuations from arrhythmic and silent ischemic patterns. |
| **Internet of Things (IoT)** | Seamless BLE 5.0 telemetry, 24-hour offline flash memory buffer, smartphone gateway relay, and multi-tier push notifications. |
| **Cloud Computing** | Central EU-hosted clinical dashboard, automated daily patient summaries, HL7 FHIR interoperability, and this public web showcase. |
| **Cybersecurity** | End-to-end TLS 1.3 encryption in transit, AES-256 encryption at rest, OAuth 2.0 authentication, RBAC, and strict EU GDPR data sovereignty. |
| **Additive Manufacturing** | Rapidly prototyped, ergonomic 3D-printed IP67 enclosure housing the reusable sensor and battery module. |

*(Quantum Computing, Augmented Reality, and Autonomous Robots were intentionally excluded to keep the wearable low-power, affordable, and accessible for older adults.)*

---

## 4. Web Platform & Interactive Prototype Structure

This repository contains the static frontend web platform deployed on **Vercel** (`cardiopatch-project.vercel.app`), featuring a calm, low-stimulation clinical aesthetic and a real-time 60 FPS physiological signal synthesizer:

```text
├── index.html            # 01 · Overview — Product value proposition, 3D-style patch showcase & 3-step protection flow
├── clinical-needs.html   # 02 · Clinical Needs — Epidemiological burden, EU cost metrics & silent ischemia gap
├── why-us.html           # 03 · Why Us? — Competitor benchmark, 36-respondent survey & stakeholder safeguards
├── health40.html         # 04 · Health 4.0 — Architectural breakdown & analysis of the 8 Health 4.0 areas
├── prototype.html        # Live Prototype — Read-only clinical login & dual-channel real-time ECG/temp monitor
├── prototype.js          # 60 FPS parametric ECG synthesizer, HRV/temperature engine & sudden arrhythmia simulator
├── data.js               # Centralized project metrics, benchmark comparisons & Health 4.0 structured data
├── shared.js             # Shared navigation bar, responsive menu drawer, scroll-reveal observer & team footer
├── widgets.js            # Interactive ECG waveform preview widgets
├── styles.css            # Design tokens, color palette, responsive grids & clinical UI components
├── animations.css        # Levitation keyframes, rolling button transitions & two-tone scroll sweeps
└── vercel.json           # Vercel deployment configuration
