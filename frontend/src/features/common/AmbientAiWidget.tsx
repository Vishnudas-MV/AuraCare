import React, { useState } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';

export const AmbientAiWidget: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info('Ambient Clinical Scribe activated. Listening securely.');
      setTranscript([
        'Clinician: "Good morning Eleanor, how has the shortness of breath been?"',
        'Patient: "Much better doctor, only when I jog outside in the morning cold."',
      ]);
    } else {
      setIsRecording(false);
      toast.success('Ambient recording paused. Transcript saved.');
    }
  };

  return (
    <Card className="w-full bg-surface border-line">
      <CardHeader className="py-3 px-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <CardTitle className="text-sm font-semibold">Gemini Ambient Clinical Intelligence</CardTitle>
        </div>
        <Badge variant={isRecording ? 'brand' : 'outline'} size="sm" dot>
          {isRecording ? 'Listening' : 'Standby'}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={isRecording ? 'danger' : 'primary'}
            size="sm"
            onClick={toggleRecording}
            leftIcon={isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          >
            {isRecording ? 'Stop Ambient Scribe' : 'Start Ambient Scribe'}
          </Button>

          {isRecording && (
            <div className="flex items-center gap-1">
              <span className="w-1 bg-accent rounded-full animate-wave-bar" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 bg-accent rounded-full animate-wave-bar" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 bg-accent rounded-full animate-wave-bar" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 bg-accent rounded-full animate-wave-bar" style={{ animationDelay: '0.4s' }} />
              <span className="text-[11px] text-accent font-medium ml-1">Real-Time Audio Stream</span>
            </div>
          )}
        </div>

        <p className="text-xs text-ink-muted">
          Continuous background transcription automatically synthesizes structured SOAP clinical records.
        </p>
      </CardContent>

      {isRecording && transcript.length > 0 && (
        <div className="px-5 pb-4 pt-1 space-y-1 text-xs text-ink-muted border-t border-line/60 bg-surface-subtle/40">
          <p className="font-semibold text-ink text-[11px] uppercase tracking-wider mb-1">Live Dialogue Stream</p>
          {transcript.map((line, i) => (
            <p key={i} className="italic">{line}</p>
          ))}
        </div>
      )}
    </Card>
  );
};
