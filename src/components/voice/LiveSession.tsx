import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVoiceStore } from '@/stores/voice-store';

/**
 * @component LiveSession
 * @description Real-time voice session overlay showing streaming transcript,
 *              detected language / code-switch status, and Gs risk readout.
 *              Rendered while a Sahara session is active or under review.
 * @pattern Component Pattern (Presentational)
 */
export function LiveSession() {
  const { transcript, state, languageInfo, gsScore, recordingDuration } =
    useVoiceStore();

  const isActive = state !== 'idle';
  if (!isActive) return null;

  const stateLabel: Record<'listening' | 'understanding' | 'review', string> = {
    listening: 'Listening',
    understanding: 'Understanding',
    review: 'Meaning Ready',
  };

  const stateTone: Record<'listening' | 'understanding' | 'review', 'default' | 'secondary'> = {
    listening: 'default',
    understanding: 'secondary',
    review: 'default',
  };

  const mins = Math.floor(recordingDuration / 60);
  const secs = recordingDuration % 60;

  return (
    <Card className="w-full max-w-xl rounded-3xl border-charcoal/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Live Session</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={stateTone[state]}>{stateLabel[state]}</Badge>
          <span className="font-mono text-xs text-charcoal/50">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-28 rounded-xl border border-charcoal/10 bg-white/60 p-3">
          <p className="text-sm leading-relaxed text-charcoal/80">
            {transcript || 'Waiting for speech…'}
          </p>
        </ScrollArea>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="border-teal/40 text-teal">
            {languageInfo.lang}
            {languageInfo.codeswitch ? ' · code-switched' : ''}
          </Badge>
          {typeof languageInfo.confidence === 'number' && (
            <Badge
              variant="outline"
              className={
                languageInfo.confidence < 0.7
                  ? 'border-amber/40 text-amber'
                  : 'border-charcoal/20 text-charcoal/60'
              }
            >
              conf {(languageInfo.confidence * 100).toFixed(0)}%
            </Badge>
          )}
          {gsScore !== null && (
            <Badge
              variant="outline"
              className={
                gsScore >= 7
                  ? 'border-red/40 text-red'
                  : gsScore >= 3
                    ? 'border-amber/40 text-amber'
                    : 'border-teal/40 text-teal'
              }
            >
              Gs {gsScore.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
