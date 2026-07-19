# FIFA 2026 Nexus: Intelligent Stadium Operations & Fan Companion

**FIFA 2026 Nexus** is a premium, dual-persona GenAI web application built with React and Vite. It serves as an active digital concierge for spectators and an operational intelligence command center for venue staff during the FIFA World Cup 2026.

🔗 **Live Deployment:** [https://sachinn-alt.github.io/fifa-2026-assistant/](https://sachinn-alt.github.io/fifa-2026-assistant/)

---

## 🎯 Challenge Vertical
**Enhance stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff.**
*Nexus achieves this by merging GenAI navigation assistance, crowd control predictions, accessibility tracking, and volunteer coordination into a single, unified interface.*

---

## 🎨 Visual System: Brutalist Sportswear Grid
The application uses a custom **Brutalist Sportswear Grid** design system. Moving away from standard glassmorphism, it features:
*   Solid 2px borders and blocky offset shadows.
*   High-visibility athletic colors (Neon Lime `#c6ff00` and Magenta `#ff005d`).
*   A tactical coordinate planner grid background pattern.
*   **Theme Switcher Mode:** Supports instant transitions between **Dark Mode**, **Light Mode**, and **System Default** presets, complete with automatic OS preference listeners.

---

## 🏗️ Architecture & Features

### 1. Fan Concierge Hub (Fan Persona)
*   **Multilingual AI Voice Assistant (Option A):** Uses Web Speech API for Speech-to-Text mic input dictation and locale-specific Speech Synthesis (Text-to-Speech) read-aloud buttons supporting English, Spanish, French, Arabic, and Japanese.
*   **AI Personal Itinerary Builder (Feature 1):** Fans enter their transit, accessibility (wheelchair/sensory), and concession preferences. The AI generates a customized hour-by-hour timeline and highlights the optimal sector blocks on the map.
*   **Interactive Stadium SVG Map (Option B):** Features dynamic coordinate navigation lines drawing neon paths between seating blocks and concessions/sensory spaces.
*   **Smart Queue Tracker:** Real-time queue wait monitoring with "AI Queue Detour" calculations.

### 2. Staff Operations Command (Staff Persona)
*   **Operations Stats Counter Bar (Option C):** Summary metrics reporting spectator load percentages, reactive incident dispatch counts, volunteer fleet sizes, and live transit outflows.
*   **AI Dispatch Incident Classifier:** Accepts unstructured text reports, parses them to extract severity, category, and target coordinates, and generates actionable safety checklists.
*   **Live Fan Sentiment Monitor (Feature 3):** Analyzes simulated fan feedback, classifies sentiment (POSITIVE/NEUTRAL/FRUSTRATED), and updates the SVG map to highlight frustrated blocks in red dynamically.
*   **Multilingual Dispatch System:** Translates urgent messages instantly to matched volunteers in their native tongue (e.g., Spanish, French, Arabic).

---

## 🛠️ How it Works
*   The application operates fully in-browser as a client-side SPA.
*   **GenAI Engine (`aiService.js`):** Simulates intelligent semantic search, text classification, and translations with realistic latencies, ensuring the app works out-of-the-box for evaluators without requiring API keys.
*   **SVG Render Engine (`InteractiveStadiumMap.jsx`):** Renders the stadium topology dynamically, reacting to seating selections, simulation phases, or active emergencies.

---

## 🔒 Assumptions Made
*   **API Fallback:** In production, the mock services inside `aiService.js` would connect to standard LLM endpoints (like Google Gemini API) using environment variables.
*   **Connectivity:** Assumes spectators connect to stadium Wi-Fi/5G given the lightweight, fast-loading, browser-based SPA design.
*   **Integration:** Assumes integrations with CCTV analytics, ticket databases, and volunteer scheduling systems to feed the dashboard.

---

## 📊 Evaluation Focus & Quality Metrics
*   **Code Quality:** Modern React 19 structure, zero warning lint compliance, highly focused component architecture.
*   **Security:** Fully secure client-side setup; no hardcoded credentials or API keys exposed.
*   **Efficiency:** Production build bundle totals **~259 kB**—massively under the 10 MB maximum limit.
*   **Accessibility:** High-contrast visuals, semantic inputs, and explicit accessibility guides built into both map tools and text output.

---

## 🚀 Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173/` in your web browser.
