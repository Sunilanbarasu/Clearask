# ClearAsk

ClearAsk is an offline-first, accessibility-centered web application that decodes vague and ambiguous instructions (from professors, managers, clients, or group chats) into clear, structured, and actionable guidance.

---

## 1. Problem
Vague instructions cause anxiety, wasted time, and hesitation—especially in educational and professional settings. Ambiguous terms like *"write a short essay soon"* or *"make it look professional on Friday-ish"* leave critical details unstated, making people second-guess themselves or fear asking clarifying questions.

## 2. Persona: Arjun
- **Background**: Arjun is an 18-year-old first-year undergraduate international student whose native language is not English.
- **Challenge**: When his professor assigns an essay saying *"submit a short reflection of good quality soon"*, Arjun feels paralyzed. He worries that asking basic questions like *"how many words?"* or *"what date is it due?"* will make him appear unprepared or disrespectful.
- **Goal**: Arjun needs a private, non-judgmental tool to pinpoint what specific information is missing, understand plausible interpretations of ambiguous phrasing, and obtain polite, ready-to-send messages he can comfortably send to his professor.

## 3. How It Works
ClearAsk processes messages client-side using deterministic linguistic analysis:
1. **Vague Word Detection**: Scans the input against an extensive dictionary of ambiguous time, quantity, quality, scope, and hedging phrases.
2. **Missing Information Audit**: Checks whether key requirements (deadline, length, format, audience, criteria, submission method, and contact person) are present or missing.
3. **Clarity Scoring**: Assigns an overall clarity badge (*Clear*, *Partly clear*, or *Mostly unclear*) based on detected ambiguities and missing details.
4. **Clarifying Question Generation**: Generates 3 to 5 polite, ranked questions explaining why each question matters.
5. **Ready-to-Send Replies**: Produces editable messages in multiple tones (formal email, friendly chat, or concise message) with one-click copy and text-to-speech.
6. **Safe Assumptions Plan**: Proposes sensible default actions if the sender cannot be reached in time.

## 4. Features
- **Deterministic Offline Analysis**: Analyzes text locally in the browser with zero external network dependencies.
- **Example Presets**: One-click example messages for Professor, Manager, Group chat, and Client scenarios.
- **Interactive Highlight Viewer**: Highlights vague words with distinct visual and accessible indicators.
- **Missing Info Checklist**: Visual and screen-reader accessible breakdown of missing vs. provided details.
- **Tone Tabs & Message Writer**: Tailored ready-to-copy replies in Formal, Friendly, and Short formats.
- **Safe Assumptions Generator**: Practical fallback recommendations when deadlines approach.
- **Simplify Mode**: Rewrites verbose instructions into direct, plain English with optional side-by-side view.
- **History Panel**: LocalStorage history management with full JSON export and import capabilities.
- **Optional AI Enhancement**: Optional OpenAI API key support for alternative generative simplifications.

## 5. Accessibility Features
- **WCAG AA Compliance**: High-contrast ratios and minimum 44px touch targets across all interactive controls.
- **Focus Indicators**: High-visibility focus rings (`outline: 3px solid #f59e0b`) on all keyboard-navigable elements.
- **Skip Links & Landmarks**: Semantic HTML5 landmark structure (`header`, `main`, `footer`, `dialog`, `toolbar`) with a dedicated skip link.
- **Theming & Dyslexia Support**: Light, Dark, High-Contrast, and Calm themes, plus OpenDyslexic font toggle.
- **Adjustable Display**: User-controlled font size scaling (80%–150%) and line height adjustment (1.0–2.0).
- **Reduced Motion Support**: Respects system preferences and includes an in-app toggle to disable transitions.
- **Screen Reader Announcements**: Dedicated ARIA live regions announce actions, status changes, and example loads.
- **Text-to-Speech & Voice Input**: Integrated Web Speech API for voice dictation and reading results aloud.

## 6. Run Instructions
ClearAsk runs entirely in modern browsers with standard ES modules. No build steps or package installations are required.

```bash
# Navigate to the project directory
cd clearask

# Start a local static HTTP server
python -m http.server 8000

# Open in your browser
# http://localhost:8000
# Run automated tests:
# http://localhost:8000/test.html
```

## 7. Limitations
- **Rule-Based Engine**: Relies on curated regex patterns and linguistic templates. Highly nuanced or colloquial slang outside the dictionary may not trigger flags.
- **Language**: English language only.
- **Not a Human Replacement**: Intended to empower the user to ask the right questions—not to make unilateral decisions for high-stakes assignments without confirmation.

## 8. What I Learned
- Building accessible UIs requires redundancy: relying on color alone fails accessibility; pairing color with icons, text labels, and ARIA attributes ensures clarity for all users.
- Deterministic rule-based engines provide lightning-fast, zero-cost, privacy-preserving utility without requiring cloud AI for everyday language breakdown tasks.
- Semantic HTML and keyboard navigation must be prioritized from day one, not retrofitted.

## 9. AI Assistance Disclosure
Built with Antigravity and Gemini. All code, tests, styles, and documentation were generated and verified during this pair programming session with no pre-existing code.

## 10. Live Demo
*Live demo placeholder: Coming soon on GitHub Pages.*
