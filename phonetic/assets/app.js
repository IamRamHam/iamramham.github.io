(() => {
  "use strict";

  const byId = id => document.getElementById(id);
  const { sounds, source, notation } = window.PHONETIC_LESSON;
  const soundById = new Map(sounds.map(sound => [sound.id, sound]));
  const list = byId("sound-list");
  const detail = byId("sound-detail");
  const filterButtons = [...document.querySelectorAll(".filter")];
  const categories = [
    { id: "all", label: "すべて", sounds },
    { id: "a", label: "「ア」に似ている母音", sounds: sounds.slice(0, 6) },
    { id: "i", label: "「イ」に似ている母音", sounds: sounds.slice(6, 8) },
    { id: "u", label: "「ウ」に似ている母音", sounds: sounds.slice(8, 11) },
    { id: "diphthong", label: "二重母音", sounds: sounds.slice(11, 16) },
    { id: "consonant", label: "子音", sounds: sounds.slice(16) }
  ];
  let categoryId = "all";
  let selectedId = null;

  function icon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS(svg.namespaceURI, "use");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    use.setAttribute("href", "#i-" + name);
    svg.append(use);
    return svg;
  }

  function setIcon(control, name) {
    control.querySelector("use").setAttribute("href", "#i-" + name);
  }

  function timeLabel(seconds) {
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }

  function cardTitle(sound, part) {
    if (part === "sound") return "/" + sound.symbol + "/ の音を聴く";
    return sound.word + " を聴く";
  }

  function makeCard(sound) {
    const card = byId("sound-template").content.firstElementChild.cloneNode(true);
    card.dataset.id = sound.id;
    card.classList.add(sound.kind);
    card.classList.toggle("voiced", sound.voicing === "有声音");
    card.querySelector(".symbol-text").textContent = sound.symbol;
    card.querySelector(".example-ipa").textContent = "/" + sound.ipa + "/";

    const word = card.querySelector(".example-word");
    const offset = sound.word.indexOf(sound.highlight);
    if (offset >= 0) {
      const highlight = document.createElement("mark");
      highlight.textContent = sound.highlight;
      word.append(sound.word.slice(0, offset), highlight, sound.word.slice(offset + sound.highlight.length));
    } else {
      word.textContent = sound.word;
    }

    const tags = card.querySelector(".tags");
    const category = categories.find(item => item.id !== "all" && item.sounds.includes(sound));
    const labels = [category.label];
    if (sound.voicing) labels.push(sound.voicing);
    labels.forEach((label, index) => {
      const tag = document.createElement("span");
      tag.className = index === 0 ? "tag tag-kind" : "tag";
      tag.textContent = label;
      tags.append(tag);
    });
    const link = document.createElement("a");
    link.className = "video-time";
    link.href = source.url + "&t=" + sound.readingSeconds + "s";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = "参考動画で /" + sound.symbol + "/ を復習";
    link.setAttribute("aria-label", link.title + "（" + timeLabel(sound.readingSeconds) + "）");
    link.append(icon("video"), timeLabel(sound.readingSeconds));
    tags.append(link);

    const tips = card.querySelector(".card-tips");
    for (const line of sound.tips) {
      const span = document.createElement("span");
      span.textContent = line;
      tips.append(span);
    }
    return card;
  }

  function updateCategories() {
    for (const button of filterButtons) {
      const category = categories.find(item => item.id === button.dataset.category);
      button.querySelector("span").textContent = category.sounds.length;
      const active = category.id === categoryId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  }

  function renderList() {
    const filtered = categories.find(category => category.id === categoryId).sounds;
    if (!filtered.some(sound => sound.id === selectedId)) {
      if (sample) stopSample();
      selectedId = null;
      detail.replaceChildren();
      detail.hidden = true;
    }
    list.replaceChildren(...filtered.map(sound => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sound-choice " + sound.kind;
      button.classList.toggle("voiced", sound.voicing === "有声音");
      button.dataset.id = sound.id;
      button.textContent = "/" + sound.symbol + "/";
      button.setAttribute("aria-label", "/" + sound.symbol + "/ の音を聴き、コツと例単語を表示");
      button.setAttribute("aria-controls", "sound-detail");
      button.setAttribute("aria-pressed", String(sound.id === selectedId));
      button.setAttribute("aria-expanded", String(sound.id === selectedId));
      return button;
    }));
    byId("list-count").textContent = filtered.length + " 音を表示";
    syncSampleButtons();
  }

  function chooseSound(id) {
    if (sample && sample.sound.id !== id) stopSample();
    selectedId = id;
    detail.replaceChildren(makeCard(soundById.get(id)));
    detail.hidden = false;
    for (const button of list.children) {
      const active = button.dataset.id === id;
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-expanded", String(active));
    }
    syncSampleButtons();
    const divider = byId("reader").getBoundingClientRect().top + window.scrollY;
    const target = divider - window.innerHeight;
    if (target > window.scrollY) {
      window.scrollTo({
        top: target,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
      });
    }
  }

  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      categoryId = button.dataset.category;
      updateCategories();
      renderList();
    });
  }

  // Card audio is always either the isolated phoneme or the example word.
  const player = new Audio();
  let sample = null;

  function syncSampleButtons() {
    for (const card of detail.children) {
      const sound = soundById.get(card.dataset.id);
      const selected = sample?.sound === sound;
      card.classList.toggle("is-playing", selected);
      for (const control of card.querySelectorAll("[data-listen]")) {
        const active = Boolean(selected && sample.mode === control.dataset.listen);
        const label = active && control.dataset.listen === "word" ? "再生を停止" : cardTitle(sound, control.dataset.listen);
        control.classList.toggle("is-playing", active);
        control.setAttribute("aria-pressed", String(active));
        control.setAttribute("aria-label", label);
        control.title = label;
        if (control.dataset.listen === "word") {
          setIcon(control, active ? "stop" : "play");
          control.querySelector("span").textContent = active ? "停止" : "単語を聴く";
        }
      }
    }
  }

  function stopSample() {
    player.onended = null;
    player.onerror = null;
    player.pause();
    sample = null;
    syncSampleButtons();
  }

  function playSample(sound, mode, restart = false) {
    const same = sample?.sound === sound && sample.mode === mode;
    stopSample();
    if (same && !restart) return;
    if (speechMode !== "idle") stopReading(false, "英文の読み上げを停止しました。");
    byId("card-error").hidden = true;
    const selection = { sound, mode };
    sample = selection;
    syncSampleButtons();

    function failed() {
      if (sample !== selection) return;
      stopSample();
      const error = byId("card-error");
      error.textContent = "音声ファイルを再生できません。assets フォルダーを index.html と同じ場所に置いて開き直してください。";
      error.hidden = false;
    }
    function playPart(part) {
      player.onended = () => {
        if (sample !== selection) return;
        stopSample();
      };
      player.onerror = failed;
      player.src = "assets/" + part + "-" + sound.id + ".wav";
      player.play().catch(failed);
    }
    playPart(mode === "word" ? "word" : "sound");
  }

  list.addEventListener("click", event => {
    const choice = event.target.closest(".sound-choice");
    if (choice) {
      chooseSound(choice.dataset.id);
      playSample(soundById.get(choice.dataset.id), "sound", true);
    }
  });
  detail.addEventListener("click", event => {
    const control = event.target.closest("[data-listen]");
    if (control) playSample(soundById.get(control.closest("article").dataset.id), control.dataset.listen, control.dataset.listen === "sound");
  });

  const input = byId("practice-text");
  const output = byId("ipa-output");
  const rate = byId("read-rate");
  const readButton = byId("read-play");
  const status = byId("speech-status");
  const synth = window.speechSynthesis;
  const supportsSpeech = Boolean(synth && window.SpeechSynthesisUtterance);
  const readerPlayer = new Audio();
  const speechCache = new Map();
  let voices = [];
  let voice = null;
  let words = [];
  let currentWord = 0;
  let readingOrigin = null;
  let pausedWord = null;
  let speechMode = "idle";
  let run = 0;
  let utterance = null;
  let readEnd = 0;
  let backend = "device";
  let deviceFailed = false;
  let bundledFailed = false;
  let bundledPending = false;
  let wordwiseUntil = 0;
  let progressFrame = 0;
  let readingSingle = false;
  let audioURL = null;
  let audioUnlocked = false;
  let startTimeout = 0;
  let nextChunkTimer = 0;
  const noVoiceMessage = "英語音声を利用できません。端末に英語（米国）の読み上げ音声を追加し、ブラウザーを開き直してください。";
  const tokenPattern = /[+\-＋－]?(?:[0-9０-９]{1,3}(?:[,，][0-9０-９]{3})+|[0-9０-９]+)(?:[.．][0-9０-９]+)?|(?:\p{Script=Latin}\.){2,}|\p{Script=Latin}[\p{Script=Latin}\p{M}]*(?:['’‘‐‑–-][\p{Script=Latin}\p{M}]+)*/gu;

  function message(text, error = false) {
    status.textContent = text;
    status.classList.toggle("has-error", error);
  }

  function readyMessage() {
    if (window.PhoneticFallback && !bundledFailed) message("同梱の米語音声 · オフライン");
    else if (voice && !deviceFailed) message("端末の音声 · " + voice.name);
    else message(noVoiceMessage, true);
  }

  function refreshVoices() {
    if (supportsSpeech) {
      voices = synth.getVoices();
      const english = voices.filter(candidate => candidate.localService && /^en(?:[-_]|$)/i.test(candidate.lang));
      const rank = candidate => (candidate.localService ? 2 : 0) + (/^en[-_]US/i.test(candidate.lang) ? 1 : 0);
      voice = english.sort((a, b) => rank(b) - rank(a))[0] || null;
    }
    if (speechMode === "idle") readyMessage();
  }

  function syncReaderControls() {
    const playing = speechMode === "playing";
    setIcon(readButton, playing ? "pause" : "play");
    readButton.querySelector("span").textContent = playing ? "一時停止" : speechMode === "paused" ? "続きから再生" : "読み上げる";
    readButton.disabled = !words.length || (!supportsSpeech && !window.PhoneticFallback);
    byId("read-start").disabled = !words.length;
    byId("read-stop").disabled = speechMode === "idle";
    output.classList.toggle("reading", playing);
  }

  function selectWord(index, reveal = false) {
    output.children[currentWord]?.removeAttribute("aria-current");
    currentWord = Math.max(0, Math.min(index, words.length - 1));
    if (words.length) output.children[currentWord]?.setAttribute("aria-current", "true");
    byId("word-position").textContent = words.length ? (currentWord + 1) + " / " + words.length + " 語" : "0 語";
    if (speechMode === "playing" || reveal) {
      const token = output.children[currentWord];
      if (token && output.scrollHeight > output.clientHeight) {
        const box = output.getBoundingClientRect();
        const activeBox = token.getBoundingClientRect();
        if (activeBox.bottom > box.bottom) output.scrollTop += activeBox.bottom - box.bottom + 8;
        if (activeBox.top < box.top) output.scrollTop += activeBox.top - box.top - 8;
      }
    }
  }

  function restoreReadingSelection() {
    if (readingOrigin !== null) selectWord(readingOrigin, true);
    readingOrigin = null;
    pausedWord = null;
  }

  function invalidateSpeech() {
    ++run;
    clearTimeout(startTimeout);
    clearTimeout(nextChunkTimer);
    cancelAnimationFrame(progressFrame);
    bundledPending = false;
    utterance = null;
    readerPlayer.onended = null;
    readerPlayer.onerror = null;
    readerPlayer.onplaying = null;
    readerPlayer.pause();
    readerPlayer.removeAttribute("src");
    readerPlayer.load();
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = null;
    if (supportsSpeech && (synth.speaking || synth.pending || synth.paused || speechMode !== "idle")) {
      synth.cancel();
      if (synth.paused) synth.resume();
    }
    speechMode = "idle";
  }

  function stopReading(rewind, text) {
    invalidateSpeech();
    restoreReadingSelection();
    if (rewind) selectWord(0);
    syncReaderControls();
    message(text);
  }

  function tokenAt(offset) {
    let low = 0;
    let high = words.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (words[mid].end <= offset) low = mid + 1;
      else high = mid;
    }
    return Math.min(low, words.length - 1);
  }

  function transcribe() {
    invalidateSpeech();
    readingOrigin = null;
    pausedWord = null;
    const text = input.value;
    words = Array.from(text.matchAll(tokenPattern), match => ({
      text: match[0], start: match.index, end: match.index + match[0].length
    }));
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const ipa = window.PhoneticDictionary.lookup(word.text, {
        previous: words[index - 1]?.text, next: words[index + 1]?.text
      });
      const token = document.createElement("button");
      token.type = "button";
      token.className = ipa ? "word-token" : "word-token unlisted";
      token.dataset.index = index;
      token.setAttribute("aria-label", word.text + "、" + (ipa ? "/" + ipa + "/" : "辞書未収録") + "。この単語を聴く");
      const en = document.createElement("span");
      en.lang = "en";
      en.className = "token-en";
      en.textContent = word.text;
      const pronunciation = document.createElement("span");
      pronunciation.className = "token-ipa";
      pronunciation.textContent = ipa ? "/" + ipa + "/" : "未収録";
      token.append(en, pronunciation);
      fragment.append(token);
    });
    if (!words.length) {
      const prompt = document.createElement("p");
      prompt.className = "output-prompt";
      prompt.textContent = text.trim() ? "英単語や数字を入力してください。" : "ここに発音記号が表示されます。";
      fragment.append(prompt);
    }
    output.replaceChildren(fragment);
    output.scrollTop = 0;
    selectWord(0);
    syncReaderControls();
    readyMessage();
  }

  function finishedWord(index, id) {
    if (id !== run) return;
    utterance = null;
    if (index + 1 >= readEnd) {
      speechMode = "idle";
      restoreReadingSelection();
      syncReaderControls();
      message(readingSingle ? "単語の再生が終わりました。" : "読み上げが終わりました。");
      return;
    }
    const separator = input.value.slice(words[index].end, words[index + 1].start);
    const pause = /[.!?\n]/.test(separator) ? 220 : /[,;:]/.test(separator) ? 100 : 0;
    if (speechMode === "paused") pausedWord = index + 1;
    else selectWord(index + 1);
    if (speechMode === "playing") nextChunkTimer = setTimeout(() => speakWord(index + 1, id), pause);
  }

  function failedReading(text) {
    invalidateSpeech();
    restoreReadingSelection();
    syncReaderControls();
    message(text, true);
  }

  function bundledAudio(text, timed = false) {
    const key = (timed ? "timed:" : "word:") + text;
    if (!speechCache.has(key)) {
      const method = timed ? "synthesizeTimed" : "synthesize";
      const promise = window.PhoneticFallback[method](text, 1).catch(error => {
        speechCache.delete(key);
        throw error;
      });
      speechCache.set(key, promise);
      if (speechCache.size > 50) speechCache.delete(speechCache.keys().next().value);
    }
    return speechCache.get(key);
  }

  // Unlock this same media element during the click, including on mobile.
  function unlockReaderAudio() {
    if (audioUnlocked) return;
    const bytes = new Uint8Array(204);
    const header = new DataView(bytes.buffer);
    const write = (offset, text) => [...text].forEach((char, i) => header.setUint8(offset + i, char.charCodeAt(0)));
    write(0, "RIFF"); header.setUint32(4, 196, true); write(8, "WAVEfmt ");
    header.setUint32(16, 16, true); header.setUint16(20, 1, true); header.setUint16(22, 1, true);
    header.setUint32(24, 8000, true); header.setUint32(28, 16000, true);
    header.setUint16(32, 2, true); header.setUint16(34, 16, true);
    write(36, "data"); header.setUint32(40, 160, true);
    const silence = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    readerPlayer.src = silence;
    readerPlayer.play().then(() => {
      audioUnlocked = true;
      if (readerPlayer.getAttribute("src") === silence) readerPlayer.pause();
      URL.revokeObjectURL(silence);
    }).catch(() => URL.revokeObjectURL(silence));
  }

  function timedChunkEnd(index) {
    let end = index + 1;
    while (end < readEnd) {
      const separator = input.value.slice(words[end - 1].end, words[end].start);
      if (/[.!?;\n]/.test(separator) || end - index >= 16 || words[end].end - words[index].start > 150) break;
      end++;
    }
    return end;
  }

  function timingMatches(timings, index, end) {
    const clean = text => text.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]/gu, "");
    return Array.isArray(timings) && timings.length === end - index &&
      timings.every((entry, offset) => clean(entry.text) === clean(words[index + offset].text) &&
        Number.isFinite(entry.start) && Number.isFinite(entry.end) && entry.end >= entry.start &&
        (offset === 0 || entry.start >= timings[offset - 1].start));
  }

  async function playReaderBlob(blob, index, end, id, timings) {
    if (id !== run) return;
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(blob);
    readerPlayer.src = audioURL;
    readerPlayer.playbackRate = Number(rate.value);
    function followWords() {
      if (id !== run || speechMode !== "playing") return;
      let offset = 0;
      if (timings) {
        while (offset + 1 < timings.length && readerPlayer.currentTime >= timings[offset + 1].start) offset++;
      }
      if (currentWord !== index + offset) selectWord(index + offset);
      progressFrame = requestAnimationFrame(followWords);
    }
    readerPlayer.onplaying = () => {
      if (id !== run) return;
      selectWord(index);
      cancelAnimationFrame(progressFrame);
      followWords();
      message("読み上げ中 · 同梱の米語音声");
    };
    readerPlayer.onended = () => {
      if (id !== run) return;
      cancelAnimationFrame(progressFrame);
      finishedWord(end - 1, id);
    };
    readerPlayer.onerror = () => {
      if (id === run) failedReading("同梱音声を再生できません。assets フォルダーを確認して開き直してください。");
    };
    if (speechMode === "playing") await readerPlayer.play();
  }

  async function speakBundledWord(index, id) {
    if (!window.PhoneticFallback) {
      failedReading(noVoiceMessage);
      return;
    }
    bundledPending = true;
    try {
      if (window.PhoneticFallback.synthesizeTimed && index + 1 < readEnd && index >= wordwiseUntil) {
        const end = timedChunkEnd(index);
        const endOffset = end < words.length ? words[end].start : input.value.length;
        const text = input.value.slice(words[index].start, endOffset).trimEnd();
        const result = await bundledAudio(text, true);
        if (id !== run) return;
        if (timingMatches(result.words, index, end)) {
          bundledPending = false;
          await playReaderBlob(result.blob, index, end, id, result.words);
          return;
        }
        // Expanded numbers and abbreviations can have extra spoken words.
        wordwiseUntil = end;
      }
      const blob = await bundledAudio(words[index].text);
      if (id !== run) return;
      bundledPending = false;
      await playReaderBlob(blob, index, index + 1, id);
      for (let next = index + 1; next < Math.min(index + 3, readEnd); next++) {
        bundledAudio(words[next].text).catch(() => {});
      }
    } catch (error) {
      if (id !== run) return;
      bundledPending = false;
      if (error.name !== "NotAllowedError" && voice && !deviceFailed) {
        bundledFailed = true;
        backend = "device";
        speakWord(index, id);
        return;
      }
      failedReading(error.name === "NotAllowedError" ? "音声の準備ができました。もう一度「読み上げる」を押してください。" : "音声を作成できません。assets フォルダーを確認して開き直してください。");
    }
  }

  // One utterance per word keeps highlighting exact even when a voice
  // doesn't provide boundary events. The bundled voice is prefetched.
  function speakWord(index, id) {
    if (id !== run || speechMode !== "playing") return;
    if (backend === "bundled") {
      speakBundledWord(index, id);
      return;
    }
    const part = new SpeechSynthesisUtterance(words[index].text);
    utterance = part;
    part.lang = voice?.lang || "en-US";
    if (voice) part.voice = voice;
    part.rate = Number(rate.value);
    const isCurrent = () => id === run && part === utterance;
    function useBundledVoice() {
      if (!isCurrent()) return;
      clearTimeout(startTimeout);
      utterance = null;
      deviceFailed = true;
      backend = "bundled";
      synth.cancel();
      message("同梱の米語音声を準備しています…");
      speakBundledWord(index, id);
    }
    part.onstart = () => {
      if (!isCurrent()) return;
      clearTimeout(startTimeout);
      selectWord(index);
      message("読み上げ中" + (voice ? " · " + voice.name : ""));
    };
    part.onerror = useBundledVoice;
    part.onend = () => {
      if (!isCurrent()) return;
      clearTimeout(startTimeout);
      finishedWord(index, id);
    };
    startTimeout = setTimeout(useBundledVoice, 6000);
    try {
      synth.speak(part);
    } catch {
      useBundledVoice();
    }
  }

  function startReading(index, wordOnly = false, origin = index) {
    if (!words.length) return;
    if (sample) stopSample();
    const replacing = speechMode !== "idle";
    invalidateSpeech();
    readingOrigin = origin;
    pausedWord = null;
    selectWord(index);
    refreshVoices();
    readEnd = wordOnly ? index + 1 : words.length;
    backend = window.PhoneticFallback && !bundledFailed ? "bundled" : voice && !deviceFailed ? "device" : "bundled";
    readingSingle = wordOnly;
    wordwiseUntil = index;
    unlockReaderAudio();
    speechMode = "playing";
    syncReaderControls();
    message("読み上げを開始しています…");
    const id = run;
    if (replacing) nextChunkTimer = setTimeout(() => speakWord(index, id), 45);
    else speakWord(index, id);
  }

  readButton.addEventListener("click", () => {
    if (speechMode === "playing") {
      pausedWord = currentWord;
      speechMode = "paused";
      clearTimeout(startTimeout);
      clearTimeout(nextChunkTimer);
      if (backend === "bundled") readerPlayer.pause();
      else synth.pause();
      if (readingOrigin !== null) selectWord(readingOrigin, true);
      message("一時停止しました。");
      syncReaderControls();
    } else if (speechMode === "paused") {
      speechMode = "playing";
      selectWord(pausedWord ?? currentWord);
      pausedWord = null;
      if (backend === "bundled") {
        if (!bundledPending) {
          if (audioURL && !readerPlayer.ended) readerPlayer.play().catch(() => failedReading("もう一度「読み上げる」を押してください。"));
          else speakWord(currentWord, run);
        }
      } else if (utterance && synth.paused) synth.resume();
      else speakWord(currentWord, run);
      message("読み上げ中" + (voice ? " · " + voice.name : ""));
      syncReaderControls();
    } else {
      startReading(currentWord);
    }
  });
  byId("read-stop").addEventListener("click", () => stopReading(false, "読み上げを停止しました。"));
  byId("read-start").addEventListener("click", () => {
    if (speechMode === "playing") startReading(0);
    else stopReading(true, "先頭から読み上げられます。");
  });
  output.addEventListener("click", event => {
    const token = event.target.closest("button[data-index]");
    if (token) startReading(Number(token.dataset.index), true);
  });
  function chooseCaret() {
    if (!words.length) return;
    const index = tokenAt(input.selectionStart);
    if (index === currentWord && speechMode !== "paused") return;
    if (speechMode === "playing") startReading(index);
    else {
      if (speechMode === "paused") stopReading(false, "開始位置を変更しました。");
      selectWord(index);
    }
  }
  input.addEventListener("click", chooseCaret);
  input.addEventListener("keyup", event => {
    if (/^(Arrow|Home|End|Page)/.test(event.key)) chooseCaret();
  });
  input.addEventListener("select", () => {
    if (input.selectionStart !== input.selectionEnd) chooseCaret();
  });
  input.addEventListener("input", transcribe);
  byId("example-text").addEventListener("click", () => {
    input.value = "Listen to the sound of the rain.";
    input.focus();
    input.setSelectionRange(0, 0);
    transcribe();
  });
  function showRate() {
    const value = Number(rate.value);
    const label = (Number.isInteger(value * 10) ? value.toFixed(1) : value.toFixed(2)) + "×";
    byId("rate-value").textContent = label;
    rate.setAttribute("aria-valuetext", label.replace("×", "倍"));
  }
  rate.addEventListener("input", showRate);
  function applyRate() {
    showRate();
    if (backend === "bundled") readerPlayer.playbackRate = Number(rate.value);
    else if (speechMode !== "idle") {
      const index = pausedWord ?? currentWord;
      const origin = readingOrigin ?? index;
      const paused = speechMode === "paused";
      startReading(index, readingSingle, origin);
      if (paused) readButton.click();
    }
  }
  rate.addEventListener("change", applyRate);
  byId("reset-rate").addEventListener("click", () => {
    rate.value = 1;
    applyRate();
  });
  if (supportsSpeech) synth.addEventListener("voiceschanged", refreshVoices);
  window.addEventListener("pagehide", () => {
    stopSample();
    stopReading(false, "読み上げを停止しました。");
  });

  const navLinks = [...document.querySelectorAll(".nav-link")];
  let navFrame = 0;
  function updateNav() {
    const reading = byId("reader").getBoundingClientRect().top < window.innerHeight * .6;
    for (const link of navLinks) {
      const active = (link.hash === "#reader") === reading;
      link.classList.toggle("is-current", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    navFrame = 0;
  }
  window.addEventListener("scroll", () => {
    if (!navFrame) navFrame = requestAnimationFrame(updateNav);
  }, { passive: true });
  byId("notation-note").textContent = notation;
  updateCategories();
  renderList();
  refreshVoices();
  transcribe();
  showRate();
  updateNav();
})();
