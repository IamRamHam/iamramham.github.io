(() => {
  "use strict";

  const output = document.getElementById("ipa-output");
  const tooltip = document.getElementById("word-translation");
  const title = document.getElementById("translation-word");
  const base = document.getElementById("translation-base");
  const meaning = document.getElementById("translation-meaning");
  let target = null;
  let active = false;
  let showTimer = 0;
  let leaveTimer = 0;
  let pointer = null;
  let interaction = "pointer";

  function tokenFor(element) {
    const token = element instanceof Element ? element.closest(".word-token") : null;
    return token && output.contains(token) ? token : null;
  }

  function wordFor(token) {
    return token?.querySelector(".token-en")?.textContent || "";
  }

  function hide() {
    target?.removeAttribute("aria-describedby");
    tooltip.hidden = true;
  }

  function reset() {
    clearTimeout(showTimer);
    clearTimeout(leaveTimer);
    hide();
    target = null;
    active = false;
    pointer = null;
  }

  function position() {
    if (!target || !output.contains(target)) {
      reset();
      return;
    }
    const anchor = target.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    const padding = 12;
    const gap = 10;
    const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    const above = anchor.top - gap - height;
    const top = above >= headerBottom + gap ? above : anchor.bottom + gap;
    tooltip.style.left = Math.max(padding, Math.min(
      anchor.left + (anchor.width - width) / 2,
      window.innerWidth - width - padding
    )) + "px";
    tooltip.style.top = Math.max(padding, Math.min(top, window.innerHeight - height - padding)) + "px";
  }

  function show() {
    if (!target || !output.contains(target)) {
      reset();
      return;
    }
    active = true;
    const word = wordFor(target);
    const dictionary = window.PhoneticJapanese;
    const entry = dictionary?.lookup(word, {
      previous: wordFor(target.previousElementSibling),
      next: wordFor(target.nextElementSibling)
    });
    title.textContent = word;
    const hasBase = entry && entry.headword.toLowerCase() !== word.normalize("NFKC").replace(/[’‘]/g, "'").toLowerCase();
    base.hidden = !hasBase;
    base.textContent = hasBase ? "見出し " + entry.headword : "";
    meaning.textContent = entry ? entry.meaning : dictionary ? "英和辞書に未収録です。" : "英和辞書を読み込めませんでした。";
    target.setAttribute("aria-describedby", tooltip.id);
    tooltip.hidden = false;
    position();
  }

  function enter(token, source) {
    clearTimeout(leaveTimer);
    interaction = source;
    if (target === token) return;
    clearTimeout(showTimer);
    hide();
    target = token;
    if (active) show();
    else showTimer = setTimeout(show, 1000);
  }

  function leaveWord() {
    clearTimeout(showTimer);
    hide();
    target = null;
    // Let a pointer cross the small gap to an adjacent word without a new wait.
    // Leaving the output area resets immediately.
    leaveTimer = setTimeout(reset, 80);
  }

  output.addEventListener("pointerover", event => {
    if (event.pointerType === "touch") return;
    const token = tokenFor(event.target);
    if (!token || token === tokenFor(event.relatedTarget)) return;
    pointer = { x: event.clientX, y: event.clientY };
    enter(token, "pointer");
  });
  output.addEventListener("pointerout", event => {
    if (event.pointerType === "touch" || tokenFor(event.target) !== target) return;
    pointer = { x: event.clientX, y: event.clientY };
    const next = tokenFor(event.relatedTarget);
    if (next === target) return;
    if (next) enter(next, "pointer");
    else leaveWord();
  });
  output.addEventListener("pointermove", event => {
    if (event.pointerType !== "touch") pointer = { x: event.clientX, y: event.clientY };
  });
  output.addEventListener("pointerleave", reset);

  output.addEventListener("focusin", event => {
    const token = tokenFor(event.target);
    if (token?.matches(":focus-visible")) {
      pointer = null;
      enter(token, "keyboard");
    }
  });
  output.addEventListener("focusout", event => {
    if (interaction !== "keyboard" || tokenFor(event.target) !== target) return;
    const next = tokenFor(event.relatedTarget);
    if (next) enter(next, "keyboard");
    else reset();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") reset();
  });

  function followPosition() {
    if (!target && !active) return;
    if (interaction === "pointer" && pointer) {
      const next = tokenFor(document.elementFromPoint(pointer.x, pointer.y));
      if (!next) {
        reset();
        return;
      }
      if (next !== target) enter(next, "pointer");
    }
    if (!tooltip.hidden) position();
  }
  window.addEventListener("scroll", followPosition, { capture: true, passive: true });
  window.addEventListener("resize", followPosition);
  window.addEventListener("blur", reset);
  window.addEventListener("pagehide", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });
  // Replacing the transcription also invalidates any pending or visible translation.
  new MutationObserver(reset).observe(output, { childList: true });
})();
