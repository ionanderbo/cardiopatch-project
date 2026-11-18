# CardioPatch 4.0 — Group 06 Project Website

**Smart Wearable Patch with AI for Early Detection of Heart Attacks**  
*Introduction to Biomedical Engineering · Academic Year 2026–2027 · Competence SC3*

## Modular File Structure (Easy to Edit on GitHub)
Every page and feature is separated into short, self-contained files (~150–250 lines each):

```text
CardioPatch4-Website/
├── index.html          # Chapter 1: Overview, Live ECG/Temp Hero & 4 Project Options
├── problem.html        # Chapter 2: WHO/EU/AHA Stats, Competitors & 4 Stakeholder Interviews
├── solution.html       # Chapter 3: End-to-End Architecture, 8 Health 4.0 Areas & Datasheets
├── validation.html     # Chapters 2.4 & 3.3: D4ALL Patient vs. Clinician UI & 3-Phase Trials
├── roadmap.html        # Chapter 4: Filterable 12-Week Gantt Chart & Risk Matrix
├── team.html           # Chapter 5 & Annexes: Group 06 Roster, Conclusions & 10-Min Pitch Timer
├── css/
│   ├── styles.css      # Core palette, rounded architectural bands, typography & responsive grids
│   └── animations.css  # Rolling button labels, background wipes, scroll sweeps & hover zoom
└── js/
    ├── data.js         # Single source of truth for all tables, quotes, tasks & [TODO] slots
    ├── shared.js       # Shared top navigation bar, slide-out menu drawer & footer
    └── widgets.js      # Live ECG canvas, escalation simulator, role toggle, Gantt filter & timer
```

## How to Populate Remaining Report Content
Open `js/data.js` and edit the plain JavaScript arrays (`literatureTable`, `health40Areas`, `ganttTasks`, `risks`, `team`). Every HTML page reads directly from `js/data.js`.
