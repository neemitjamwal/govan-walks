import { createSpeechController, type SpeechController, type SpeechState } from '../lib/speech';

export interface Listen {
  setStop(chunks: string[]): void;
  stop(): void;
}

export function setupListen(container: HTMLElement): Listen {
  let chunks: string[] = [];
  const setText = () => container.setAttribute('data-speech-text', chunks.join(' '));

  const supported = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  if (!supported) {
    return {
      setStop(next) {
        chunks = next;
        setText();
      },
      stop() {},
    };
  }

  const controls = container.querySelector<HTMLElement>('.listen-controls')!;
  const note = container.querySelector<HTMLElement>('.listen-note')!;
  const play = container.querySelector<HTMLButtonElement>('#listen-play')!;
  const pause = container.querySelector<HTMLButtonElement>('#listen-pause')!;
  const stopBtn = container.querySelector<HTMLButtonElement>('#listen-stop')!;
  controls.hidden = false;
  note.hidden = true;

  const render = (state: SpeechState) => {
    container.dataset.state = state;
    play.hidden = state !== 'idle';
    pause.hidden = state === 'idle';
    stopBtn.hidden = state === 'idle';
    pause.textContent = state === 'paused' ? 'Resume' : 'Pause';
  };

  const synth = window.speechSynthesis;
  // Chrome can keep speaking a previous page's queue after navigation, or stay paused after it.
  synth.cancel();
  synth.resume();
  // Some browsers only fill the voice list after this event; reading it once warms the list up.
  synth.getVoices();
  synth.addEventListener?.('voiceschanged', () => synth.getVoices());

  const controller: SpeechController = createSpeechController({
    synth,
    createUtterance: (text) => new SpeechSynthesisUtterance(text),
    onChange: render,
  });

  play.addEventListener('click', () => {
    controller.speak(chunks);
    pause.focus();
  });
  pause.addEventListener('click', () => (controller.state === 'paused' ? controller.resume() : controller.pause()));
  stopBtn.addEventListener('click', () => {
    controller.stop();
    play.focus();
  });
  window.addEventListener('pagehide', () => controller.stop());

  render('idle');

  return {
    setStop(next) {
      const hadFocus = container.contains(document.activeElement);
      controller.stop();
      chunks = next;
      setText();
      if (hadFocus) play.focus();
    },
    stop: () => controller.stop(),
  };
}
