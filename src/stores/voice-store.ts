import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @pattern Store Pattern (Zustand)
 * @description Global voice state management for PAL.
 *              Handles recording state, transcript, and language detection.
 */

type VoiceState = 'idle' | 'listening' | 'understanding' | 'review';

/** Explicit type for language info */
interface LanguageInfo {
  lang: string;
  codeswitch: boolean | null;
  detectedLanguages?: string[];
  confidence?: number;
}

interface VoiceStore {
  // State
  state: VoiceState;
  transcript: string;
  languageInfo: LanguageInfo;
  isRecording: boolean;
  recordingDuration: number;
  gsScore: number | null;
  gsBreakdown: Record<string, number> | null;

  // Actions
  setState: (state: VoiceState) => void;
  setTranscript: (transcript: string) => void;
  setLanguageInfo: (info: LanguageInfo) => void;
  resetLanguageInfo: () => void;
  setIsRecording: (recording: boolean) => void;
  incrementDuration: () => void;
  setGsScore: (score: number | null, breakdown?: Record<string, number> | null) => void;
  reset: () => void;
}

/** Default language info */
const DEFAULT_LANGUAGE_INFO: LanguageInfo = {
  lang: '—',
  codeswitch: null,
  detectedLanguages: [],
  confidence: undefined,
};

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      // Initial state
      state: 'idle',
      transcript: '',
      languageInfo: DEFAULT_LANGUAGE_INFO,
      isRecording: false,
      recordingDuration: 0,
      gsScore: null,
      gsBreakdown: null,

      // Actions
      setState: (voiceState) => set({ state: voiceState }),

      setTranscript: (transcript) => set({ transcript }),

      setLanguageInfo: (languageInfo) => set({ languageInfo }),

      /** Reset language info to default */
      resetLanguageInfo: () => set({ languageInfo: DEFAULT_LANGUAGE_INFO }),

      setIsRecording: (isRecording) => set({ isRecording }),

      incrementDuration: () =>
        set((s) => ({ recordingDuration: s.recordingDuration + 1 })),

      setGsScore: (score, breakdown) =>
        set({ gsScore: score, gsBreakdown: breakdown ?? null }),

      reset: () =>
        set({
          state: 'idle',
          transcript: '',
          languageInfo: DEFAULT_LANGUAGE_INFO,
          isRecording: false,
          recordingDuration: 0,
          gsScore: null,
          gsBreakdown: null,
        }),
    }),
    {
      name: 'pal-voice-store',
      partialize: (state) => ({
        // Only persist language preferences, not transient state
        languageInfo: state.languageInfo,
      }),
    }
  )
);
