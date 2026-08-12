(function () {
  "use strict";

  function calculateScale(viewportWidth, viewportHeight, stageWidth = 1440, stageHeight = 900) {
    const values = [viewportWidth, viewportHeight, stageWidth, stageHeight];
    if (values.some((value) => !Number.isFinite(value) || value <= 0)) return 0;
    return Math.min(viewportWidth / stageWidth, viewportHeight / stageHeight);
  }

  function initialisePresentation() {
    const root = document.documentElement;
    const stage = document.getElementById("presentation");
    const referencesTrigger = document.getElementById("references-trigger");
    const referencesDialog = document.getElementById("references-dialog");
    const referencesClose = document.getElementById("references-close");

    if (!stage) return;

    root.classList.add("has-js");

    let resizeFrame = 0;
    const fitStage = () => {
      const scale = calculateScale(window.innerWidth, window.innerHeight);
      const left = Math.max(0, (window.innerWidth - 1440 * scale) / 2);
      const top = Math.max(0, (window.innerHeight - 900 * scale) / 2);

      root.style.setProperty("--stage-scale", String(scale));
      root.style.setProperty("--stage-left", `${left}px`);
      root.style.setProperty("--stage-top", `${top}px`);
    };

    const queueFit = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(fitStage);
    };

    const setFocus = (focusKey) => {
      if (focusKey) stage.dataset.focus = focusKey;
      else delete stage.dataset.focus;
    };

    stage.querySelectorAll("[data-focus-key]").forEach((target) => {
      const focusKey = target.dataset.focusKey;
      target.addEventListener("pointerenter", () => setFocus(focusKey));
      target.addEventListener("pointerleave", () => setFocus(null));
      target.addEventListener("focus", () => setFocus(focusKey));
      target.addEventListener("blur", () => setFocus(null));
    });

    const openReferences = () => {
      if (!referencesDialog) return;
      if (typeof referencesDialog.showModal === "function") referencesDialog.showModal();
      else referencesDialog.setAttribute("open", "");
      referencesClose?.focus();
    };

    const closeReferences = () => {
      if (!referencesDialog) return;
      if (typeof referencesDialog.close === "function" && referencesDialog.open) referencesDialog.close();
      else referencesDialog.removeAttribute("open");
      referencesTrigger?.focus();
    };

    referencesTrigger?.addEventListener("click", openReferences);
    referencesClose?.addEventListener("click", closeReferences);
    referencesDialog?.addEventListener("click", (event) => {
      if (event.target === referencesDialog) closeReferences();
    });
    referencesDialog?.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeReferences();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && referencesDialog?.open) {
        event.preventDefault();
        closeReferences();
      }
    });

    window.addEventListener("resize", queueFit, { passive: true });
    fitStage();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculateScale };
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialisePresentation, { once: true });
    } else {
      initialisePresentation();
    }
  }
})();
