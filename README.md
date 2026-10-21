# ClearAsk

**Paste a confusing message. Get clear questions to ask, and the words to ask them.**

🔗 **Live demo:** https://clearask.vercel.app

<p align="center">
  <img src="<img width="955" height="937" alt="image" src="https://github.com/user-attachments/assets/4e3be5bc-2cc7-41b9-a8d4-ac4c10c735a6" />
" alt="ClearAsk input screen with an example vague message" width="700">
</p>

---

## Why ClearAsk exists

Many instructions are not hard to do. They are hard to understand.

> "Do a short presentation on something relevant, make it good, we'll see Friday-ish."

Vague messages like this come from teachers, managers, clients and group chats. People lose hours guessing what was meant, or do the wrong thing. For many, the real barrier is the fear of asking: non-native English speakers, first-year students, and autistic or anxious people who worry about looking incompetent.

ClearAsk fixes the step before the work starts. It turns a confusing message into a short list of specific questions and a ready-to-send reply.

## Who it helps

- Students and new joiners who are afraid to ask "obvious" questions
- Non-native English speakers who find vague phrasing hard to interpret
- Autistic, anxious or neurodivergent people who benefit from explicit, concrete instructions
- Anyone who works with unclear briefs, tickets, emails or chat messages

## How to use it

1. Paste the message that confuses you, or click an example (Professor, Manager, Group chat, Client).
2. Choose who sent it.
3. Click **Decode it**.
4. Read the results, copy a ready-made reply and send it.

## What it does

Paste a confusing message and ClearAsk gives you:

1. **Highlighted vague words** such as "short", "relevant" and "Friday-ish", marked with an underline and an icon, never color alone. A clarity label in plain words (Mostly unclear, Partly clear, Clear) replaces a harsh score.
2. **A missing-information checklist** covering deadline, length, format, audience, grading criteria, submission method and contact person.
3. **3 to 5 polite clarifying questions**, ranked by importance, each with a "why this matters" line.
4. **Ready-to-send replies** in three tones: formal email, friendly chat and very short. Editable, with a Copy button.
5. **A safe-assumptions plan** so you can start working if nobody replies.
6. **Simplify mode**, which rewrites the message in plain English with the original beside it.

<p align="center">
  <img src="<img width="940" height="1020" alt="image" src="https://github.com/user-attachments/assets/90491537-2f89-4403-801b-0c6db812e32e" />
" alt="Results: clarity label, highlighted vague words with underline and icons, and the missing-information checklist" width="700">
</p>

## Accessibility

Accessibility is the core of the project, not an add-on.

- Fully keyboard operable, with a skip link and visible focus rings
- Dyslexia-friendly font, adjustable font size and line spacing
- Light and dark themes, plus a reduced-motion option
- Highlights use underline and icon, not color alone
- Text-to-speech for results
- Semantic HTML, an ARIA live region for results and large touch targets
- Works on phones
- No login, no account and no API key needed

## Privacy

ClearAsk runs entirely in your browser. Your messages are analyzed on your device and are not sent to any server. Settings and history are saved only in your browser's local storage.

## How it works

A rule-based analyzer combines a dictionary of vague words with pattern checks for dates, lengths, formats and other details. Because it is rule-based, it is instant, predictable, private and works offline.

## Run it locally

There is no build step.

```bash
git clone https://github.com/YOUR-USERNAME/clearask.git
cd clearask
python -m http.server 8000
```

Open http://localhost:8000. The app uses ES modules, so it needs a local server and will not work by double-clicking `index.html`.

To run the analyzer tests, open http://localhost:8000/test.html.

## Project structure

```
clearask/
├── index.html          # UI
├── style.css           # styling and themes
├── test.html           # analyzer tests (no libraries)
├── screenshots/        # images used in this README
└── js/
    ├── app.js          # entry point
    ├── ui.js           # rendering and interactions
    ├── analyzer.js     # vague-language and missing-info detection
    ├── vagueWords.js   # vague-word dictionary
    ├── questions.js    # clarifying question generator
    ├── messages.js     # message writer and safe assumptions
    ├── storage.js      # settings and history
    └── tts.js          # text-to-speech
```

## Limitations

- The analyzer is rule-based, so it can miss vague phrases it has not been taught and can misjudge context.
- English only.
- It helps you ask better questions. It does not replace asking the sender.
- Voice input depends on browser support.
- It has not yet been tested with a large group of real users.

## What I learned

- Unclear instructions are a real access barrier, and a tool should never make the user feel at fault.
- Rule-based logic is private, instant and predictable, which suits people who may be anxious.
- Details matter: "Friday-ish" looks like a deadline but is not one.
- Accessibility works best when it is planned from the start.
- AI tools can write code quickly, but every feature still needs to be tested by a person.

## Roadmap

- More languages
- A larger, community-extendable vague-word dictionary
- Browser extension for email and chat
- Optional AI-assisted analysis

## Contributing

Ideas and pull requests are welcome, especially new vague phrases, new languages and accessibility improvements. Open an issue to start.

## AI assistance

This project was built with AI assistance:

- **Claude (Anthropic):** brainstorming and refining the idea, planning features, writing prompts and debugging help.
- **ChatGPT (OpenAI):** general ideas and research help.
- **Gemini (Google):** code generation and edits for the HTML, CSS and JavaScript.

The author chose the problem and the user, directed the work, tested the app in the browser, reported and fixed bugs, and made the final decisions. No pre-existing project was reused.
