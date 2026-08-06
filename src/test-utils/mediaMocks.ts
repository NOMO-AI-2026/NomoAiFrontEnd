import { vi } from 'vitest';

/** Minimal HTMLAudioElement stand-in that lets tests trigger `onended` / `onerror` manually. */
export class MockAudio {
  static instances: MockAudio[] = [];

  src: string;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;

  constructor(src?: string) {
    this.src = src ?? '';
    MockAudio.instances.push(this);
  }

  play(): Promise<void> {
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }

  static reset(): void {
    MockAudio.instances = [];
  }

  static get latest(): MockAudio | undefined {
    return MockAudio.instances[MockAudio.instances.length - 1];
  }
}

export interface MockDataAvailableEvent {
  data: Blob;
}

/** Minimal MediaRecorder stand-in with manual start/stop control for tests. */
export class MockMediaRecorder {
  static instances: MockMediaRecorder[] = [];

  stream: MediaStream;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: MockDataAvailableEvent) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(stream: MediaStream) {
    this.stream = stream;
    MockMediaRecorder.instances.push(this);
  }

  start(_timeslice?: number): void {
    this.state = 'recording';
  }

  static isTypeSupported(_type: string): boolean {
    return true;
  }

  stop(): void {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['chunk'], { type: this.mimeType }) });
    this.onstop?.();
  }

  static reset(): void {
    MockMediaRecorder.instances = [];
  }

  static get latest(): MockMediaRecorder | undefined {
    return MockMediaRecorder.instances[MockMediaRecorder.instances.length - 1];
  }
}

export function createMockMediaStream() {
  const stopTrack = vi.fn();
  const track = { stop: stopTrack, kind: 'audio' } as unknown as MediaStreamTrack;
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  return { stream, stopTrack };
}

export function installMediaMocks() {
  MockAudio.reset();
  MockMediaRecorder.reset();

  vi.stubGlobal('Audio', MockAudio as unknown as typeof Audio);
  vi.stubGlobal('MediaRecorder', MockMediaRecorder as unknown as typeof MediaRecorder);

  const createObjectURL = vi.fn(() => 'blob:mock-url');
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL,
    revokeObjectURL,
  });

  const getUserMedia = vi.fn();
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });

  // Minimal AudioContext so energy VAD does not crash in jsdom.
  class MockAudioContext {
    state = 'running';
    createMediaStreamSource() {
      return { connect: vi.fn(), disconnect: vi.fn() };
    }
    createAnalyser() {
      return {
        fftSize: 2048,
        getByteTimeDomainData: (data: Uint8Array) => {
          data.fill(128);
        },
      };
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
  }
  vi.stubGlobal('AudioContext', MockAudioContext);

  return { createObjectURL, revokeObjectURL, getUserMedia };
}
