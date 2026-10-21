/**
 * ui.js — DOM rendering and interaction layer.
 *
 * Manages screen transitions, renders analysis results, handles settings panel,
 * history panel, highlights, tooltips, and accessibility features.
 */

import { analyze, buildHighlightedHTML, simplifyText } from "./analyzer.js";
import { generateQuestions } from "./questions.js";
import { generateMessages, generateSafeAssumptions } from "./messages.js";
import { EXAMPLE_MESSAGES } from "./vagueWords.js";
import {
  saveAnalysis, getHistory, deleteAnalysis, clearHistory,
  exportHistory, importHistory,
  saveSettings, getSettings, saveApiKey, getApiKey, removeApiKey,
} from "./storage.js";
import {
  speak, stopSpeaking, isSpeaking, isTTSSupported,
  startListening, stopListening, isListening, isVoiceSupported,
} from "./tts.js";

/* ── DOM References ───────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ── State ────────────────────────────────────────────────── */

let currentAnalysis = null;
let currentQuestions = null;
let currentMessages = null;
let currentAssumptions = null;

/* ── Initialization ───────────────────────────────────────── */

export function initUI() {
  applySettings(getSettings());
  bindInputScreen();
  bindSettingsPanel();
  bindHistoryPanel();
  bindResultsScreen();
  bindKeyboard();
  updateHistoryBadge();

  const senderEl = $("#sender-type");
  if (senderEl && !senderEl.value) {
    senderEl.selectedIndex = 0;
  }

  // Check voice support
  if (!isVoiceSupported()) {
    const voiceBtn = $("#voice-input-btn");
    if (voiceBtn) {
      voiceBtn.hidden = true;
    }
  }
  if (!isTTSSupported()) {
    $$(".tts-btn").forEach((b) => (b.hidden = true));
  }
}

/* ── Input Screen ─────────────────────────────────────────── */

function bindInputScreen() {
  // Decode button
  $("#decode-btn").addEventListener("click", handleDecode);

  // Voice input
  const voiceBtn = $("#voice-input-btn");
  if (voiceBtn) {
    voiceBtn.addEventListener("click", handleVoiceInput);
  }

  // Example buttons
  $$(".example-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.example;
      const example = EXAMPLE_MESSAGES[key];
      if (example) {
        const inputEl = $("#message-input");
        inputEl.value = example.text;
        const senderSelect = $("#sender-type");
        if (senderSelect) {
          senderSelect.value = example.sender;
        }
        inputEl.dispatchEvent(new Event("input"));
        // Announce
        announceToScreenReader("Example loaded. Press Decode It to analyze.");
      }
    });
  });

  // Character count
  const textarea = $("#message-input");
  textarea.addEventListener("input", () => {
    const count = textarea.value.length;
    const counter = $("#char-count");
    if (counter) counter.textContent = `${count} characters`;
  });
}

function handleDecode() {
  const text = $("#message-input").value.trim();
  if (!text) {
    $("#message-input").focus();
    announceToScreenReader("Please paste or type a message first.");
    return;
  }

  const senderType = $("#sender-type").value;
  const settings = getSettings();

  // AI feature is currently hidden — force off so old saved settings can't trigger it
  settings.useAI = false;

  // Check if AI mode is enabled
  if (settings.useAI && getApiKey()) {
    runAIAnalysis(text, senderType);
  } else {
    runRuleAnalysis(text, senderType);
  }
}

function runRuleAnalysis(text, senderType) {
  currentAnalysis = analyze(text, senderType);
  if (!currentAnalysis) return;

  currentQuestions = generateQuestions(currentAnalysis);
  currentMessages = generateMessages(currentAnalysis, currentQuestions);
  currentAssumptions = generateSafeAssumptions(currentAnalysis);

  // Hide AI banner for rule-based analysis
  const banner = $("#ai-banner");
  if (banner) {
    banner.hidden = true;
    banner.className = "ai-banner";
    banner.textContent = "";
  }

  saveAnalysis(currentAnalysis);
  updateHistoryBadge();
  renderResults();
  showScreen("results");
  announceToScreenReader("Analysis complete. Results are now showing.");
}

/* ── AI Analysis (optional) ───────────────────────────────── */

function showAIBanner(type, message) {
  const banner = $("#ai-banner");
  if (!banner) return;
  banner.hidden = false;
  banner.className = `ai-banner ${type === "success" ? "ai-success" : "ai-fallback"}`;
  banner.textContent = message;
}

async function runAIAnalysis(text, senderType) {
  const apiKey = getApiKey();
  const decodeBtn = $("#decode-btn");
  decodeBtn.disabled = true;
  decodeBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Analyzing with AI…';

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an assistant that helps people decode vague instructions. Analyze the following message and return a JSON object with these fields:
- vagueWords: array of {word, label, explanation, interpretations} where interpretations is an array of strings
- missingInfo: array of {label, icon, found, suggestion} where found is boolean
- simplifiedText: a plain-English rewrite of the message
- clarifyingQuestions: array of {text, whyItMatters} (3-5 polite questions)
- safeAssumptions: array of {item, assumption} (sensible defaults)

The sender type is: ${senderType || "unknown"}.
Be warm and supportive. Never judge the user for not understanding.`,
          },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;

    let aiResult;
    try {
      aiResult = JSON.parse(raw);
    } catch (parseErr) {
      throw new Error(`AI returned invalid JSON: ${parseErr.message}`);
    }

    // Still run rule-based analysis for highlights and missing info
    currentAnalysis = analyze(text, senderType);

    currentQuestions = aiResult.clarifyingQuestions?.map((q, i) => ({
      text: q.text,
      whyItMatters: q.whyItMatters,
      priority: i + 1,
    })) || generateQuestions(currentAnalysis);

    currentMessages = generateMessages(currentAnalysis, currentQuestions);

    currentAssumptions = {
      intro: "If you haven't heard back, here's a sensible plan:",
      assumptions: aiResult.safeAssumptions || generateSafeAssumptions(currentAnalysis).assumptions,
      advice: generateSafeAssumptions(currentAnalysis).advice,
    };

    // Override simplify with AI version if available
    if (aiResult.simplifiedText) {
      currentAnalysis._aiSimplified = aiResult.simplifiedText;
    }

    saveAnalysis(currentAnalysis);
    updateHistoryBadge();
    renderResults();
    showScreen("results");

    showAIBanner("success", "✨ Analyzed with AI");
    announceToScreenReader("AI analysis complete. Results are now showing.");
  } catch (err) {
    console.error("AI analysis failed:", err);
    showAIBanner("fallback", `AI failed (reason: ${err.message}), showing rule-based results`);
    announceToScreenReader("AI analysis failed. Using rule-based analysis instead.");
    runRuleAnalysis(text, senderType);
    // Keep the fallback banner visible (runRuleAnalysis hides it, so re-show)
    showAIBanner("fallback", `AI failed (reason: ${err.message}), showing rule-based results`);
  } finally {
    decodeBtn.disabled = false;
    decodeBtn.innerHTML = '✨ Decode it';
  }
}


/* ── Voice Input ──────────────────────────────────────────── */

function handleVoiceInput() {
  const btn = $("#voice-input-btn");
  if (isListening()) {
    stopListening();
    btn.classList.remove("listening");
    btn.innerHTML = '<span aria-hidden="true">🎤</span> Voice input';
    announceToScreenReader("Voice input stopped.");
  } else {
    btn.classList.add("listening");
    btn.innerHTML = '<span aria-hidden="true">🔴</span> Listening…';
    announceToScreenReader("Listening. Speak now.");
    startListening(
      (transcript) => {
        const textarea = $("#message-input");
        textarea.value += (textarea.value ? " " : "") + transcript;
        textarea.dispatchEvent(new Event("input"));
      },
      () => {
        btn.classList.remove("listening");
        btn.innerHTML = '<span aria-hidden="true">🎤</span> Voice input';
      }
    );
  }
}

/* ── Results Rendering ────────────────────────────────────── */

function renderResults() {
  if (!currentAnalysis) return;

  // Clarity score
  renderClarityScore();

  // Highlighted text
  renderHighlightedText();

  // Missing info checklist
  renderMissingInfo();

  // Clarifying questions
  renderQuestions();

  // Message writer
  renderMessages();

  // Safe assumptions
  renderAssumptions();

  // Simplify mode
  renderSimplified();
}

function renderClarityScore() {
  const el = $("#clarity-score");
  if (!el) return;

  const { clarityLevel, clarityLabel, clarityDescription } = currentAnalysis;
  const icons = {
    clear: "🟢",
    "partly-clear": "🟡",
    "mostly-unclear": "🔴",
  };

  el.innerHTML = `
    <div class="clarity-badge clarity-${clarityLevel}" role="status">
      <span class="clarity-icon" aria-hidden="true">${icons[clarityLevel] || "⚪"}</span>
      <span class="clarity-label">${clarityLabel}</span>
    </div>
    <p class="clarity-description">${clarityDescription}</p>
  `;
}

function renderHighlightedText() {
  const el = $("#highlighted-text");
  if (!el) return;

  const html = buildHighlightedHTML(
    currentAnalysis.originalText,
    currentAnalysis.vagueMatches
  );

  const count = currentAnalysis.vagueMatches.length;
  const summary = count === 0
    ? "No vague language found — nice!"
    : `${count} vague word${count > 1 ? "s" : ""} found. Click any highlighted word for details.`;

  el.innerHTML = `
    <p class="highlight-summary" role="status">${summary}</p>
    <div class="highlighted-message" role="document" aria-label="Message with vague words highlighted">
      ${html}
    </div>
  `;

  // Bind highlight click/keyboard
  el.querySelectorAll(".vague-highlight").forEach(bindHighlightInteraction);
}

function bindHighlightInteraction(mark) {
  const showTooltip = () => {
    // Close any existing tooltip
    closeTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "vague-tooltip";
    tooltip.id = "active-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-label", `Explanation for "${mark.dataset.label}"`);

    tooltip.innerHTML = `
      <button class="tooltip-close" aria-label="Close explanation">&times;</button>
      <p class="tooltip-title">
        <span aria-hidden="true">${mark.dataset.icon}</span>
        "${mark.dataset.label}"
      </p>
      <p class="tooltip-explanation">${mark.dataset.explanation}</p>
      <p class="tooltip-interp-label">It could mean:</p>
      <ul class="tooltip-interps">
        <li>👉 ${mark.dataset.interp0}</li>
        <li>👉 ${mark.dataset.interp1}</li>
      </ul>
    `;

    // Position below the mark
    mark.style.position = "relative";
    mark.appendChild(tooltip);

    // Close button
    tooltip.querySelector(".tooltip-close").addEventListener("click", (e) => {
      e.stopPropagation();
      closeTooltip();
    });

    // Focus the tooltip for keyboard users
    tooltip.focus();
  };

  mark.addEventListener("click", showTooltip);
  mark.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      showTooltip();
    }
    if (e.key === "Escape") {
      closeTooltip();
    }
  });
}

function closeTooltip() {
  const existing = document.getElementById("active-tooltip");
  if (existing) existing.remove();
}

function renderMissingInfo() {
  const el = $("#missing-info");
  if (!el) return;

  const items = currentAnalysis.missingInfo;
  const missingCount = items.filter((i) => !i.found).length;
  const summary = missingCount === 0
    ? "All key information is present — great!"
    : `${missingCount} piece${missingCount > 1 ? "s" : ""} of information missing.`;

  let html = `<p class="checklist-summary" role="status">${summary}</p>`;
  html += '<ul class="info-checklist" role="list">';

  for (const item of items) {
    const statusClass = item.found ? "found" : "missing";
    const statusIcon = item.found ? "✅" : "❌";
    const statusLabel = item.found ? "Found" : "Missing";
    const icon =
      item.id === "criteria" || item.label?.toLowerCase().includes("criteria")
        ? "🎓"
        : item.icon;
    const detail = item.found && item.detail
      ? ` <span class="found-detail">(found: "${item.detail}")</span>`
      : "";

    html += `
      <li class="info-item info-${statusClass}" role="listitem">
        <span class="info-status" aria-label="${statusLabel}">${statusIcon}</span>
        <span class="info-icon" aria-hidden="true">${icon}</span>
        <span class="info-label">${item.label}</span>
        ${detail}
      </li>
    `;
  }

  html += "</ul>";
  el.innerHTML = html;
}

function renderQuestions() {
  const el = $("#clarifying-questions");
  if (!el) return;

  if (!currentQuestions?.length) {
    el.innerHTML = '<p class="no-questions">No clarifying questions needed — the message seems clear enough!</p>';
    return;
  }

  let html = '<p class="questions-intro">Here are polite questions you can ask, ranked by importance:</p>';
  html += '<ol class="questions-list" role="list">';

  for (const q of currentQuestions) {
    html += `
      <li class="question-item">
        <p class="question-text">${q.text}</p>
        <p class="question-why">
          <span class="why-label">Why this matters:</span> ${q.whyItMatters}
        </p>
      </li>
    `;
  }

  html += "</ol>";
  el.innerHTML = html;
}

function renderMessages() {
  const el = $("#message-writer");
  if (!el) return;

  const tones = [
    { key: "formal", label: "Formal email", icon: "📧" },
    { key: "friendly", label: "Friendly chat", icon: "💬" },
    { key: "short", label: "Very short", icon: "⚡" },
  ];

  let html = '<p class="messages-intro">Here are ready-to-send replies. Edit them if you like, then copy:</p>';
  html += '<div class="tone-tabs" role="tablist" aria-label="Message tone">';

  for (const tone of tones) {
    html += `
      <button class="tone-tab ${tone.key === "formal" ? "active" : ""}"
              role="tab"
              aria-selected="${tone.key === "formal"}"
              aria-controls="tone-panel-${tone.key}"
              data-tone="${tone.key}">
        <span aria-hidden="true">${tone.icon}</span> ${tone.label}
      </button>
    `;
  }
  html += "</div>";

  for (const tone of tones) {
    html += `
      <div class="tone-panel ${tone.key === "formal" ? "active" : ""}"
           id="tone-panel-${tone.key}"
           role="tabpanel"
           ${tone.key !== "formal" ? 'hidden' : ''}>
        <textarea class="message-textarea"
                  id="msg-${tone.key}"
                  aria-label="${tone.label} message"
                  rows="8">${currentMessages[tone.key]}</textarea>
        <div class="message-actions">
          <button class="copy-btn" data-target="msg-${tone.key}" aria-label="Copy ${tone.label} message">
            <span aria-hidden="true">📋</span> Copy
          </button>
          <button class="tts-btn" data-target="msg-${tone.key}" aria-label="Read ${tone.label} message aloud">
            <span aria-hidden="true">🔊</span> Read aloud
          </button>
        </div>
      </div>
    `;
  }

  el.innerHTML = html;

  // Bind tab switching
  el.querySelectorAll(".tone-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      el.querySelectorAll(".tone-tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      el.querySelectorAll(".tone-panel").forEach((p) => {
        p.classList.remove("active");
        p.hidden = true;
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = el.querySelector(`#tone-panel-${tab.dataset.tone}`);
      panel.classList.add("active");
      panel.hidden = false;
    });
  });

  // Bind copy buttons
  el.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const textarea = document.getElementById(btn.dataset.target);
      navigator.clipboard.writeText(textarea.value).then(() => {
        btn.innerHTML = '<span aria-hidden="true">✅</span> Copied!';
        announceToScreenReader("Message copied to clipboard.");
        setTimeout(() => {
          btn.innerHTML = '<span aria-hidden="true">📋</span> Copy';
        }, 2000);
      });
    });
  });

  // Bind TTS buttons
  el.querySelectorAll(".tts-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isSpeaking()) {
        stopSpeaking();
        btn.innerHTML = '<span aria-hidden="true">🔊</span> Read aloud';
        return;
      }
      const textarea = document.getElementById(btn.dataset.target);
      btn.innerHTML = '<span aria-hidden="true">⏹️</span> Stop';
      speak(textarea.value, () => {
        btn.innerHTML = '<span aria-hidden="true">🔊</span> Read aloud';
      });
    });
  });
}

function renderAssumptions() {
  const el = $("#safe-assumptions");
  if (!el) return;

  if (!currentAssumptions?.assumptions?.length) {
    el.innerHTML = '<p class="no-assumptions">No assumptions needed — the message provides enough detail.</p>';
    return;
  }

  let html = `<p class="assumptions-intro">${currentAssumptions.intro}</p>`;
  html += '<ul class="assumptions-list" role="list">';

  for (const a of currentAssumptions.assumptions) {
    const val = a.assumption.startsWith(`${a.item}: `)
      ? a.assumption.slice(`${a.item}: `.length)
      : a.assumption;
    html += `
      <li class="assumption-item">
        <span class="assumption-label">${a.item}:</span>
        <span class="assumption-value">${val}</span>
      </li>
    `;
  }

  html += "</ul>";
  html += `<p class="assumptions-advice">💡 ${currentAssumptions.advice}</p>`;
  el.innerHTML = html;
}

function renderSimplified() {
  const el = $("#simplified-view");
  if (!el) return;

  const simplified =
    currentAnalysis._aiSimplified || simplifyText(currentAnalysis.originalText);

  el.innerHTML = `
    <div class="simplify-toggle-wrapper">
      <label class="simplify-toggle" for="simplify-side-by-side">
        <input type="checkbox" id="simplify-side-by-side" />
        Show original side by side
      </label>
    </div>
    <div class="simplify-content">
      <div class="simplified-text">
        <h4>Simplified version</h4>
        <p>${escapeHTML(simplified)}</p>
      </div>
      <div class="original-text-side" hidden>
        <h4>Original</h4>
        <p>${escapeHTML(currentAnalysis.originalText)}</p>
      </div>
    </div>
  `;

  // Bind toggle
  const toggle = el.querySelector("#simplify-side-by-side");
  const content = el.querySelector(".simplify-content");
  const originalSide = el.querySelector(".original-text-side");

  toggle.addEventListener("change", () => {
    originalSide.hidden = !toggle.checked;
    content.classList.toggle("side-by-side", toggle.checked);
  });
}

/* ── Screen Management ────────────────────────────────────── */

function showScreen(name) {
  $$(".screen").forEach((s) => {
    s.hidden = true;
    s.setAttribute("aria-hidden", "true");
  });
  const target = $(`#${name}-screen`);
  if (target) {
    target.hidden = false;
    target.setAttribute("aria-hidden", "false");
    target.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ── Results Screen ───────────────────────────────────────── */

function bindResultsScreen() {
  // Back button
  $("#back-btn")?.addEventListener("click", () => {
    showScreen("input");
    closeTooltip();
    stopSpeaking();
    announceToScreenReader("Returned to input screen.");
  });

  // Read all aloud
  $("#read-all-btn")?.addEventListener("click", () => {
    if (isSpeaking()) {
      stopSpeaking();
      $("#read-all-btn").innerHTML = '<span aria-hidden="true">🔊</span> Read all results';
      return;
    }
    // Collect all readable text
    const parts = [];
    parts.push(`Clarity: ${currentAnalysis.clarityLabel}. ${currentAnalysis.clarityDescription}`);
    const missing = currentAnalysis.missingInfo.filter((i) => !i.found);
    if (missing.length) {
      parts.push(`Missing information: ${missing.map((m) => m.label).join(", ")}.`);
    }
    if (currentQuestions?.length) {
      parts.push("Suggested questions:");
      currentQuestions.forEach((q, i) => parts.push(`${i + 1}. ${q.text}`));
    }
    speak(parts.join(" "), () => {
      $("#read-all-btn").innerHTML = '<span aria-hidden="true">🔊</span> Read all results';
    });
    $("#read-all-btn").innerHTML = '<span aria-hidden="true">⏹️</span> Stop reading';
  });

  // Section tabs
  $$(".section-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".section-tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      $$(".result-section").forEach((s) => {
        s.hidden = true;
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const panel = $(`#${tab.dataset.section}`);
      if (panel) {
        panel.hidden = false;
        panel.focus();
      }
    });
  });
}

/* ── Settings Panel ───────────────────────────────────────── */

function bindSettingsPanel() {
  const panel = $("#settings-panel");
  const overlay = $("#panel-overlay");

  // Open
  $("#settings-btn").addEventListener("click", () => {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("open");
    overlay.classList.add("open");
    overlay.hidden = false;
    panel.querySelector("button, input, select").focus();
    document.body.classList.add("panel-open");
  });

  // Close
  const closeSettings = () => {
    panel.classList.remove("open");
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    overlay.classList.remove("open");
    overlay.hidden = true;
    document.body.classList.remove("panel-open");
    $("#settings-btn").focus();
  };

  $("#settings-close").addEventListener("click", closeSettings);
  overlay.addEventListener("click", closeSettings);

  // Theme
  $("#theme-select").addEventListener("change", (e) => {
    const s = getSettings();
    s.theme = e.target.value;
    saveSettings(s);
    applySettings(s);
  });

  // Dyslexia font
  $("#dyslexia-font").addEventListener("change", (e) => {
    const s = getSettings();
    s.dyslexiaFont = e.target.checked;
    saveSettings(s);
    applySettings(s);
  });

  // Font size
  $("#font-size").addEventListener("input", (e) => {
    const s = getSettings();
    s.fontSize = parseInt(e.target.value);
    saveSettings(s);
    applySettings(s);
    $("#font-size-value").textContent = `${s.fontSize}%`;
  });

  // Line spacing
  $("#line-spacing").addEventListener("input", (e) => {
    const s = getSettings();
    s.lineSpacing = parseFloat(e.target.value);
    saveSettings(s);
    applySettings(s);
    $("#line-spacing-value").textContent = s.lineSpacing.toFixed(1);
  });

  // Reduced motion
  $("#reduced-motion").addEventListener("change", (e) => {
    const s = getSettings();
    s.reducedMotion = e.target.checked;
    saveSettings(s);
    applySettings(s);
  });

  // AI toggle
  $("#use-ai-toggle").addEventListener("change", (e) => {
    const s = getSettings();
    s.useAI = e.target.checked;
    saveSettings(s);
    $("#api-key-group").hidden = !e.target.checked;
  });

  // API key
  $("#api-key-input").addEventListener("change", (e) => {
    const key = e.target.value.trim();
    if (key) {
      saveApiKey(key);
    } else {
      removeApiKey();
    }
  });

  // Initialize settings UI values
  const settings = getSettings();
  $("#theme-select").value = settings.theme;
  $("#dyslexia-font").checked = settings.dyslexiaFont;
  $("#font-size").value = settings.fontSize;
  $("#font-size-value").textContent = `${settings.fontSize}%`;
  $("#line-spacing").value = settings.lineSpacing;
  $("#line-spacing-value").textContent = settings.lineSpacing.toFixed(1);
  $("#reduced-motion").checked = settings.reducedMotion;
  $("#use-ai-toggle").checked = settings.useAI;
  $("#api-key-group").hidden = !settings.useAI;
  const storedKey = getApiKey();
  if (storedKey) {
    $("#api-key-input").value = storedKey;
  }
}

/* ── History Panel ────────────────────────────────────────── */

function bindHistoryPanel() {
  const panel = $("#history-panel");
  const overlay = $("#panel-overlay");

  // Open
  $("#history-btn").addEventListener("click", () => {
    renderHistoryList();
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("open");
    overlay.classList.add("open");
    overlay.hidden = false;
    panel.querySelector("button, input").focus();
    document.body.classList.add("panel-open");
  });

  // Close
  const closeHistory = () => {
    panel.classList.remove("open");
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    overlay.classList.remove("open");
    overlay.hidden = true;
    document.body.classList.remove("panel-open");
    $("#history-btn").focus();
  };

  $("#history-close").addEventListener("click", closeHistory);

  // Export
  $("#export-btn").addEventListener("click", () => {
    const json = exportHistory();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clearask-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    announceToScreenReader("History exported.");
  });

  // Import
  $("#import-btn").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const count = importHistory(reader.result);
          renderHistoryList();
          updateHistoryBadge();
          announceToScreenReader(`Imported ${count} new entries.`);
        } catch {
          announceToScreenReader("Invalid file. Please use a ClearAsk export file.");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // Clear all
  $("#clear-history-btn").addEventListener("click", () => {
    if (confirm("Delete all saved analyses? This cannot be undone.")) {
      clearHistory();
      renderHistoryList();
      updateHistoryBadge();
      announceToScreenReader("History cleared.");
    }
  });
}

function renderHistoryList() {
  const container = $("#history-list");
  const history = getHistory();

  if (!history.length) {
    container.innerHTML = '<p class="history-empty">No analyses saved yet.</p>';
    return;
  }

  let html = "";
  for (const entry of history) {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const preview = entry.originalText.slice(0, 80) + (entry.originalText.length > 80 ? "…" : "");

    html += `
      <div class="history-entry" data-id="${entry.id}">
        <div class="history-entry-header">
          <span class="history-date">${dateStr}</span>
          <span class="history-clarity clarity-badge clarity-${entry.clarityLevel}">${entry.clarityLevel}</span>
        </div>
        <p class="history-preview">${escapeHTML(preview)}</p>
        <button class="history-delete" aria-label="Delete this entry" data-id="${entry.id}">
          <span aria-hidden="true">🗑️</span> Delete
        </button>
      </div>
    `;
  }

  container.innerHTML = html;

  // Bind delete buttons
  container.querySelectorAll(".history-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteAnalysis(btn.dataset.id);
      renderHistoryList();
      updateHistoryBadge();
      announceToScreenReader("Entry deleted.");
    });
  });
}

function updateHistoryBadge() {
  const badge = $("#history-badge");
  if (!badge) return;
  const count = getHistory().length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

/* ── Apply Settings to DOM ────────────────────────────────── */

export function applySettings(settings) {
  const root = document.documentElement;

  // Theme
  root.setAttribute("data-theme", settings.theme);

  // Dyslexia font
  root.classList.toggle("dyslexia-font", settings.dyslexiaFont);

  // Font size
  root.style.setProperty("--user-font-size", `${settings.fontSize}%`);

  // Line spacing
  root.style.setProperty("--user-line-height", settings.lineSpacing);

  // Reduced motion
  root.classList.toggle("reduced-motion", settings.reducedMotion);
}

/* ── Keyboard Navigation ──────────────────────────────────── */

function bindKeyboard() {
  // Escape closes panels and tooltips
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTooltip();
      const settingsPanel = $("#settings-panel");
      const historyPanel = $("#history-panel");
      const overlay = $("#panel-overlay");

      if (settingsPanel.classList.contains("open")) {
        settingsPanel.classList.remove("open");
        settingsPanel.hidden = true;
        settingsPanel.setAttribute("aria-hidden", "true");
        overlay.classList.remove("open");
        overlay.hidden = true;
        document.body.classList.remove("panel-open");
        $("#settings-btn").focus();
      }
      if (historyPanel.classList.contains("open")) {
        historyPanel.classList.remove("open");
        historyPanel.hidden = true;
        historyPanel.setAttribute("aria-hidden", "true");
        overlay.classList.remove("open");
        overlay.hidden = true;
        document.body.classList.remove("panel-open");
        $("#history-btn").focus();
      }
    }
  });

  // Enter on decode button
  $("#message-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleDecode();
    }
  });
}

/* ── Screen Reader Announcements ──────────────────────────── */

function announceToScreenReader(message) {
  const region = $("#sr-announcer");
  if (region) {
    region.textContent = "";
    // Small delay to ensure screen readers pick up the change
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }
}

/* ── Utilities ────────────────────────────────────────────── */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
