/**
 * storage.js — Manages localStorage for history, settings, and API key.
 *
 * Public API:
 *   saveAnalysis(analysis)       – persist an analysis result
 *   getHistory()                 – return all saved analyses (newest first)
 *   deleteAnalysis(id)           – delete one entry by id
 *   clearHistory()               – wipe all history
 *   exportHistory()              – return history as a JSON string
 *   importHistory(jsonString)    – merge imported entries into history
 *   saveSettings(settings)       – persist user settings
 *   getSettings()                – return saved settings or defaults
 *   saveApiKey(key)              – store API key
 *   getApiKey()                  – retrieve stored API key
 *   removeApiKey()               – delete stored API key
 */

const HISTORY_KEY = "clearask_history";
const SETTINGS_KEY = "clearask_settings";
const API_KEY_KEY = "clearask_api_key";

/* ── Default Settings ──────────────────────────────────────── */

export const DEFAULT_SETTINGS = {
  theme: "light",             // light | dark | high-contrast | calm
  dyslexiaFont: false,
  fontSize: 100,              // percentage (80–150)
  lineSpacing: 1.6,           // unitless
  reducedMotion: false,
  useAI: false,
};

/* ── History ───────────────────────────────────────────────── */

/**
 * Save an analysis result. Each entry gets a unique id + timestamp.
 * @param {object} analysis – the analysis result object from the analyzer
 */
export function saveAnalysis(analysis) {
  const history = getHistory();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    originalText: analysis.originalText,
    senderType: analysis.senderType,
    clarityLevel: analysis.clarityLevel,
    vagueWordCount: analysis.vagueMatches?.length ?? 0,
    missingCount: analysis.missingInfo?.filter((i) => !i.found).length ?? 0,
  };
  history.unshift(entry); // newest first
  // Keep a reasonable cap
  if (history.length > 100) history.length = 100;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage might be full – silently fail
  }
}

/**
 * Return all saved analyses, newest first.
 * @returns {Array<object>}
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a single history entry by id.
 * @param {string} id
 */
export function deleteAnalysis(id) {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/** Clear all history. */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Export history as a JSON string (for file download).
 * @returns {string}
 */
export function exportHistory() {
  return JSON.stringify(getHistory(), null, 2);
}

/**
 * Import history from a JSON string, merging with existing entries.
 * Deduplicates by id.
 * @param {string} jsonString
 * @returns {number} count of newly imported entries
 */
export function importHistory(jsonString) {
  const imported = JSON.parse(jsonString); // may throw
  if (!Array.isArray(imported)) throw new Error("Invalid history format");

  const existing = getHistory();
  const existingIds = new Set(existing.map((e) => e.id));
  let added = 0;

  for (const entry of imported) {
    if (entry.id && !existingIds.has(entry.id)) {
      existing.push(entry);
      existingIds.add(entry.id);
      added++;
    }
  }

  // Sort newest first
  existing.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(existing));
  return added;
}

/* ── Settings ──────────────────────────────────────────────── */

/**
 * Save user settings to localStorage.
 * @param {object} settings
 */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Retrieve user settings, falling back to defaults for any missing key.
 * @returns {object}
 */
export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/* ── API Key ───────────────────────────────────────────────── */

/**
 * Store the user's API key (only in localStorage, never sent to any server).
 * @param {string} key
 */
export function saveApiKey(key) {
  localStorage.setItem(API_KEY_KEY, key);
}

/**
 * Retrieve the stored API key, or empty string.
 * @returns {string}
 */
export function getApiKey() {
  return localStorage.getItem(API_KEY_KEY) || "";
}

/** Remove the stored API key. */
export function removeApiKey() {
  localStorage.removeItem(API_KEY_KEY);
}
