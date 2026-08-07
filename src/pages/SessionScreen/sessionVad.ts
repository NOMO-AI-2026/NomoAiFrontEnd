/**
 * Lightweight energy-based VAD for therapy turns.
 * Tuned for children who need longer reaction time and quiet pauses.
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
  /** Ignore mic energy for this many ms (speaker echo / settle). */
  startupGraceMs?: number;
  /** Consecutive loud polls required before treating as real speech. */
  speechOnsetPolls?: number;
  /** Poll interval for analyser samples. */
  pollMs?: number;
  onSpeechStart?: () => void;
  onSilenceEnd: () => void;
};

const DEFAULTS = {
  speechThreshold: 0.028,
  silenceThreshold: 0.014,
  // After real speech, a therapist answers quickly — not after a long dead pause.
  silenceDurationMs: 2000,
  minRecordMs: 1200,
  startupGraceMs: 700,
  speechOnsetPolls: 4,
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
 * the child speaks then pauses long enough for a therapy turn.
 */
export function startEnergyVad(stream: MediaStream, options: VadOptions): VadController {
  const speechThreshold = options.speechThreshold ?? DEFAULTS.speechThreshold;
  const silenceThreshold = options.silenceThreshold ?? DEFAULTS.silenceThreshold;
  const silenceDurationMs = options.silenceDurationMs ?? DEFAULTS.silenceDurationMs;
  const minRecordMs = options.minRecordMs ?? DEFAULTS.minRecordMs;
  const startupGraceMs = options.startupGraceMs ?? DEFAULTS.startupGraceMs;
  const speechOnsetPolls = options.speechOnsetPolls ?? DEFAULTS.speechOnsetPolls;
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
  let consecutiveSpeechPolls = 0;
  let silenceStartedAt: number | null = null;
  let stopped = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const tick = () => {
    if (stopped) return;
    analyser.getByteTimeDomainData(data);
    const level = rmsFromTimeDomain(data);
    const elapsed = performance.now() - startedAt;

    // Give the child (and room acoustics) time before arming auto-stop.
    if (elapsed < startupGraceMs) {
      return;
    }

    if (level >= speechThreshold) {
      consecutiveSpeechPolls += 1;
      if (!heardSpeech && consecutiveSpeechPolls >= speechOnsetPolls) {
        heardSpeech = true;
        options.onSpeechStart?.();
      }
      silenceStartedAt = null;
      return;
    }

    consecutiveSpeechPolls = 0;

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

/**
 * Trailing silence after the child finishes speaking.
 * Short enough to feel like a live therapist, long enough for child pauses.
 */
export function getSilenceDurationMs(activityType?: string | null): number {
  switch (activityType) {
    case 'sentence':
      return 2500;
    case 'conversation':
      return 3200;
    default:
      return 2000;
  }
}
