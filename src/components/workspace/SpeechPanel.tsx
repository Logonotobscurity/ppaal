import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVoiceStore } from '@/stores/voice-store';

/**
 * @component SpeechPanel
 * @description Displays live transcript and voice session metadata
 * @pattern Component Pattern (Presentational)
 */
export function SpeechPanel() {
  const { transcript, state, isRecording, recordingDuration, languageInfo } = useVoiceStore();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-teal-500/20 text-teal-700 border-teal-500/30';
      case 'understanding':
        return 'bg-violet-500/20 text-violet-700 border-violet-500/30';
      case 'review':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      default:
        return 'bg-charcoal-50 text-charcoal-700 border-charcoal-500/30';
    }
  };

  return (
    <Card className="border-2 rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Speech</CardTitle>
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30 animate-pulse">
                ● Recording
              </Badge>
            )}
            <Badge variant="outline" className={getStateColor()}>
              {state.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Live Transcript */}
          <div className="min-h-[120px] p-4 bg-ivory/50 rounded-xl border border-charcoal/10">
            <ScrollArea className="h-[120px]">
              <p className="text-charcoal leading-relaxed">
                {transcript || (
                  <span className="text-charcoal/40 italic">
                    {isRecording ? 'Listening...' : 'Press microphone to start speaking'}
                  </span>
                )}
              </p>
            </ScrollArea>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-charcoal/60">
            <div className="flex items-center gap-4">
              <span>Duration: {formatDuration(recordingDuration)}</span>
              <span>Language: {languageInfo.lang}</span>
            </div>
            {languageInfo.codeswitch !== null && (
              <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                Code-switch detected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpeechPanel;
