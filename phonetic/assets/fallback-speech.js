(() => {
  "use strict";

  const voiceURL = new URL("english-voice.js", document.currentScript.src);
  let session;

  // This function is also the worker's renderer. Keep dependencies inside its arguments.
  function createRenderer(createVoice) {
    const voice = createVoice();

    function collectWords(sentence, model, stream, speechStart) {
      const { words } = voice.tokenize(sentence, model.manifest.vocab);
      const tokenTimes = [];
      const secondsPerStep = model.config.subframes / voice.FRAME_RATE;
      for (const [index, part] of stream.sentences.entries()) {
        let position = speechStart + part.frameStart / voice.FRAME_RATE;
        for (const [token, duration] of part.durations.entries()) {
          const end = position + duration * secondsPerStep;
          // The engine inserts another beginning-of-sentence token for each later part.
          if (index === 0 || token !== 0) tokenTimes.push({ start: position, end });
          position = end;
        }
      }
      return words.map(word => ({
        text: word.text,
        start: tokenTimes[word.start].start,
        end: tokenTimes[word.end - 1].end
      }));
    }

    function trimSilence(samples, sampleRate, words) {
      let first = 0;
      let end = samples.length;
      const threshold = 0.00055;
      while (first < end && Math.abs(samples[first]) < threshold) first++;
      while (end > first && Math.abs(samples[end - 1]) < threshold) end--;
      if (first === end) throw new Error("発音できる英単語がありません。");
      first = Math.max(0, first - Math.round(sampleRate * 0.014));
      end = Math.min(samples.length, end + Math.round(sampleRate * 0.025));
      // Keep the consonant transitions, while removing the quiet synthetic noise before and after a word.
      if (words.length) {
        first = Math.max(first, Math.floor((words[0].start - 0.035) * sampleRate));
        end = Math.min(end, Math.ceil((words[words.length - 1].end + 0.06) * sampleRate));
      }
      const clip = samples.subarray(first, end);
      const fade = Math.min(Math.round(0.003 * sampleRate), Math.floor(clip.length / 2));
      for (let i = 0; i < fade; i++) {
        clip[i] *= i / fade;
        clip[clip.length - 1 - i] *= i / fade;
      }
      return { samples: clip, offset: first / sampleRate };
    }

    return async function render(text, rate) {
      const model = await voice.load();
      const { speaker, transforms } = voice.voiceSettings(model, "female");
      const sampleRate = voice.defaultSampleRate;
      const words = [];
      const blocks = [];
      let sampleCount = 0;
      for (const entry of voice.splitSentences(text)) {
        const sentence = voice.speechText(entry.text);
        const frames = voice.streamFrames(model, sentence, { speaker, rate: 1 / rate });
        const pause = !sampleCount ? 0 : entry.paragraphStart ? voice.paragraphPause : voice.sentencePause;
        const speechStart = (sampleCount + Math.round(sampleRate * pause / rate)) / sampleRate;
        const renderer = voice.createSentenceRenderer({
          eq: frames.eq, rate, pause, seed: 1000 + entry.index, sampleRate,
          onBlock(block) {
            blocks.push(block);
            sampleCount += block.length;
          }
        });
        for (const chunk of frames.chunks) renderer.push(voice.applyTransforms(chunk, transforms));
        renderer.end();
        words.push(...collectWords(sentence, model, frames, speechStart));
      }
      const trimmed = trimSilence(voice.concatBlocks(blocks), sampleRate, words);
      const duration = trimmed.samples.length / sampleRate;
      const relative = time => Math.max(0, Math.min(duration, time - trimmed.offset));
      return {
        bytes: voice.encodeWav(trimmed.samples, sampleRate),
        words: words.map(word => ({
          text: word.text,
          start: relative(word.start),
          end: relative(word.end)
        }))
      };
    };
  }

  function startWorker(createVoice, makeRenderer) {
    const render = makeRenderer(createVoice);
    self.onmessage = async ({ data }) => {
      try {
        const { bytes, words } = await render(data.text, data.rate);
        self.postMessage({ id: data.id, bytes, words }, [bytes.buffer]);
      } catch (error) {
        self.postMessage({ id: data.id, error: error.message });
      }
    };
  }

  async function openSession() {
    if (!window.createPhoneticVoice) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = voiceURL.href;
        script.onload = resolve;
        script.onerror = () => {
          script.remove();
          reject(new Error("同梱の英語音声を読み込めませんでした。"));
        };
        document.head.append(script);
      });
    }
    const factory = window.createPhoneticVoice;
    if (typeof factory !== "function") throw new Error("英語音声を初期化できませんでした。");
    if (typeof Worker === "undefined") return createRenderer(factory);

    // A Blob worker can use the bundled model even when the page is opened from disk.
    const source = "(" + startWorker + ")(" + factory + "," + createRenderer + ");";
    const workerURL = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    let worker;
    try {
      worker = new Worker(workerURL);
    } catch {
      return createRenderer(factory);
    } finally {
      URL.revokeObjectURL(workerURL);
    }
    const pending = new Map();
    let sequence = 0;
    worker.onmessage = ({ data }) => {
      const job = pending.get(data.id);
      if (!job) return;
      pending.delete(data.id);
      if (data.error) job.reject(new Error(data.error));
      else job.resolve(data);
    };
    worker.onerror = event => {
      const error = new Error(event.message || "英語音声の生成に失敗しました。");
      for (const job of pending.values()) job.reject(error);
      pending.clear();
      worker.terminate();
      session = undefined;
    };
    return (text, rate) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, text, rate });
    });
  }

  async function synthesizeTimed(text, rate = 1) {
    if (typeof text !== "string" || !text.trim()) throw new Error("英文を入力してください。");
    if (!session) {
      session = openSession().catch(error => {
        session = undefined;
        throw error;
      });
    }
    const render = await session;
    const speed = Number(rate);
    const { bytes, words } = await render(text, Number.isFinite(speed) ? Math.min(2, Math.max(0.5, speed)) : 1);
    return { blob: new Blob([bytes], { type: "audio/wav" }), words };
  }

  window.PhoneticFallback = Object.freeze({
    synthesizeTimed,
    async synthesize(text, rate) {
      return (await synthesizeTimed(text, rate)).blob;
    }
  });
})();
