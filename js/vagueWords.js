/**
 * vagueWords.js — Dictionary of vague and ambiguous words/phrases.
 *
 * Each entry provides:
 *   pattern        – RegExp to match the word/phrase in text
 *   label          – human-readable name for the highlight
 *   icon           – emoji cue (redundant with underline for a11y)
 *   category       – time | quantity | quality | scope | hedging | filler
 *   explanation    – plain-language description of WHY it is vague
 *   interpretations – two concrete, plausible readings
 */

export const VAGUE_WORDS = [

  /* ───────── Time-related ───────── */
  {
    pattern: /\bsoon\b/gi,
    label: "soon",
    icon: "⏰",
    category: "time",
    explanation:
      '"Soon" doesn\'t give a specific time. It could mean an hour or a week depending on who said it.',
    interpretations: [
      "Within the next 24 hours",
      "Sometime this week — no particular rush",
    ],
  },
  {
    pattern: /\basap\b/gi,
    label: "ASAP",
    icon: "⏰",
    category: "time",
    explanation:
      '"ASAP" creates urgency without a real deadline. People use it for everything from "right now" to "whenever you can."',
    interpretations: [
      "Drop what you're doing and finish this today",
      "Make it a priority, but tomorrow morning is fine",
    ],
  },
  {
    pattern: /\bshortly\b/gi,
    label: "shortly",
    icon: "⏰",
    category: "time",
    explanation:
      '"Shortly" is relative — it could be 10 minutes or a few hours.',
    interpretations: [
      "Within the next 30 minutes",
      "Later today at some point",
    ],
  },
  {
    pattern: /\bin a bit\b/gi,
    label: "in a bit",
    icon: "⏰",
    category: "time",
    explanation:
      '"In a bit" is intentionally vague. The speaker may not have a time in mind at all.',
    interpretations: [
      "Within the next hour",
      "Sometime today, no exact plan",
    ],
  },
  {
    pattern: /\blater\b/gi,
    label: "later",
    icon: "⏰",
    category: "time",
    explanation:
      '"Later" gives no indication of when. It could range from this afternoon to next month.',
    interpretations: [
      "Later today, after current tasks",
      "At some unspecified future time — could be days",
    ],
  },
  {
    pattern: /\bfriday-?ish\b/gi,
    label: "Friday-ish",
    icon: "⏰",
    category: "time",
    explanation:
      'The "-ish" suffix removes the commitment. They might mean Friday, Thursday night, or even Monday.',
    interpretations: [
      "End of business Friday at the latest",
      "Around Friday, but early next week is probably okay",
    ],
  },
  {
    pattern: /\bwhen(?:ever)?\s+you\s+can\b/gi,
    label: "when you can",
    icon: "⏰",
    category: "time",
    explanation:
      `This sounds flexible, but the sender might secretly have a deadline in mind.`,
    interpretations: [
      "No real urgency — fit it in this week",
      `I'm being polite but I actually need it today`,
    ],
  },
  {
    pattern: /\bwhen(?:ever)?\s+you\s+get\s+(?:a\s+)?chance\b/gi,
    label: "when you get a chance",
    icon: "⏰",
    category: "time",
    explanation:
      `This sounds casual and low-pressure, but it often masks an unspoken priority.`,
    interpretations: [
      "No immediate rush — fit it in when free",
      `As soon as possible, but phrasing it gently`,
    ],
  },
  {
    pattern: /\bat\s+some\s+point\b/gi,
    label: "at some point",
    icon: "⏰",
    category: "time",
    explanation:
      '"At some point" has no time frame at all. It could be tomorrow or never.',
    interpretations: [
      "Before the end of this project/semester",
      "Whenever you get around to it — low priority",
    ],
  },
  {
    pattern: /\bby\s+end\s+of\s+(?:the\s+)?day\b/gi,
    label: "by end of day",
    icon: "⏰",
    category: "time",
    explanation:
      '"End of day" varies — some people mean 5 PM, others mean midnight, others mean before they wake up tomorrow.',
    interpretations: [
      "By 5:00 PM in the sender's time zone",
      "Before midnight tonight",
    ],
  },
  {
    pattern: /\bin\s+the\s+near\s+future\b/gi,
    label: "in the near future",
    icon: "⏰",
    category: "time",
    explanation:
      '"Near future" is subjective. In business it might mean weeks; in casual talk, days.',
    interpretations: [
      "Within the next 1–2 weeks",
      "Within the next month or so",
    ],
  },
  {
    pattern: /\bwhenever\b/gi,
    label: "whenever",
    icon: "⏰",
    category: "time",
    explanation:
      `"Whenever" sounds open-ended but the sender might still expect it relatively soon.`,
    interpretations: [
      "At any time that works for you — genuinely flexible",
      "Soon-ish — the sender is being polite but does have a window in mind",
    ],
  },
  {
    pattern: /\bwhatever\b/gi,
    label: "whatever",
    icon: "🤷",
    category: "hedging",
    explanation:
      `"Whatever" can signal genuine flexibility or frustration — hard to tell which.`,
    interpretations: [
      "Truly open — any option is fine",
      `The sender has a preference but doesn't want to say it outright`,
    ],
  },
  {
    pattern: /\bsometime\b/gi,
    label: "sometime",
    icon: "⏰",
    category: "time",
    explanation:
      `"Sometime" gives no time frame — it could be today or next month.`,
    interpretations: [
      "Within the next few days",
      "At an unspecified future date — low urgency",
    ],
  },
  {
    pattern: /\bsomeday\b/gi,
    label: "someday",
    icon: "⏰",
    category: "time",
    explanation:
      `"Someday" implies no urgency at all, but the sender might still expect action.`,
    interpretations: [
      `Eventually — no rush, but don't forget`,
      "The sender wishes for this but has no timeline",
    ],
  },
  {
    pattern: /\bor\s+so\b/gi,
    label: "or so",
    icon: "📏",
    category: "quantity",
    explanation:
      `"Or so" softens any number it follows, making it approximate rather than firm.`,
    interpretations: [
      "Roughly that number — a little above or below is fine",
      "The sender picked a number but really means a range",
    ],
  },
  {
    pattern: /\b\w+-?ish\b/gi,
    label: "-ish",
    icon: "🤷",
    category: "hedging",
    explanation:
      `The "-ish" suffix deliberately removes precision — the speaker is hedging.`,
    interpretations: [
      "Approximately that — close but not exact",
      "The speaker wants flexibility and may shift the target",
    ],
  },
  {
    pattern: /\ba\s+bit\b/gi,
    label: "a bit",
    icon: "📏",
    category: "quantity",
    explanation:
      `"A bit" is intentionally vague about how much — it could be a tiny amount or a moderate one.`,
    interpretations: [
      "A small amount — a minor tweak",
      "A noticeable amount — more than trivial",
    ],
  },

  /* ───────── Quantity / Size ───────── */
  {
    pattern: /\bshort\b/gi,
    label: "short",
    icon: "📏",
    category: "quantity",
    explanation:
      '"Short" means different things in different contexts. A "short" essay could be 1 page or 5.',
    interpretations: [
      "About half a page or one paragraph",
      "1–2 pages, concise but complete",
    ],
  },
  {
    pattern: /\bbrief(?:ly)?\b/gi,
    label: "brief",
    icon: "📏",
    category: "quantity",
    explanation:
      '"Brief" tells you to be concise, but doesn\'t say how concise.',
    interpretations: [
      "A few sentences — under 100 words",
      "A short section — roughly 200–300 words",
    ],
  },
  {
    pattern: /\ba\s+few\b/gi,
    label: "a few",
    icon: "📏",
    category: "quantity",
    explanation:
      '"A few" usually means 2–4, but some people use it for up to 7 or 8.',
    interpretations: ["2 to 3 items", "4 to 6 items"],
  },
  {
    pattern: /\bseveral\b/gi,
    label: "several",
    icon: "📏",
    category: "quantity",
    explanation:
      '"Several" typically implies more than "a few" but how many more?',
    interpretations: ["About 3 to 5", "5 to 8 or more"],
  },
  {
    pattern: /\bsome\b/gi,
    label: "some",
    icon: "📏",
    category: "quantity",
    explanation:
      '"Some" is one of the vaguest quantity words — it could be 2 or 20.',
    interpretations: [
      "A small number — 2 to 4",
      "An unspecified amount — could be many",
    ],
  },
  {
    pattern: /\benough\b/gi,
    label: "enough",
    icon: "📏",
    category: "quantity",
    explanation:
      '"Enough" assumes you know the standard, but you might not.',
    interpretations: [
      "The minimum amount that fully answers the question",
      "More than you think — aim to be thorough",
    ],
  },
  {
    pattern: /\ba\s+(?:lot|bunch)\b/gi,
    label: "a lot",
    icon: "📏",
    category: "quantity",
    explanation: '"A lot" is very subjective and context-dependent.',
    interpretations: [
      "More than average — roughly double what you'd expect",
      "An intentionally large amount — be comprehensive",
    ],
  },

  /* ───────── Quality / Standard ───────── */
  {
    pattern: /\bgood(?:\s+quality)?\b/gi,
    label: "good",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Good" doesn\'t describe specific standards. What counts as "good" depends on the audience and purpose.',
    interpretations: [
      "Meets all stated requirements with no major errors",
      "Goes above the minimum — polished and well-organized",
    ],
  },
  {
    pattern: /\bprofessional\b/gi,
    label: "professional",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Professional" implies a standard you\'re expected to already know, but standards vary by field.',
    interpretations: [
      "Formal tone, clean formatting, no typos",
      "Industry-standard quality with polished design",
    ],
  },
  {
    pattern: /\bpolished\b/gi,
    label: "polished",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Polished" suggests extra refinement beyond "done," but how much?',
    interpretations: [
      "Proofread, well-formatted, no rough edges",
      "Presentation-ready — could be shown to executives",
    ],
  },
  {
    pattern: /\bnice\b/gi,
    label: "nice",
    icon: "⭐",
    category: "quality",
    explanation: '"Nice" is subjective and gives you very little to work with.',
    interpretations: [
      "Visually pleasant and easy to read",
      "Above average — something you'd be proud of",
    ],
  },
  {
    pattern: /\bbetter\b/gi,
    label: "better",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Better" tells you to improve but not what to improve or by how much.',
    interpretations: [
      "Fix the most obvious issues from last time",
      "Significantly rework the approach from scratch",
    ],
  },
  {
    pattern: /\bproper(?:ly)?\b/gi,
    label: "proper",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Proper" assumes there is one correct way, but you may not know what it is.',
    interpretations: [
      "Following the standard format for this type of work",
      "Following a specific convention the sender has in mind",
    ],
  },
  {
    pattern: /\bdecent\b/gi,
    label: "decent",
    icon: "⭐",
    category: "quality",
    explanation:
      '"Decent" is lukewarm — it signals a minimum bar but doesn\'t define it.',
    interpretations: [
      "Acceptable — nothing embarrassing",
      "Solidly average — meets expectations without wowing",
    ],
  },

  /* ───────── Relevance / Scope ───────── */
  {
    pattern: /\brelevant\b/gi,
    label: "relevant",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Relevant" assumes you know what matters, but the scope is unclear.',
    interpretations: [
      "Directly connected to the main topic discussed in class/meeting",
      "Broadly related — use your own judgment on what fits",
    ],
  },
  {
    pattern: /\bimportant\b/gi,
    label: "important",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Important" doesn\'t say why it matters or what specifically is important.',
    interpretations: [
      "High priority — this will affect your grade or evaluation",
      "Worth paying attention to, but not necessarily urgent",
    ],
  },
  {
    pattern: /\bnecessary\b/gi,
    label: "necessary",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Necessary" implies there are things that are NOT necessary, but doesn\'t say which is which.',
    interpretations: [
      "Required — you cannot skip this",
      "Strongly recommended but technically optional",
    ],
  },
  {
    pattern: /\bappropriate\b/gi,
    label: "appropriate",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Appropriate" assumes shared understanding of what is suitable.',
    interpretations: [
      "Matching the formality and context of the situation",
      "Following specific guidelines the sender hasn't stated",
    ],
  },
  {
    pattern: /\bsuitable\b/gi,
    label: "suitable",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Suitable" defers judgment to you without clear criteria.',
    interpretations: [
      "Fits the purpose and audience well",
      "Meets unstated criteria the sender has in mind",
    ],
  },
  {
    pattern: /\beverything\b/gi,
    label: "everything",
    icon: "🎯",
    category: "scope",
    explanation:
      '"Everything" is impossibly broad — they probably don\'t mean literally everything.',
    interpretations: [
      "All the main points discussed in the source material",
      "A comprehensive overview — cover the key areas thoroughly",
    ],
  },

  /* ───────── Hedging / Uncertainty ───────── */
  {
    pattern: /\bmaybe\b/gi,
    label: "maybe",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Maybe" could mean the sender is uncertain, or it could be a polite way of saying "definitely."',
    interpretations: [
      "This is optional — your choice",
      "I actually want this but I'm being indirect",
    ],
  },
  {
    pattern: /\bperhaps\b/gi,
    label: "perhaps",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Perhaps" is the formal version of "maybe" — equally vague.',
    interpretations: [
      "Consider doing this if it makes sense",
      "I'm suggesting this politely but I expect you'll do it",
    ],
  },
  {
    pattern: /\bprobably\b/gi,
    label: "probably",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Probably" signals likelihood but leaves room for doubt.',
    interpretations: [
      "Very likely — plan for this outcome",
      "Likely but not confirmed — have a backup plan",
    ],
  },
  {
    pattern: /\bmight\b/gi,
    label: "might",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Might" indicates possibility without commitment.',
    interpretations: [
      "There's a real chance of this — be prepared",
      "It's unlikely but the sender is covering their bases",
    ],
  },
  {
    pattern: /\bkind\s+of\b/gi,
    label: "kind of",
    icon: "🤷",
    category: "hedging",
    explanation:
      `"Kind of" weakens whatever follows it — the sender isn't fully committing to the statement.`,
    interpretations: [
      "Somewhat — partially true but with caveats",
      "Actually yes, but the speaker is softening the message",
    ],
  },
  {
    pattern: /\bsort\s+of\b/gi,
    label: "sort of",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Sort of" is like "kind of" — it hedges and makes the meaning unclear.',
    interpretations: [
      "Roughly — in the general direction of what they described",
      "Yes, but the speaker is being cautious or polite",
    ],
  },
  {
    pattern: /\bsomewhat\b/gi,
    label: "somewhat",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Somewhat" partially qualifies a statement without saying how much.',
    interpretations: [
      "Partially — about halfway there",
      "Noticeably but not extremely",
    ],
  },
  {
    pattern: /\brelatively\b/gi,
    label: "relatively",
    icon: "🤷",
    category: "hedging",
    explanation:
      '"Relatively" compares to something, but doesn\'t say what.',
    interpretations: [
      "Compared to the typical or average case",
      "Compared to an unstated reference the sender has in mind",
    ],
  },

  /* ───────── Filler / Open-ended ───────── */
  {
    pattern: /\betc\.?\b/gi,
    label: "etc.",
    icon: "📝",
    category: "filler",
    explanation:
      '"Etc." means "and more things like these" but doesn\'t tell you what those things are.',
    interpretations: [
      "Just those items — the sender ran out of examples",
      "There are more items you're expected to figure out",
    ],
  },
  {
    pattern: /\band\s+so\s+on\b/gi,
    label: "and so on",
    icon: "📝",
    category: "filler",
    explanation:
      '"And so on" assumes you can continue the pattern, but you might not know what pattern they mean.',
    interpretations: [
      "Continue in the same pattern with similar items",
      "There are specific things they expect but aren't listing",
    ],
  },
  {
    pattern: /\bor\s+something\b/gi,
    label: "or something",
    icon: "📝",
    category: "filler",
    explanation:
      '"Or something" shows the sender hasn\'t decided, or is leaving it open.',
    interpretations: [
      "This specific thing, or a very close alternative",
      "This is just one idea — feel free to suggest others",
    ],
  },
  {
    pattern: /\bor\s+whatever\b/gi,
    label: "or whatever",
    icon: "📝",
    category: "filler",
    explanation:
      '"Or whatever" sounds dismissive but usually means the sender is flexible.',
    interpretations: [
      "This option or anything similar — your call",
      "I don't have a strong preference — just get it done",
    ],
  },
  {
    pattern: /\bsomething\b/gi,
    label: "something",
    icon: "📝",
    category: "filler",
    explanation:
      '"Something" is a placeholder — the sender either hasn\'t decided or expects you to know.',
    interpretations: [
      "A specific thing the sender has in mind but didn't name",
      "Anything reasonable that fits the context",
    ],
  },
  {
    pattern: /\bstuff\b/gi,
    label: "stuff",
    icon: "📝",
    category: "filler",
    explanation:
      '"Stuff" is very informal and vague — it could refer to almost anything.',
    interpretations: [
      "The specific items or topics discussed earlier",
      "A general category of things you should identify",
    ],
  },
  {
    pattern: /\bthings\b/gi,
    label: "things",
    icon: "📝",
    category: "filler",
    explanation:
      '"Things" is generic. The sender might know what they mean, but you might not.',
    interpretations: [
      "The specific tasks, topics, or items relevant here",
      "Multiple items the sender expects you to identify",
    ],
  },
  {
    pattern: /\bas\s+needed\b/gi,
    label: "as needed",
    icon: "📝",
    category: "filler",
    explanation:
      '"As needed" assumes you can judge what\'s needed, but the criteria are unstated.',
    interpretations: [
      "Use your judgment — add or adjust based on what makes sense",
      "When specific conditions arise that require action (unspecified)",
    ],
  },
  {
    pattern: /\bas\s+(?:appropriate|necessary)\b/gi,
    label: "as appropriate",
    icon: "📝",
    category: "filler",
    explanation:
      '"As appropriate/necessary" defers entirely to your judgment.',
    interpretations: [
      "Follow the standard practice for this kind of task",
      "The sender trusts your judgment — but may have opinions later",
    ],
  },
  {
    pattern: /\bif\s+applicable\b/gi,
    label: "if applicable",
    icon: "📝",
    category: "filler",
    explanation:
      '"If applicable" leaves it to you to decide whether it applies, but you may not know.',
    interpretations: [
      "Include this only if it's clearly relevant to your situation",
      "The sender isn't sure if this applies to you — check with them",
    ],
  },
  {
    pattern: /\band\s+(?:stuff|things)\b/gi,
    label: "and stuff/things",
    icon: "📝",
    category: "filler",
    explanation:
      'Trailing "and stuff/things" implies more items without naming them.',
    interpretations: [
      "Just the items already listed — this is filler",
      "Related items in the same category that you should include",
    ],
  },

  /* ───────── Relative / Comparative ───────── */
  {
    pattern: /\bmore\s+(?:modern|user[- ]?friendly|creative|detailed|concise|interactive)\b/gi,
    label: "more [adjective]",
    icon: "↕️",
    category: "quality",
    explanation:
      '"More [X]" tells you the direction but not the destination.',
    interpretations: [
      "Make noticeable changes in this direction",
      "A significant overhaul toward this quality",
    ],
  },
];

/**
 * EXAMPLE_MESSAGES — four realistic vague messages for the "Try an example" feature.
 * Each includes the sender type and a realistic message.
 */
export const EXAMPLE_MESSAGES = {
  professor: {
    sender: "teacher",
    text: `Please write a short essay about a relevant topic from this semester. It should be good quality and demonstrate your understanding. Submit it soon — I'll share more details later if needed. Let me know if you have questions, etc.`,
  },
  manager: {
    sender: "manager",
    text: `Can you put together something for the client presentation on Friday-ish? Make it look professional and cover everything important. Also loop in the team as needed. Keep it brief but make sure it's thorough. Thanks.`,
  },
  group: {
    sender: "group",
    text: `Hey can someone handle the intro section? Keep it short but make sure it covers all the relevant stuff. We should probably meet up soon to discuss. Send it over when it's done or whatever.`,
  },
  client: {
    sender: "client",
    text: `We need the deliverables updated ASAP. The current version isn't quite what we had in mind — can you make it more modern and user-friendly? Also add some additional features and things. Send it over when it's ready, probably by end of day.`,
  },
};
