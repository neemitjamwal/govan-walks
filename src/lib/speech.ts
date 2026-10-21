export interface SpeakableStop {
  name: string;
  tagline: string;
  story: string[];
}

export type SpeechState = 'idle' | 'speaking' | 'paused';

const endsSentence = (s: string) => /[.!?…]["'”’)]*$/.test(s.trim());
const sentence = (s: string) => (endsSentence(s) ? s.trim() : `${s.trim()}.`);

/** Heading (name and tagline) first, then one chunk per story paragraph. */
export function speechChunks(stop: SpeakableStop): string[] {
  return [`${sentence(stop.name)} ${sentence(stop.tagline)}`, ...stop.story.map((p) => p.trim())];
}

export function buildSpeechText(stop: SpeakableStop): string {
  return speechChunks(stop).join(' ');
}

export interface VoiceLike {
  lang: string;
  name: string;
}

const langOf = (v: VoiceLike) => v.lang.replace('_', '-').toLowerCase();

export function pickVoice<V extends VoiceLike>(voices: readonly V[]): V | null {
  return voices.find((v) => langOf(v) === 'en-gb') ?? voices.find((v) => langOf(v).startsWith('en')) ?? null;
}

export interface UtteranceLike {
  lang: string;
  voice: unknown;
  // Parameters typed as never so the DOM's SpeechSynthesisUtterance (with its richer event types) fits.
  onend: ((ev: never) => void) | null;
  onerror: ((ev: never) => void) | null;
}

export interface SynthLike<U extends UtteranceLike = UtteranceLike> {
  speak(u: U): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): VoiceLike[];
}

export interface SpeechController {
  readonly state: SpeechState;
  speak(chunks: string[]): void;
  pause(): void;
  resume(): void;
  stop(): void;
}

export function createSpeechController<U extends UtteranceLike>(options: {
  synth: SynthLike<U>;
  createUtterance: (text: string) => U;
  onChange?: (state: SpeechState) => void;
}): SpeechController {
  const { synth, createUtterance, onChange } = options;
  let state: SpeechState = 'idle';
  // Bumped on every speak/stop so end and error events from cancelled utterances are ignored.
  let generation = 0;

  // Chromium's cancel() leaves the engine paused, so new utterances would queue silently; resume() clears that.
  const cancel = () => {
    synth.cancel();
    synth.resume();
  };

  const set = (next: SpeechState) => {
    if (next === state) return;
    state = next;
    onChange?.(state);
  };

  return {
    get state() {
      return state;
    },
    speak(chunks) {
      const run = ++generation;
      cancel();
      if (chunks.length === 0) return set('idle');
      const voice = pickVoice(synth.getVoices());
      set('speaking');
      chunks.forEach((text, i) => {
        const u = createUtterance(text);
        u.lang = 'en-GB';
        if (voice) u.voice = voice;
        u.onend = () => {
          if (run === generation && i === chunks.length - 1) set('idle');
        };
        u.onerror = (ev) => {
          const { error } = ev as unknown as { error?: string };
          if (run !== generation || error === 'interrupted' || error === 'canceled') return;
          generation++;
          cancel();
          set('idle');
        };
        synth.speak(u);
      });
    },
    pause() {
      if (state !== 'speaking') return;
      synth.pause();
      set('paused');
    },
    resume() {
      if (state !== 'paused') return;
      synth.resume();
      set('speaking');
    },
    stop() {
      generation++;
      if (state === 'idle') return;
      cancel();
      set('idle');
    },
  };
}
