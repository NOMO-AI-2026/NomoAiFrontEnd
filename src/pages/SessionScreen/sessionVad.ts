/**
 * Lightweight energy-based VAD for therapy turns.
 * Detects speech onset then end-of-utterance silence — no extra npm deps.
 */

export type VadController = {
  stop: () => void;
};

export type VadOptions = {
  /** Require this much speech energy before silence can end the turn. */
  speechThreshold?: number;
  /** RMS must stay below this to count as silence. */
  silenceThreshold?: number;
  /** Continuous silence (ms) after speech before end-of-turn. */
  silenceDurationMs?: number;
  /** Ignore silence until this many ms of recording have elapsed. */
  minRecordMs?: number;
  /** Poll interval for analyser samples. */
  pollMs?: number;
  onSpeechStart?: () => void;
  onSilenceEnd: () => void;
};

const DEFAULTS = {
  speechThreshold: 0.02,
  silenceThreshold: 0.012,
  silenceDurationMs: 1100,
  minRecordMs: 600,
  pollMs: 50,
} as const;

function rmsFromTimeDomain(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i += 1) {
    const centered = (data[i]! - 128) / 128;
    sum += centered * centered;
  }
  return Math.sqrt(sum / data.length);
}

/**
 * Attach an AnalyserNode to a MediaStream and invoke `onSilenceEnd` after
 * the child speaks then pauses.
 */
export function startEnergyVad(stream: MediaStream, options: VadOptions): VadController {
  const speechThreshold = options.speechThreshold ?? DEFAULTS.speechThreshold;
  const silenceThreshold = options.silenceThreshold ?? DEFAULTS.silenceThreshold;
  const silenceDurationMs = options.silenceDurationMs ?? DEFAULTS.silenceDurationMs;
  const minRecordMs = options.minRecordMs ?? DEFAULTS.minRecordMs;
  const pollMs = options.pollMs ?? DEFAULTS.pollMs;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const context = new AudioCtx();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const data = new Uint8Array(analyser.fftSize);
  const startedAt = performance.now();
  let heardSpeech = false;
  let silenceStartedAt: number | null = null;
  let stopped = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    if (stopped) return;
    analyser.getByteTimeDomainData(data);
    const level = rmsFromTimeDomain(data);
    const elapsed = performance.now() - startedAt;

    if (level >= speechThreshold) {
      if (!heardSpeech) {
        heardSpeech = true;
        options.onSpeechStart?.();
      }
      silenceStartedAt = null;
      return;
    }

    if (!heardSpeech || elapsed < minRecordMs) {
      return;
    }

    if (level < silenceThreshold) {
      if (silenceStartedAt == null) {
        silenceStartedAt = performance.now();
      } else if (performance.now() - silenceStartedAt >= silenceDurationMs) {
        stop();
        options.onSilenceEnd();
      }
    } else {
      silenceStartedAt = null;
    }
  };

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (intervalId != null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    try {
      source.disconnect();
    } catch {
      // already disconnected
    }
    void context.close().catch(() => undefined);
  };

  void context.resume().catch(() => undefined);
  intervalId = setInterval(tick, pollMs);

  return { stop };
}

/** Longer silence window for sentence / conversation activities. */
export function getSilenceDurationMs(activityType?: string | null): number {
  switch (activityType) {
    case 'sentence':
      return 1400;
    case 'conversation':
      return 1600;
    default:
      return 1100;
  }
}
