import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useSahara } from '@/hooks/use-sahara';
import { useVoiceStore } from '@/stores/voice-store';

/**
 * @component CommandOrb
 * @description Central voice activation orb — the primary "Instant-On"
 *              interaction for PAL. Pulsing violet ring while listening,
 *              teal when meaning is validated, amber on uncertainty.
 * @pattern Component Pattern (Interactive Control)
 */
export function CommandOrb() {
  const { start, stop, error } = useSahara();
  const state = useVoiceStore((s) => s.state);
  const isRecording = useVoiceStore((s) => s.isRecording);

  const handleToggle = () => {
    if (isRecording) {
      stop();
    } else {
      void start();
    }
  };

  const ringColor =
    state === 'listening'
      ? 'border-violet'
      : state === 'understanding'
        ? 'border-amber'
        : state === 'review'
          ? 'border-teal'
          : 'border-charcoal/20';

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        onClick={handleToggle}
        aria-label={isRecording ? 'Stop voice session' : 'Start voice session'}
        className={`relative grid h-28 w-28 place-items-center rounded-full border-2 ${ringColor} bg-white shadow-sm transition-colors`}
        animate={
          isRecording
            ? { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 1.4 } }
            : { scale: 1 }
        }
        whileTap={{ scale: 0.95 }}
      >
        {isRecording ? (
          <Mic className="h-10 w-10 text-violet" aria-hidden />
        ) : (
          <MicOff className="h-10 w-10 text-charcoal/40" aria-hidden />
        )}
        {isRecording && (
          <motion.span
            className={`absolute inset-[-8px] rounded-full border ${ringColor}`}
            animate={{ opacity: [0.7, 0.1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            aria-hidden
          />
        )}
      </motion.button>

      <p className="text-sm text-charcoal/60" role="status" aria-live="polite">
        {error
          ? error
          : isRecording
            ? 'Listening… speak in English, Pidgin, Yorùbá, Igbo or Hausa'
            : 'Tap to speak'}
      </p>
    </div>
  );
}
