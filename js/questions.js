/**
 * questions.js — Generates polite clarifying questions based on analysis results.
 *
 * Public API:
 *   generateQuestions(analysis) – returns an array of question objects
 *
 * Each question: { text, whyItMatters, priority (1=highest) }
 */

/* ── Question templates keyed by missing-info id ──────────── */

const QUESTION_TEMPLATES = {
  deadline: {
    formal: `Could you let me know the specific deadline for this?`,
    friendly: `When exactly do you need this by?`,
    whyItMatters: `Without a deadline, you might rush unnecessarily or deliver too late. A specific date and time removes the guesswork.`,
    priority: 1,
  },
  length: {
    formal: `Is there an expected length or size for this (e.g., word count, number of pages, or time limit)?`,
    friendly: `How long should this be — any word count or page limit?`,
    whyItMatters: `Length expectations vary wildly. A "short" essay could be 300 words or 1,500 words depending on who's asking.`,
    priority: 2,
  },
  format: {
    formal: `What format should the final deliverable be in (e.g., PDF, Word document, presentation)?`,
    friendly: `What file format do you want — PDF, Word doc, slides, etc.?`,
    whyItMatters: `Submitting in the wrong format can mean resubmission or lost marks. Better to ask than guess.`,
    priority: 3,
  },
  audience: {
    formal: `Who is the intended audience for this work?`,
    friendly: `Who's going to be reading or seeing this?`,
    whyItMatters: `Knowing the audience changes the tone, depth, and formality. Writing for classmates is different from writing for executives.`,
    priority: 4,
  },
  criteria: {
    formal: `Are there specific criteria, a rubric, or success metrics I should be aware of?`,
    friendly: `How will this be evaluated — is there a rubric or specific criteria?`,
    whyItMatters: `Understanding how you'll be graded or evaluated helps you focus on what actually matters.`,
    priority: 2,
  },
  submission: {
    formal: `What is the preferred submission method (e.g., email, upload to a platform, shared drive)?`,
    friendly: `Where should I submit this — email, Canvas, Google Drive?`,
    whyItMatters: `Submitting to the wrong place can mean it's counted as late or not received at all.`,
    priority: 3,
  },
  contact: {
    formal: `Who should I contact if I have additional questions about this task?`,
    friendly: `Who can I reach out to if I have more questions?`,
    whyItMatters: `Knowing who to ask prevents you from staying stuck. It's always okay to ask.`,
    priority: 5,
  },
};

/* ── Vague-word follow-up question templates ──────────────── */

const VAGUE_FOLLOW_UPS = {
  time: {
    text: `Could you share a specific date or time for the deadline?`,
    whyItMatters: `A specific date and time removes the guesswork and lets you plan.`,
    priority: 1,
  },
  quantity: {
    text: `Could you specify the expected length, amount, or scope?`,
    whyItMatters: `Vague quantity words like "short" or "a few" mean different things to different people.`,
    priority: 2,
  },
  quality: {
    text: `Could you describe what "good" looks like for this — any examples or standards to follow?`,
    whyItMatters: `Quality expectations vary widely. An example or reference point saves guesswork.`,
    priority: 3,
  },
  scope: {
    text: `Could you clarify what should be included or excluded?`,
    whyItMatters: `Words like "relevant" or "everything" leave the scope wide open. Narrowing it down saves time and effort.`,
    priority: 3,
  },
  filler: {
    text: `Could you list out the specific items or topics you have in mind?`,
    whyItMatters: `"Etc." and "and stuff" hide important details. Getting a full list avoids missing something.`,
    priority: 4,
  },
};

/**
 * Generate 3–5 polite, ranked clarifying questions based on analysis.
 *
 * @param {object} analysis – result from analyzer.analyze()
 * @returns {Array<{text:string, whyItMatters:string, priority:number}>}
 */
export function generateQuestions(analysis) {
  if (!analysis) return [];
  const questions = [];
  const seenItems = new Set();

  const CATEGORY_TO_ITEM = {
    time: `deadline`,
    quantity: `length`,
    quality: `criteria`,
    scope: `scope`,
    filler: `filler`,
  };

  const timeMatch = (analysis.vagueMatches || []).find((m) => m.category === "time");
  const timeWord = timeMatch?.word;

  function getDeadlineWhy(defaultWhy) {
    if (timeWord) {
      return `A phrase like "${timeWord}" leaves the timing open to interpretation. A specific date and time removes the guesswork.`;
    }
    return (
      defaultWhy ||
      `Without a deadline, you might rush unnecessarily or deliver too late. A specific date and time removes the guesswork.`
    );
  }

  // 1. Questions for missing information (one per missing item)
  for (const item of analysis.missingInfo || []) {
    if (!item.found && QUESTION_TEMPLATES[item.id] && !seenItems.has(item.id)) {
      seenItems.add(item.id);
      const tmpl = QUESTION_TEMPLATES[item.id];
      questions.push({
        id: item.id,
        text: tmpl.friendly,
        whyItMatters: item.id === "deadline" ? getDeadlineWhy(tmpl.whyItMatters) : tmpl.whyItMatters,
        priority: tmpl.priority,
      });
    }
  }

  // 2. Questions for vague-word categories (never duplicate a missing item question)
  for (const match of analysis.vagueMatches || []) {
    const itemKey = CATEGORY_TO_ITEM[match.category] || match.category;
    if (!seenItems.has(itemKey) && VAGUE_FOLLOW_UPS[match.category]) {
      seenItems.add(itemKey);
      const tmpl = VAGUE_FOLLOW_UPS[match.category];
      questions.push({
        id: itemKey,
        text: tmpl.text,
        whyItMatters: match.category === "time" ? getDeadlineWhy(tmpl.whyItMatters) : tmpl.whyItMatters,
        priority: tmpl.priority,
      });
    }
  }

  // Sort by priority (1 = most important)
  questions.sort((a, b) => a.priority - b.priority);

  // Return the 3 to 5 most important questions
  return questions.slice(0, 5);
}
