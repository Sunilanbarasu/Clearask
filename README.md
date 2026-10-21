# ClearAsk

**Decode vague instructions. Know exactly what to ask.**

🔗 **Live demo:** https://clearask.vercel.app
💻 **Code:** this repository
🏆 Built for the Taskforge hackathon

---

## The problem

Many instructions are not hard to do. They are hard to understand.

> "Do a short presentation on something relevant, make it good, we'll see Friday-ish."

Most people lose hours guessing what this means, or do the wrong thing. For many people the real barrier is not the task but the fear of asking: non-native English speakers, first-year students, and autistic or anxious people who worry about looking incompetent for asking questions. ClearAsk targets this confusing handoff, the step before the work starts.

## Who it is for

**Arjun**, a first-year student and non-native English speaker. His professor posts a vague assignment. He does not want to look unprepared by asking, so he guesses. ClearAsk gives him the exact questions to ask and the words to ask them.

## What it does

Paste a confusing message and ClearAsk:

1. **Highlights vague words** (for example "short", "relevant", "Friday-ish") with an underline and an icon, never color alone. Click one for an explanation.
2. **Checks for missing information:** deadline, length, format, audience, grading criteria, submission method and contact person.
3. **Gives a clarity label in words** (Mostly unclear, Partly clear, Clear) instead of a harsh score.
4. **Writes 3 to 5 polite clarifying questions**, ranked by importance, each with a "why this matters" line.
5. **Drafts a ready-to-send message** in three tones: formal email, friendly chat, very short. Editable, with a Copy button.
6. **Offers a safe-assumptions plan** so the user can start working if nobody replies.
7. **Simplify mode** rewrites the message in plain English, with the original shown side by side.

## Accessibility

- Fully keyboard operable, with a skip link and visible focus rings
- Settings: dyslexia-friendly font, font size, line spacing, themes (including light and dark) and reduced motion
- Highlights use underline and icon, not color alone
- Text-to-speech for results
- Semantic HTML, ARIA live region for results, large touch targets, mobile-friendly layout
- No login, no account, and it works with no API key

## How it works

ClearAsk uses a **rule-based analyzer** that runs entirely in the browser. It has a vague-word dictionary and pattern checks for dates, lengths, formats and other details. Nothing is sent to a server, and no data leaves the device. History is stored only in the browser's local storage.

## Run it locally

No build step.

```bash
git clone https://github.com/YOUR-USERNAME/clearask.git
cd clearask
python -m http.server 8000
```

Open http://localhost:8000. The app uses ES modules, so it needs a local server and will not work by double-clicking `index.html`.

To run the tests, open http://localhost:8000/test.html (13 tests for the analyzer).

## Project structure
