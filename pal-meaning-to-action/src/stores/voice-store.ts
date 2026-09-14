/**
 * Voice Store (Zustand)
 * 
 * Manages voice session state including:
 * - Recording status
 * - Transcript accumulation
 * - Language detection
 * - Gs score tracking
 */

import { create } from 'zustand';
import type { VoiceSession } from '../types/database';

export type VoiceMode = 'ASK' | 'LEARN' | 'DO';

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'failed';

interface VoiceState {
  // Current session
  currentSession: VoiceSession | null;
  
  // Recording state
  status: RecordingStatus;
  mode: VoiceMode;
  transcript: string;
  partialTranscript: string;
  
  // Audio metadata
  languageDetected: string | null;
  isListening: boolean;
  audioChunks: Blob[];
  
  // Gs Gate results
  gsScore: number | null;
  gsBreakdown: Record<string, number> | null;
  
  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  setTranscript: (transcript: string) => void;
  appendPartialTranscript: (text: string) => void;
  clearPartialTranscript: () => void;
  setLanguageDetected: (language: string | null) => void;
  setGsScore: (score: number, breakdown?: Record<string, number>) => void;
  setCurrentSession: (session: VoiceSession | null) => void;
  reset: () => void;
  addAudioChunk: (chunk: Blob) => void;
  clearAudioChunks: () => void;
  
  // Computed
  canExecute: () => boolean;
  requiresApproval: () => boolean;
}

/**
 * Voice store for managing speech-to-action pipeline
 * 
 * @example
 * ```typescript
 * const { startRecording, transcript, gsScore } = useVoiceStore();
 * ```
 */
export const useVoiceStore = create<VoiceState>((set, get) => ({
  currentSession: null,
  status: 'idle',
  mode: 'ASK',
  transcript: '',
  partialTranscript: '',
  languageDetected: null,
  isListening: false,
  audioChunks: [],
  gsScore: null,
  gsBreakdown: null,

  startRecording: () => {
    set({
      status: 'recording',
      isListening: true,
      transcript: '',
      partialTranscript: '',
      gsScore: null,
      gsBreakdown: null,
      audioChunks: [],
    });
  },

  stopRecording: () => {
    set({
      status: 'processing',
      isListening: false,
    });
  },

  setTranscript: (transcript) => set({ transcript }),

  appendPartialTranscript: (text) => {
    set((state) => ({
      partialTranscript: state.partialTranscript + text,
    }));
  },

  clearPartialTranscript: () => set({ partialTranscript: '' }),

  setLanguageDetected: (language) => set({ languageDetected: language }),

  setGsScore: (score, breakdown?: Record<string, number> | null) => {
    set({
      gsScore: score,
      gsBreakdown: breakdown ?? null,
    });
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  reset: () => {
    set({
      currentSession: null,
      status: 'idle',
      mode: 'ASK',
      transcript: '',
      partialTranscript: '',
      languageDetected: null,
      isListening: false,
      audioChunks: [],
      gsScore: null,
      gsBreakdown: null,
    });
  },

  addAudioChunk: (chunk) => {
    set((state) => ({
      audioChunks: [...state.audioChunks, chunk],
    }));
  },

  clearAudioChunks: () => set({ audioChunks: [] }),

  /**
   * Check if action can be executed
   * DO mode with Gs < 3.0 can execute automatically
   */
  canExecute: () => {
    const { mode, gsScore, status } = get();
    return (
      status === 'completed' &&
      mode === 'DO' &&
      gsScore !== null &&
      gsScore < 3.0
    );
  },

  /**
   * Check if approval is required
   * DO mode with Gs >= 3.0 requires human approval
   */
  requiresApproval: () => {
    const { mode, gsScore } = get();
    return mode === 'DO' && gsScore !== null && gsScore >= 3.0;
  },
}));

/**
 * Selectors for common voice operations
 */
export const voiceSelectors = {
  selectIsRecording: (state: VoiceState) => state.status === 'recording',
  selectIsProcessing: (state: VoiceState) => state.status === 'processing',
  selectHasTranscript: (state: VoiceState) => state.transcript.length > 0,
  selectGsRiskLevel: (state: VoiceState): 'low' | 'medium' | 'high' | 'blocked' => {
    const score = state.gsScore;
    if (score === null) return 'low';
    if (score < 3.0) return 'low';
    if (score < 5.0) return 'medium';
    if (score < 7.0) return 'high';
    return 'blocked';
  },
};

/**
 * Mode descriptions for UI display
 */
export const MODE_DESCRIPTIONS: Record<VoiceMode, { icon: string; label: string; description: string }> = {
  ASK: {
    icon: '🔍',
    label: 'Ask',
    description: 'Read from memory — cited answers, bypasses Gs gate',
  },
  LEARN: {
    icon: '🧠',
    label: 'Learn',
    description: 'Write to memory — unblockable, always succeeds',
  },
  DO: {
    icon: '⚡',
    label: 'Do',
    description: 'Execute actions — gated by Gs score + approval',
  },
};
