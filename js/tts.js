/**
 * tts.js — Text-to-Speech and Voice Input using Web Speech API.
 *
 * TTS:
 *   speak(text)      – read text aloud
 *   stopSpeaking()   – cancel any current speech
 *   isSpeaking()     – true if currently speaking
 *
 * Voice Input:
 *   startListening(onResult, onEnd)  – start speech recognition
 *   stopListening()                  – stop speech recognition
 *   isListening()                    – true if mic is active
 *   isVoiceSupported()               – true if browser supports recognition
 */

/* ── Text-to-Speech ───────────────────────────────────────── */

const synth = window.speechSynthesis;

/**
 * Speak the given text aloud.
 * @param {string} text – plain text to read
 * @param {function} [onEnd] – callback when speech finishes
 */
export function speak(text, onEnd) {
  if (!synth) return;
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;  // slightly slower for accessibility
  utterance.pitch = 1;
  utterance.lang = "en-US";

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  synth.speak(utterance);
}

/** Cancel any current speech. */
export function stopSpeaking() {
  if (synth) synth.cancel();
}

/** @returns {boolean} true if the browser is currently speaking */
export function isSpeaking() {
  return synth ? synth.speaking : false;
}

/** @returns {boolean} true if TTS is supported */
export function isTTSSupported() {
  return !!synth;
}

/* ── Voice Input (Speech Recognition) ─────────────────────── */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let _listening = false;

/**
 * Start speech recognition.
 * @param {function(string)} onResult – called with transcript text
 * @param {function} [onEnd] – called when recognition stops
 */
export function startListening(onResult, onEnd) {
  if (!SpeechRecognition) return;
  stopListening();

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onend = () => {
    _listening = false;
    if (onEnd) onEnd();
  };

  recognition.onerror = (event) => {
    _listening = false;
    // "no-speech" and "aborted" are not real errors
    if (event.error !== "no-speech" && event.error !== "aborted") {
      console.warn("Speech recognition error:", event.error);
    }
    if (onEnd) onEnd();
  };

  recognition.start();
  _listening = true;
}

/** Stop speech recognition. */
export function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch { /* ignore */ }
    recognition = null;
  }
  _listening = false;
}

/** @returns {boolean} true if microphone is currently active */
export function isListening() {
  return _listening;
}

/** @returns {boolean} true if voice input is supported */
export function isVoiceSupported() {
  return !!SpeechRecognition;
}
