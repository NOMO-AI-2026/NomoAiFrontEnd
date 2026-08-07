import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SessionScreen, { TEST_FINISH_RECORDING_EVENT } from './SessionScreen';
import type { SessionRuntimeResponse } from '../../api/sessionsApi';
import {
  createMockMediaStream,
  installMediaMocks,
  MockAudio,
  MockMediaRecorder,
} from '../../test-utils/mediaMocks';

vi.mock('../../api/sessionsApi', () => ({
  getSessionRuntimeApi: vi.fn(),
  continueSessionStepApi: vi.fn(),
  fetchSessionSpeechBlobApi: vi.fn(),
  fetchFeedbackSpeechBlobApi: vi.fn(),
  submitSessionAttemptApi: vi.fn(),
}));

import {
  continueSessionStepApi,
  fetchFeedbackSpeechBlobApi,
  fetchSessionSpeechBlobApi,
  getSessionRuntimeApi,
  submitSessionAttemptApi,
} from '../../api/sessionsApi';

async function autoFinishRecording() {
  await act(async () => {
    window.dispatchEvent(new Event(TEST_FINISH_RECORDING_EVENT));
  });
}

function renderSession(sessionId = '123') {
  return render(
    <MemoryRouter initialEntries={[`/session/${sessionId}`]}>
      <Routes>
        <Route path="/session/:sessionId" element={<SessionScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

function baseRuntime(overrides: Partial<SessionRuntimeResponse> = {}): SessionRuntimeResponse {
  return {
    sessionId: 123,
    status: 'inProgress',
    command: 'ready_to_record',
    activityType: 'word',
    currentStep: {
      stepNumber: 1,
      stepType: 'guided_practice',
      spokenText: 'قل: بابا',
      expectsChildResponse: true,
      maximumAttempts: 3,
      attemptNumber: 0,
    },
    ...overrides,
  };
}

let mediaMocks: ReturnType<typeof installMediaMocks>;

beforeEach(() => {
  vi.clearAllMocks();
  mediaMocks = installMediaMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SessionScreen — runtime rendering & avatar state', () => {
  it('auto-opens the microphone when the server already expects a response', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(baseRuntime());
    const { stream } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    renderSession();

    await screen.findByText('قل: بابا');
    await waitFor(() => expect(mediaMocks.getUserMedia).toHaveBeenCalled());
    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));
    expect(screen.queryByRole('button', { name: /إرسال الآن/ })).not.toBeInTheDocument();
    expect(screen.getByText(/هسمعك تلقائيًا/)).toBeInTheDocument();
    expect(screen.getByAltText('أفاتار المساعد')).toHaveAttribute('src', expect.stringContaining('listening'));
  });

  it('shows an error state with a retry button when loading the runtime fails', async () => {
    vi.mocked(getSessionRuntimeApi).mockRejectedValueOnce(new Error('تعذر الاتصال بالخادم'));

    renderSession();

    await screen.findByText('تعذر الاتصال بالخادم');
    expect(screen.getByRole('button', { name: /إعادة المحاولة/ })).toBeInTheDocument();
    expect(screen.getByAltText('أفاتار المساعد')).toHaveAttribute('src', expect.stringContaining('idle'));
  });
});

describe('SessionScreen — authenticated speech playback', () => {
  it('fetches speech as an authenticated blob and auto-listens after playback', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(
      baseRuntime({ command: 'play_avatar_speech' }),
    );
    const speechBlob = new Blob(['fake-audio'], { type: 'audio/mpeg' });
    vi.mocked(fetchSessionSpeechBlobApi).mockResolvedValueOnce(speechBlob);
    const { stream } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    renderSession();

    await waitFor(() => expect(fetchSessionSpeechBlobApi).toHaveBeenCalledWith(123, expect.anything()));
    await waitFor(() => expect(mediaMocks.createObjectURL).toHaveBeenCalledWith(speechBlob));
    await waitFor(() => expect(MockAudio.latest).toBeDefined());
    expect(MockAudio.latest?.paused).toBe(false);

    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));
    expect(screen.getByText(/هسمعك تلقائيًا لما تسكت/)).toBeInTheDocument();
  });

  it('advances to the next step via continueSessionStep when the step does not expect a response', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(
      baseRuntime({
        command: 'play_avatar_speech',
        currentStep: {
          stepNumber: 1,
          stepType: 'introduction',
          spokenText: 'أهلاً بيك',
          expectsChildResponse: false,
          maximumAttempts: 1,
          attemptNumber: 0,
        },
      }),
    );
    vi.mocked(fetchSessionSpeechBlobApi)
      .mockResolvedValueOnce(new Blob(['intro'], { type: 'audio/mpeg' }))
      .mockResolvedValueOnce(new Blob(['step2'], { type: 'audio/mpeg' }));
    vi.mocked(continueSessionStepApi).mockResolvedValueOnce(
      baseRuntime({
        command: 'play_avatar_speech',
        currentStep: {
          stepNumber: 2,
          stepType: 'guided_practice',
          spokenText: 'قل: بابا',
          expectsChildResponse: true,
          maximumAttempts: 3,
          attemptNumber: 0,
        },
      }),
    );
    const { stream } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    renderSession();

    await waitFor(() => expect(MockAudio.instances).toHaveLength(1));
    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await waitFor(() => expect(continueSessionStepApi).toHaveBeenCalledWith(123, expect.anything()));
    await waitFor(() => expect(MockAudio.instances).toHaveLength(2));
    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await screen.findByText('خطوة 2 · تمرين موجّه');
    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));
  });
});

describe('SessionScreen — feedback adaptive actions', () => {
  it('keeps the same step number when feedback adaptiveAction is retry_same', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(baseRuntime());
    vi.mocked(submitSessionAttemptApi).mockResolvedValueOnce(
      baseRuntime({
        command: 'play_feedback',
        feedback: {
          attemptId: 1,
          adaptiveAction: 'retry_same',
          spokenText: 'حاول مرة أخرى',
          audioBase64: btoa('feedback'),
          audioContentType: 'audio/mpeg',
        },
        currentStep: {
          stepNumber: 1,
          stepType: 'guided_practice',
          spokenText: 'قل: بابا',
          expectsChildResponse: true,
          maximumAttempts: 3,
          attemptNumber: 1,
        },
      }),
    );

    const { stream } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    renderSession();
    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));

    await act(async () => {
      await autoFinishRecording();
    });

    await waitFor(() => expect(submitSessionAttemptApi).toHaveBeenCalled());
    expect(fetchFeedbackSpeechBlobApi).not.toHaveBeenCalled();
    await waitFor(() => expect(MockAudio.latest).toBeDefined());

    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await screen.findByText('خطوة 1 · تمرين موجّه');
    expect(screen.getByText('المحاولة 2 من 3')).toBeInTheDocument();
    expect(continueSessionStepApi).not.toHaveBeenCalled();
  });

  it('loads the next step when feedback adaptiveAction is advance', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(baseRuntime());
    vi.mocked(submitSessionAttemptApi).mockResolvedValueOnce(
      baseRuntime({
        command: 'play_feedback',
        feedback: {
          attemptId: 2,
          adaptiveAction: 'advance',
          spokenText: 'أحسنت!',
          audioBase64: btoa('feedback'),
          audioContentType: 'audio/mpeg',
        },
        currentStep: {
          stepNumber: 1,
          stepType: 'guided_practice',
          spokenText: 'قل: بابا',
          expectsChildResponse: false,
          maximumAttempts: 3,
          attemptNumber: 1,
        },
      }),
    );
    vi.mocked(continueSessionStepApi).mockResolvedValueOnce(
      baseRuntime({
        command: 'play_avatar_speech',
        speechAudioBase64: btoa('step2'),
        speechAudioContentType: 'audio/mpeg',
        currentStep: {
          stepNumber: 2,
          stepType: 'guided_practice',
          spokenText: 'قل: ماما',
          expectsChildResponse: true,
          maximumAttempts: 3,
          attemptNumber: 0,
        },
      }),
    );

    const { stream } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    renderSession();
    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));

    await act(async () => {
      await autoFinishRecording();
    });

    expect(fetchFeedbackSpeechBlobApi).not.toHaveBeenCalled();
    await waitFor(() => expect(MockAudio.instances).toHaveLength(1));

    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await waitFor(() => expect(continueSessionStepApi).toHaveBeenCalledWith(123, expect.anything()));
    expect(fetchSessionSpeechBlobApi).not.toHaveBeenCalled();
    await waitFor(() => expect(MockAudio.instances).toHaveLength(2));

    await act(async () => {
      MockAudio.latest?.onended?.();
    });

    await screen.findByText('خطوة 2 · تمرين موجّه');
  });
});

describe('SessionScreen — MediaRecorder lifecycle & cleanup', () => {
  it('shows an error when microphone permission is denied on auto-listen', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(baseRuntime());
    mediaMocks.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    renderSession();

    await screen.findByText('Permission denied');
    expect(screen.getByRole('button', { name: /إعادة المحاولة/ })).toBeInTheDocument();
    expect(MockMediaRecorder.instances).toHaveLength(0);
  });

  it('stops microphone tracks when the component unmounts mid-recording', async () => {
    vi.mocked(getSessionRuntimeApi).mockResolvedValueOnce(baseRuntime());
    const { stream, stopTrack } = createMockMediaStream();
    mediaMocks.getUserMedia.mockResolvedValue(stream);

    const { unmount } = renderSession();
    await waitFor(() => expect(MockMediaRecorder.latest?.state).toBe('recording'));

    unmount();

    expect(stopTrack).toHaveBeenCalled();
  });
});
