# FIFA 2026 Nexus: The Intelligent Stadium Companion

## Challenge Vertical
**Enhance stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff.**

## Approach and Logic
FIFA 2026 Nexus is a dual-persona web application built with React and Vite. It serves as a unified intelligence hub for both **Fans** and **Staff** inside the stadium.

1. **Fan Persona (The Concierge):** Provides an intuitive, multilingual chat interface. The GenAI logic is designed to answer queries regarding navigation, bathroom queues, and sustainable transport options.
2. **Staff Persona (Operational Intelligence):** Provides a visual dashboard mapping potential crowd bottlenecks based on AI predictions, and an incident reporting tool where staff can describe an event naturally. The GenAI parses this unstructured input to extract severity, location, and immediate actions.

The UI leverages a premium dark-mode glassmorphism design, ensuring it looks futuristic and aligns with the scale of the 2026 World Cup.

## How the Solution Works
* The application runs purely in the browser as a responsive SPA (Single Page Application).
* Users toggle between "Fan" and "Staff" mode using the switch in the header.
* In **Fan Mode**, users interact via a chat interface. The input is sent to the `aiService`, which processes the intent and returns a contextual response.
* In **Staff Mode**, staff can view real-time (simulated) heatmaps. They can also log incidents using natural language, which the AI analyzes to assign a "Severity" tag and propose action steps.

## Assumptions Made
* **GenAI API Accessibility:** To ensure evaluators can test the project without the friction of setting up API keys, the `aiService.js` module uses a simulated GenAI response fallback. In a production environment, this module would be hooked directly to an LLM provider (like Google Gemini) via environment variables.
* **Connectivity:** Assumes attendees have access to stadium Wi-Fi or 5G, given the browser-based nature of the app.
* **Data Sources:** The predictive crowd heatmap assumes integration with stadium CCTV and ticketing APIs to feed the AI model.

## Evaluation Focus Highlights
* **Code Quality:** Built using component-based React architecture. Boilerplate removed.
* **Security:** No hardcoded API keys are exposed.
* **Accessibility:** Semantic HTML structure, distinct color contrasts (dark mode with bright accents).
* **Efficiency:** Lightweight Vite build, zero unnecessary dependencies, easily keeping the repo size under 1MB (well below the 10MB limit).

## Getting Started
```bash
npm install
npm run dev
```
