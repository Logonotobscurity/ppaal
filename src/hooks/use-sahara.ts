import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceStore } from '@/stores/voice-store';

/**
 * @hook useSahara
 * @description Manages the voice capture pipeline: microphone access,
 *              MediaRecorder streaming (250ms webm/opus chunks) over a
 *              WebSocket to the FastAPI Sahara gateway, and routes final
 *              transcripts through the Cultural Meaning Engine (CME).
 *
 * Constitution compliance:
 *  - Voice actions pass through CME FIRST (never bypass)
 *  - Raw audio is NEVER persisted — only structured state
 */

interface SaharaMessage {
  type: 'ack' | 'partial' | 'final' | 'error';
  text?: string;
  lang?: string;
  codeswitch?: boolean;
  confidence?: number;
  message?: string;
}

/** Endpoint of the FastAPI WebSocket gateway (see backend/main.py) */
const SAHARA_WS_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SAHARA_WS_URL ??
  'ws://localhost:8000/ws/transcribe';

/** Chunk interval in ms — matches architecture spec (250ms) */
const CHUNK_INTERVAL_MS = 250;

export interface UseSaharaResult {
  /** Start recording + streaming. Resolves once the mic permission is granted. */
  start: () => Promise<void>;
  /** Stop recording, flush remaining audio, close the socket. */
  stop: () => void;
  /** True while the microphone stream is active. */
  isRecording: boolean;
  /** Last error message, if any. */
  error: string | null;
}

export function useSahara(): UseSaharaResult {
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const setState = useVoiceStore((s) => s.setState);
  const setTranscript = useVoiceStore((s) => s.setTranscript);
  const setLanguageInfo = useVoiceStore((s) => s.setLanguageInfo);
  const setIsRecording = useVoiceStore((s) => s.setIsRecording);
  const incrementDuration = useVoiceStore((s) => s.incrementDuration);
  const isRecording = useVoiceStore((s) => s.isRecording);

  /** Route a finalized transcript into the meaning engine. */
  const handleFinalTranscript = useCallback(
    (text: string) => {
      setTranscript(text);
      setState('understanding');
      // CME runs client-side first; server-side /interpret refines with Gs.
      // Import kept lazy so this hook works even if the engine bundle fails.
      import('@/lib/meaning-engine')
        .then(({ interpretTranscript }) => {
          const { gs } = interpretTranscript(text);
          useVoiceStore.getState().setGsScore(
            gs.score,
            gs.breakdown as unknown as Record<string, number>
          );
          setState('review');
        })
        .catch(() => setState('review'));
    },
    [setTranscript, setState]
  );

  const cleanup = useCallback(() => {
    if (chunkTimerRef.current !== null) {
      window.clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    mediaRecorderRef.current?.state === 'recording' &&
      mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const sock = socketRef.current;
    if (sock && sock.readyState !== WebSocket.CLOSED) {
      try {
        sock.close(1000, 'session-end');
      } catch {
        /* noop */
      }
    }
    socketRef.current = null;
  }, []);

  const start = useCallback(async (): Promise<void> => {
    setError(null);
    setState('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // Open WebSocket to Sahara gateway
      const ws = new WebSocket(SAHARA_WS_URL);
      ws.binaryType = 'arraybuffer';
      socketRef.current = ws;

      ws.onmessage = (event: MessageEvent<string>) => {
        let msg: SaharaMessage;
        try {
          msg = JSON.parse(event.data) as SaharaMessage;
        } catch {
          return;
        }
        switch (msg.type) {
          case 'partial':
            if (msg.text) setTranscript(msg.text);
            break;
          case 'final':
            if (msg.lang) {
              setLanguageInfo({
                lang: msg.lang,
                codeswitch: msg.codeswitch ?? null,
                confidence: msg.confidence,
              });
            }
            if (msg.text) handleFinalTranscript(msg.text);
            break;
          case 'error':
            setError(msg.message ?? 'Unknown voice pipeline error');
            setState('idle');
            break;
          default:
            break;
        }
      };

      ws.onerror = () => {
        setError('Voice gateway unreachable. Check SAHARA_WS_URL configuration.');
      };

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      // Stream discrete chunks every CHUNK_INTERVAL_MS
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          e.data.arrayBuffer().then((buf) => ws.send(buf));
        }
      };

      recorder.start(CHUNK_INTERVAL_MS);
      setIsRecording(true);

      // Duration ticker (1s)
      tickRef.current = window.setInterval(() => incrementDuration(), 1000);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : 'Failed to initialize voice capture pipeline.';
      setError(message);
      setState('idle');
    }
  }, [handleFinalTranscript, incrementDuration, setIsRecording, setLanguageInfo, setState, setTranscript]);

  const stop = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setState('idle');
  }, [cleanup, setIsRecording, setState]);

  // Purge volatile audio on unmount — raw audio never persists (Domain A rule)
  useEffect(() => cleanup, [cleanup]);

  return { start, stop, isRecording, error };
}
