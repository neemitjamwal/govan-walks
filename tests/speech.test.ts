import { describe, expect, it, vi } from 'vitest';
import { buildSpeechText, createSpeechController, pickVoice, speechChunks, type SpeechState } from '../src/lib/speech';
import { getStop } from '../src/data/stops';

const stop = {
  name: 'Water Row',
  tagline: 'Where Govan began',
  story: ['First paragraph.', 'Second paragraph.'],
};

class FakeUtterance {
  lang = '';
  voice: unknown = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(public text: string) {}
}

function fakeSynth(voices: { lang: string; name: string }[] = []) {
  const queue: FakeUtterance[] = [];
  return {
    queue,
    speak: vi.fn((u: FakeUtterance) => queue.push(u)),
    cancel: vi.fn(() => queue.splice(0)),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => voices,
  };
}

function setup(voices: { lang: string; name: string }[] = []) {
  const synth = fakeSynth(voices);
  const states: SpeechState[] = [];
  const controller = createSpeechController({
    synth,
    createUtterance: (text) => new FakeUtterance(text),
    onChange: (s) => states.push(s),
  });
  return { synth, states, controller };
}

describe('buildSpeechText', () => {
  it('is name, tagline, then the story paragraphs in order', () => {
    expect(buildSpeechText(stop)).toBe('Water Row. Where Govan began. First paragraph. Second paragraph.');
  });

  it('does not double up punctuation the tagline already has', () => {
    expect(buildSpeechText({ ...stop, tagline: 'Where Govan began!' })).toBe(
      'Water Row. Where Govan began! First paragraph. Second paragraph.',
    );
  });

  it('starts with the stop name and contains the first story paragraph for real stops', () => {
    const real = getStop('govan-old-church')!;
    const text = buildSpeechText(real);
    expect(text.startsWith(real.name)).toBe(true);
    expect(text).toContain(real.story[0]);
    expect(text).toContain(real.story[real.story.length - 1]);
  });

  it('chunks are the heading then one per paragraph and join back to the full text', () => {
    const chunks = speechChunks(stop);
    expect(chunks).toEqual(['Water Row. Where Govan began.', 'First paragraph.', 'Second paragraph.']);
    expect(chunks.join(' ')).toBe(buildSpeechText(stop));
  });
});

describe('pickVoice', () => {
  it('prefers en-GB, then any English, else none', () => {
    const gb = { lang: 'en-GB', name: 'UK' };
    const us = { lang: 'en-US', name: 'US' };
    const fr = { lang: 'fr-FR', name: 'FR' };
    expect(pickVoice([us, fr, gb])).toBe(gb);
    expect(pickVoice([{ lang: 'en_GB', name: 'Android UK' }])?.name).toBe('Android UK');
    expect(pickVoice([fr, us])).toBe(us);
    expect(pickVoice([fr])).toBeNull();
    expect(pickVoice([])).toBeNull();
  });
});

describe('speech controller', () => {
  it('speak queues every chunk in en-GB and goes to speaking', () => {
    const { synth, states, controller } = setup([{ lang: 'en-GB', name: 'UK' }]);
    controller.speak(['a', 'b']);
    expect(controller.state).toBe('speaking');
    expect(states).toEqual(['speaking']);
    expect(synth.queue.map((u) => u.text)).toEqual(['a', 'b']);
    expect(synth.queue.every((u) => u.lang === 'en-GB')).toBe(true);
    expect((synth.queue[0].voice as { name: string }).name).toBe('UK');
  });

  it('cancels anything already queued before speaking', () => {
    const { synth, controller } = setup();
    controller.speak(['a']);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });

  it('pause, resume and stop move between states', () => {
    const { synth, controller } = setup();
    controller.speak(['a']);
    controller.pause();
    expect(controller.state).toBe('paused');
    expect(synth.pause).toHaveBeenCalled();
    controller.resume();
    expect(controller.state).toBe('speaking');
    expect(synth.resume).toHaveBeenCalled();
    controller.stop();
    expect(controller.state).toBe('idle');
    expect(synth.cancel).toHaveBeenCalledTimes(2);
  });

  it('pause and resume do nothing from the wrong state', () => {
    const { synth, controller } = setup();
    controller.pause();
    controller.resume();
    expect(controller.state).toBe('idle');
    expect(synth.pause).not.toHaveBeenCalled();
    expect(synth.resume).not.toHaveBeenCalled();
  });

  it('returns to idle when the last chunk ends, not earlier', () => {
    const { synth, controller } = setup();
    controller.speak(['a', 'b']);
    const [first, last] = synth.queue;
    first.onend?.();
    expect(controller.state).toBe('speaking');
    last.onend?.();
    expect(controller.state).toBe('idle');
  });

  it('ignores end events from speech that was stopped or replaced', () => {
    const { synth, controller } = setup();
    controller.speak(['old']);
    const old = synth.queue[0];
    controller.speak(['new']);
    old.onend?.();
    old.onerror?.({ error: 'interrupted' });
    expect(controller.state).toBe('speaking');
  });

  it('a real speech error returns to idle', () => {
    const { synth, controller } = setup();
    controller.speak(['a', 'b']);
    synth.queue[0].onerror?.({ error: 'synthesis-failed' });
    expect(controller.state).toBe('idle');
  });

  it('stop while idle does not report a change', () => {
    const { states, controller } = setup();
    controller.stop();
    expect(controller.state).toBe('idle');
    expect(states).toEqual([]);
  });
});
