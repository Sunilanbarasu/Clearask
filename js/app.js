/**
 * app.js — Entry point for ClearAsk.
 *
 * Initializes the UI when the DOM is ready.
 * This file should be loaded as a module:
 *   <script type="module" src="js/app.js"></script>
 */

import { initUI } from "./ui.js";

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUI);
} else {
  initUI();
}
