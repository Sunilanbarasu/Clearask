/**
 * messages.js — Generates ready-to-send replies and safe-assumptions plan.
 *
 * Public API:
 *   generateMessages(analysis, questions)   – 3 reply tones
 *   generateSafeAssumptions(analysis)       – fallback plan if no reply
 */

/* ── Sender labels for salutation ─────────────────────────── */
const SENDER_LABELS = {
  teacher: { salutation: "Professor", closing: "Best regards" },
  manager: { salutation: "Hi", closing: "Best" },
  group: { salutation: "Hey everyone", closing: "Thanks" },
  client: { salutation: "Dear", closing: "Kind regards" },
  "": { salutation: "Hi", closing: "Thank you" },
};

/* ── Message generator ────────────────────────────────────── */

/**
 * Generate ready-to-send messages in 3 tones.
 *
 * @param {object} analysis – result from analyzer.analyze()
 * @param {Array} questions – result from generateQuestions()
 * @returns {{ formal: string, friendly: string, short: string }}
 */
export function generateMessages(analysis, questions) {
  if (!analysis || !questions?.length) {
    return {
      formal: "Thank you for the instructions. Could you please provide additional details so I can get started?",
      friendly: "Thanks for the info! I just want to make sure I get this right — could you clarify a few things?",
      short: "Thanks! Quick question — could you share a few more details?",
    };
  }

  const sender = SENDER_LABELS[analysis.senderType] || SENDER_LABELS[""];
  const topQuestions = questions.slice(0, 3);

  // ── Formal email ──
  const formalLines = [
    `${sender.salutation},`,
    "",
    "Thank you for the instructions. I want to make sure I deliver exactly what you're looking for, so I have a few clarifying questions:",
    "",
    ...topQuestions.map((q, i) => `${i + 1}. ${q.text}`),
    "",
    "I appreciate any additional details you can share. I'm happy to get started as soon as these points are clear.",
    "",
    `${sender.closing},`,
    "[Your name]",
  ];

  // ── Friendly chat ──
  const friendlyLines = [
    `${sender.salutation}! 👋`,
    "",
    "Thanks for sending this over! I want to make sure I'm on the right track. Quick questions:",
    "",
    ...topQuestions.map((q) => `• ${q.text}`),
    "",
    "No rush on answering — just want to make sure I get it right! 😊",
  ];

  // ── Very short ──
  const shortLines = [
    "Thanks! A few quick Qs:",
    ...topQuestions.map((q, i) => `${i + 1}. ${q.text}`),
    "Thanks!",
  ];

  return {
    formal: formalLines.join("\n"),
    friendly: friendlyLines.join("\n"),
    short: shortLines.join("\n"),
  };
}

/* ── Safe-assumptions plan ────────────────────────────────── */

/**
 * Generate a safe-assumptions plan for when the user gets no reply.
 *
 * @param {object} analysis – result from analyzer.analyze()
 * @returns {{ intro: string, assumptions: Array<{item, assumption}>, advice: string }}
 */
export function generateSafeAssumptions(analysis) {
  if (!analysis) {
    return {
      intro: "",
      assumptions: [],
      advice: "",
    };
  }

  const assumptions = [];

  const deadlineMissing = (analysis.missingInfo || []).some(
    (item) => item.id === "deadline" && !item.found
  );

  if (deadlineMissing) {
    assumptions.push({
      item: "Deadline",
      assumption: "Deadline: assume 2 working days from now and mention it in your message.",
    });
  }

  for (const item of (analysis.missingInfo || [])) {
    if (!item.found) {
      if (item.id === "deadline" && deadlineMissing) {
        continue;
      }
      assumptions.push({
        item: item.label,
        assumption: getDefaultAssumption(item.id, analysis.senderType),
      });
    }
  }

  // Add assumptions for the most impactful vague words
  const vagueCategories = new Set();
  for (const match of analysis.vagueMatches.slice(0, 3)) {
    if (!vagueCategories.has(match.category)) {
      vagueCategories.add(match.category);
      assumptions.push({
        item: `"${match.word}" (${match.label})`,
        assumption: match.interpretations[0], // pick the more conservative one
      });
    }
  }

  const timeframe = analysis.senderType === "teacher" ? "24 hours" :
                     analysis.senderType === "client" ? "a few hours" : "end of day";

  return {
    intro: `If you haven't heard back within ${timeframe}, here's a sensible plan so you can start working without freezing:`,
    assumptions,
    advice:
      "Start with these assumptions and note them down. When you do hear back, you can adjust. " +
      "Starting imperfectly is almost always better than not starting at all. " +
      "You can also send a quick message saying: \"I'm going to proceed with these assumptions unless I hear otherwise.\"",
  };
}

/* ── Default assumptions by missing-info type ─────────────── */

function getDefaultAssumption(infoId, senderType) {
  const defaults = {
    deadline: {
      teacher: "Assume end of the week (Friday 11:59 PM) unless stated otherwise",
      manager: "Aim for end of next business day",
      group: "Suggest a deadline to the group (e.g., 2 days from now)",
      client: "Aim for 2-3 business days; send a progress update tomorrow",
      "": "Aim for 2-3 days from now and communicate that timeline",
    },
    length: {
      teacher: "Aim for 2-3 pages / 500-750 words as a safe middle ground",
      manager: "Keep it to 1-2 pages or 5-10 slides — concise but complete",
      group: "Match the length of other team members' sections",
      client: "Focus on quality over quantity; 1-2 pages of clear content",
      "": "Aim for 1-2 pages unless the topic clearly needs more",
    },
    format: {
      teacher: "Use PDF (universally accepted) with standard formatting (12pt, double-spaced)",
      manager: "Use the company's standard template; if unsure, a clean Word doc or Google Slides",
      group: "Use Google Docs/Slides for easy collaboration",
      client: "Use PDF for final deliverables, with source files available if requested",
      "": "Use PDF — it preserves formatting across devices",
    },
    audience: {
      teacher: "Write for your professor — knowledgeable but needs to see YOUR understanding",
      manager: "Write for your direct audience (team, execs, or clients as context suggests)",
      group: "Write for the same audience as the rest of the project",
      client: "Write for the client's stakeholders — professional and clear",
      "": "Write for a knowledgeable but busy reader",
    },
    criteria: {
      teacher: "Follow any course rubric; focus on demonstrating understanding and original thinking",
      manager: "Focus on completeness, accuracy, and actionable content",
      group: "Match the quality and depth of the rest of the group's work",
      client: "Focus on meeting the stated requirements and solving the problem",
      "": "Aim for thorough, well-organized, and error-free work",
    },
    submission: {
      teacher: "Check the course platform first (Canvas, Blackboard); if unsure, email with the assignment title in the subject",
      manager: "Email or share via the platform your team normally uses",
      group: "Share in the group's usual platform (shared drive, chat, etc.)",
      client: "Email with a clear subject line and the file attached",
      "": "Email is usually the safest default",
    },
    contact: {
      teacher: "Reply to the original email or message, or visit office hours",
      manager: "Reply directly to the sender or ping them on your team's chat platform",
      group: "Ask in the group chat so everyone stays informed",
      client: "Reply to the original email thread to keep everything documented",
      "": "Reply to the original message to keep context",
    },
  };

  const group = defaults[infoId] || {};
  return group[senderType] || group[""] || "Use your best judgment based on context";
}
