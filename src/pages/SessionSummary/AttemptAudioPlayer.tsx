import { useEffect, useState } from 'react';
import { fetchAttemptAudioBlobApi } from '../../api/sessionsApi';
import styles from './SessionSummary.module.css';

type Props = {
  sessionId: number | string;
  attemptId: number;
  label: string;
};

const AttemptAudioPlayer = ({ sessionId, attemptId, label }: Props) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await fetchAttemptAudioBlobApi(sessionId, attemptId);
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      } catch {
        if (!cancelled) {
          setError('تعذر تحميل صوت المحاولة.');
          setObjectUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [sessionId, attemptId]);

  return (
    <div className={styles.attemptAudio}>
      <p className={styles.attemptAudioLabel}>{label}</p>
      {loading && <p className={styles.attemptAudioHint}>جاري تحميل الصوت...</p>}
      {error && <p className={styles.attemptAudioError}>{error}</p>}
      {objectUrl && (
        <audio className={styles.attemptAudioPlayer} controls preload="metadata" src={objectUrl}>
          متصفحك لا يدعم تشغيل الصوت.
        </audio>
      )}
    </div>
  );
};

export default AttemptAudioPlayer;
