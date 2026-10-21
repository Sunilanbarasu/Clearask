/**
 * analyzer.js — Core analysis engine (fully offline, rule-based).
 *
 * Public API:
 *   analyze(text, senderType)  – returns a complete analysis object
 *
 * Analysis result shape:
 *   {
 *     originalText,  senderType,
 *     vagueMatches,  missingInfo,  clarityLevel,
 *     clarityLabel,  clarityDescription
 *   }
 */

import { VAGUE_WORDS } from "./vagueWords.js";

/* ── Missing-info detection patterns ──────────────────────── */

const INFO_CHECKS = [
  {
    id: "deadline",
    label: "Deadline or due date",
    icon: "📅",
    patterns: [
      /\b(?:due|deadline|by|before|until|no later than)\s+\w+/i,
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d/i,
      /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/,
      /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(?:tomorrow|tonight|today|next\s+week|end\s+of\s+(?:the\s+)?(?:week|month|semester|quarter))\b/i,
      /\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i,
      /\b(?:noon|midnight|morning|afternoon|evening)\b/i,
    ],
  },
  {
    id: "length",
    label: "Length, size, or duration",
    icon: "📏",
    patterns: [
      /\b\d+\s*(?:words?|pages?|paragraphs?|sentences?|minutes?|hours?|slides?)\b/i,
      /\b(?:word\s*count|page\s*limit|time\s*limit|duration|length|how\s+long|how\s+many)\b/i,
      /\b(?:minimum|maximum|at\s+least|no\s+more\s+than|up\s+to)\s+\d/i,
    ],
  },
  {
    id: "format",
    label: "Format or file type",
    icon: "📄",
    patterns: [
      /\b(?:pdf|docx?|pptx?|xlsx?|csv|txt|zip|mp[34]|mov|png|jpg|jpeg)\b/i,
      /\b(?:essay|report|memo|presentation|slides?|poster|infographic|spreadsheet|letter|blog\s*post|video)\b/i,
      /\b(?:format|template|file\s*type|double[- ]?spaced?|single[- ]?spaced?|font|margin|apa|mla|chicago|harvard)\b/i,
    ],
  },
  {
    id: "audience",
    label: "Target audience",
    icon: "👥",
    patterns: [
      /\b(?:audience|reader|viewer|who\s+will\s+(?:read|see|watch|review))\b/i,
      /\b(?:written\s+for|aimed\s+at|target(?:ed)?\s+(?:at|to|for)|addressed\s+to)\b/i,
      /\bfor\s+(?:the\s+)?(?:class|team|client|board|executives?|stakeholders?|public|students?|customers?)\b/i,
    ],
  },
  {
    id: "criteria",
    label: "Grading or success criteria",
    icon: "🎓",
    patterns: [
      /\b(?:rubric|graded?|marks?|points?|criteria|scoring|evaluated?|assessed?|rating)\b/i,
      /\b(?:will\s+be\s+judged|passing|expectations?|standards?|requirements?|objectives?)\b/i,
      /\b(?:out\s+of\s+\d+|percent|%|\d+\s*(?:marks?|points?))\b/i,
    ],
  },
  {
    id: "submission",
    label: "Submission method",
    icon: "📤",
    patterns: [
      /\b(?:submit|upload|email|turn\s*in|hand\s*in|send\s+to|deliver|post\s+(?:to|on|in)|share\s+(?:via|on|through|in))\b/i,
      /\b(?:canvas|blackboard|moodle|google\s*classroom|teams|slack|dropbox|drive|portal)\b/i,
      /\b(?:attachment|link|url|online|print(?:ed)?|hard\s*copy)\b/i,
    ],
  },
  {
    id: "contact",
    label: "Who to contact with questions",
    icon: "📞",
    patterns: [
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
      /\b(?:office\s*hours|contact|reach\s+(?:out|me)|ask\s+(?:me|us)|questions?\s*(?:\?|—|:))\b/i,
      /\b(?:professor|prof\.?|dr\.?|mr\.?|ms\.?|mrs\.?)\s+[A-Z][a-z]+/i,
      /\b(?:slack|teams|discord)\s+(?:me|us|the\s+channel)\b/i,
    ],
  },
];

/* ── Clarity scoring ──────────────────────────────────────── */

const CLARITY_LEVELS = [
  {
    id: "clear",
    label: "Clear",
    description: "This message has specific details and few vague parts. You can probably start working.",
    maxVague: 1,
    maxMissing: 1,
  },
  {
    id: "partly-clear",
    label: "Partly clear",
    description: "Some parts are specific, but a few things are left open. Asking 1–2 questions should clear it up.",
    maxVague: 4,
    maxMissing: 3,
  },
  {
    id: "mostly-unclear",
    label: "Mostly unclear",
    description: "This message leaves a lot to interpretation. It is completely reasonable to ask several clarifying questions before starting.",
    maxVague: Infinity,
    maxMissing: Infinity,
  },
];

/* ── Main analysis function ───────────────────────────────── */

/**
 * Analyse a text for vagueness and missing information.
 *
 * @param {string} text       – the raw message or instruction
 * @param {string} senderType – "teacher" | "manager" | "group" | "client" | ""
 * @returns {object} full analysis result
 */
export function analyze(text, senderType = "") {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Find vague words
  const vagueMatches = findVagueWords(trimmed);

  // 2. Check for missing info
  const missingInfo = checkMissingInfo(trimmed, senderType);

  // 3. Calculate clarity
  const missingCount = missingInfo.filter((i) => !i.found).length;
  const { level, label, description } = calculateClarity(
    vagueMatches.length,
    missingCount
  );

  return {
    originalText: trimmed,
    senderType,
    vagueMatches,
    missingInfo,
    clarityLevel: level,
    clarityLabel: label,
    clarityDescription: description,
  };
}

/* ── Vague-word scanner ───────────────────────────────────── */

/**
 * Scan text for vague words/phrases and return match objects.
 * Each match includes position info for highlighting.
 */
function findVagueWords(text) {
  const matches = [];
  const usedRanges = []; // avoid overlapping matches

  for (const entry of VAGUE_WORDS) {
    const regex = new RegExp(entry.pattern.source, entry.pattern.flags);
    let m;

    while ((m = regex.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;

      // Skip if this range overlaps with a previous match
      const overlaps = usedRanges.some(
        (r) => start < r.end && end > r.start
      );
      if (overlaps) continue;

      usedRanges.push({ start, end });

      matches.push({
        word: m[0],
        start,
        end,
        label: entry.label,
        icon: entry.icon,
        category: entry.category,
        explanation: entry.explanation,
        interpretations: entry.interpretations,
      });
    }
  }

  // Sort by position in text
  matches.sort((a, b) => a.start - b.start);
  return matches;
}

/* ── Deadline checker ─────────────────────────────────────── */

function checkDeadline(text) {
  const months = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)";

  // 1. Explicit dates (e.g., "24 October", "October 24", "10/24", "10-24")
  const explicitDatePatterns = [
    new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:${months})\\b`, "i"),
    new RegExp(`\\b(?:${months})\\s+\\d{1,2}(?:st|nd|rd|th)?\\b`, "i"),
    /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b/,
  ];

  for (const pattern of explicitDatePatterns) {
    const m = text.match(pattern);
    if (m) {
      const after = text.slice(m.index + m[0].length);
      if (/^\s*(?:-ish|\b(?:ish|or\s+so|sometime|around)\b)/i.test(after)) {
        continue;
      }
      return { found: true, detail: m[0] };
    }
  }

  // Weekday or month directly followed by -ish, ish, or so, sometime, or around
  const vagueFollowed = new RegExp(
    `\\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|${months})(?:-ish|\\s+(?:ish|or\\s+so|sometime|around))\\b`,
    "i"
  );

  // 2. Clear day plus a time
  const dayStr = `(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|tonight)`;
  const timeStr = `(?:(?:at\\s+)?\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)|\\d{1,2}:\\d{2}\\s*(?:am|pm)?|noon|midnight|(?:in\\s+the\\s+)?(?:morning|afternoon|evening)|end\\s+of\\s+(?:the\\s+)?day)`;

  const dayAndTime = new RegExp(
    `\\b(?:(?:due|by|before|until|on)\\s+)?(${dayStr})\\b(?:[^.,;!?]{1,30}?)\\b(${timeStr})\\b|\\b(?:(?:due|by|before|until|at)\\s+)?(${timeStr})\\b(?:[^.,;!?]{1,30}?)\\b(?:on\\s+)?(${dayStr})\\b`,
    "i"
  );

  const dtMatch = text.match(dayAndTime);
  if (dtMatch) {
    if (!vagueFollowed.test(dtMatch[0])) {
      return { found: true, detail: dtMatch[0].trim() };
    }
  }

  return { found: false, detail: "" };
}

/* ── Missing-info checker ─────────────────────────────────── */

/**
 * Check whether key pieces of information are present or absent.
 * Returns an array of { id, label, icon, found, detail }.
 */
function checkMissingInfo(text, senderType) {
  return INFO_CHECKS.map((check) => {
    if (check.id === "deadline") {
      const deadlineRes = checkDeadline(text);
      return {
        id: check.id,
        label: check.label,
        icon: check.icon,
        found: deadlineRes.found,
        detail: deadlineRes.detail,
      };
    }

    let found = false;
    let detail = "";

    for (const pattern of check.patterns) {
      const m = text.match(pattern);
      if (m) {
        found = true;
        detail = m[0];
        break;
      }
    }

    return {
      id: check.id,
      label: check.label,
      icon: check.icon,
      found,
      detail: detail || "",
    };
  });
}

/* ── Clarity calculator ───────────────────────────────────── */

function calculateClarity(vagueCount, missingCount) {
  for (const level of CLARITY_LEVELS) {
    if (vagueCount <= level.maxVague && missingCount <= level.maxMissing) {
      return {
        level: level.id,
        label: level.label,
        description: level.description,
      };
    }
  }
  // Fallback (shouldn't reach here)
  const last = CLARITY_LEVELS[CLARITY_LEVELS.length - 1];
  return { level: last.id, label: last.label, description: last.description };
}

/**
 * Build highlighted HTML from the original text with vague words marked.
 * Each highlight is a <mark> with underline + icon for a11y.
 */
export function buildHighlightedHTML(text, vagueMatches) {
  if (!vagueMatches.length) {
    return escapeHTML(text);
  }

  let html = "";
  let cursor = 0;

  for (const match of vagueMatches) {
    // Text before this match
    if (match.start > cursor) {
      html += escapeHTML(text.slice(cursor, match.start));
    }

    // The highlighted word
    html +=
      `<mark class="vague-highlight" role="button" tabindex="0" ` +
      `aria-label="${escapeAttr(match.label)}: click for explanation" ` +
      `data-label="${escapeAttr(match.label)}" ` +
      `data-icon="${escapeAttr(match.icon)}" ` +
      `data-explanation="${escapeAttr(match.explanation)}" ` +
      `data-interp0="${escapeAttr(match.interpretations[0])}" ` +
      `data-interp1="${escapeAttr(match.interpretations[1])}" ` +
      `data-category="${escapeAttr(match.category)}">` +
      `<span class="vague-icon" aria-hidden="true">${match.icon}</span>` +
      escapeHTML(match.word) +
      `</mark>`;

    cursor = match.end;
  }

  // Remaining text
  if (cursor < text.length) {
    html += escapeHTML(text.slice(cursor));
  }

  return html;
}

/* ── Simplify mode — rule-based plain-English rewriter ──── */

const SIMPLIFICATIONS = [
  [/\bin\s+accordance\s+with\b/gi, "following"],
  [/\bwith\s+regard\s+to\b/gi, "about"],
  [/\bin\s+order\s+to\b/gi, "to"],
  [/\bat\s+this\s+point\s+in\s+time\b/gi, "now"],
  [/\bdue\s+to\s+the\s+fact\s+that\b/gi, "because"],
  [/\bin\s+the\s+event\s+that\b/gi, "if"],
  [/\bprior\s+to\b/gi, "before"],
  [/\bsubsequent\s+to\b/gi, "after"],
  [/\bfor\s+the\s+purpose\s+of\b/gi, "to"],
  [/\bin\s+light\s+of\b/gi, "because of"],
  [/\bnotwithstanding\b/gi, "despite"],
  [/\bnevertheless\b/gi, "but"],
  [/\bfurthermore\b/gi, "also"],
  [/\bconsequently\b/gi, "so"],
  [/\btherefore\b/gi, "so"],
  [/\bhowever\b/gi, "but"],
  [/\butilize\b/gi, "use"],
  [/\bfacilitate\b/gi, "help"],
  [/\bimplement\b/gi, "do"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bindicate\b/gi, "show"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bascertain\b/gi, "find out"],
  [/\bprocure\b/gi, "get"],
  [/\benumerate\b/gi, "list"],
  [/\bameliorat\w+\b/gi, "improve"],
  [/\bexpedit\w+\b/gi, "speed up"],
  [/\bdeliver(?:ables?)\b/gi, "work"],
  [/\bsynerg\w+\b/gi, "work together"],
  [/\bleverage\b/gi, "use"],
  [/\boptimize\b/gi, "improve"],
  [/\bstakeholders?\b/gi, "people involved"],
  [/\bloop\s+(?:in|me\s+in)\b/gi, "include"],
  [/\bcircle\s+back\b/gi, "come back to this"],
  [/\btouch\s+base\b/gi, "check in"],
  [/\baction\s+items?\b/gi, "tasks"],
  [/\bgoing\s+forward\b/gi, "from now on"],
  [/\bat\s+the\s+end\s+of\s+the\s+day\b/gi, "ultimately"],
  [/\bpivot\b/gi, "change direction"],
];

/**
 * Simplify text using rule-based replacements.
 * Returns the simplified version (plain text).
 */
export function simplifyText(text) {
  let simplified = text;

  for (const [pattern, replacement] of SIMPLIFICATIONS) {
    simplified = simplified.replace(pattern, replacement);
  }

  // Break very long sentences (over 30 words) at conjunctions
  simplified = simplified.replace(
    /([.!?])\s*/g,
    "$1\n"
  );

  // Clean up extra whitespace
  simplified = simplified
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

  return simplified;
}

/* ── Utility ──────────────────────────────────────────────── */

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
