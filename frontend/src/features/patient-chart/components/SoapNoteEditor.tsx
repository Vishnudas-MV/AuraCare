import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FileText,
  Sparkles,
  Lock,
  Save,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { soapNoteSchema, type SoapNoteFormValues } from '../chart.schemas';
import { useCreateSoapNote, useSignSoapNote } from '../useSoapNotes';
import type { SoapNoteDto } from '@/types';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export interface SoapNoteEditorProps {
  patientId: string;
  encounterId?: string;
  activeNote?: SoapNoteDto;
}

export const SoapNoteEditor: React.FC<SoapNoteEditorProps> = ({
  patientId,
  encounterId = 'enc_active_01',
  activeNote,
}) => {
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const { mutate: createNote, isPending: isSaving } = useCreateSoapNote(patientId);
  const { mutate: signNote, isPending: isSigning } = useSignSoapNote(patientId);

  const isLocked = activeNote?.status === 'SIGNED';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SoapNoteFormValues>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: {
      subjective:
        activeNote?.subjective ||
        'Patient presents with a 3-day history of intermittent dry cough and mild fatigue. Denies fever, chest pain, or dyspnea.',
      objective:
        activeNote?.objective ||
        'Alert and oriented x3. HEENT normal. Chest auscultation: clear bilaterally without wheezing or rhonchi. Heart sounds regular S1/S2.',
      assessment:
        activeNote?.assessment ||
        '1. Acute upper respiratory infection, viral etiology suspected.\n2. Chronic hypertension, well managed.',
      plan:
        activeNote?.plan ||
        '1. Supportive care: oral hydration, OTC acetaminophen PRN for headache/body aches.\n2. Continue Lisinopril 10mg daily.\n3. Return if fever >101°F develops or symptoms worsen over next 5 days.',
    },
  });

  const onSubmit = (values: SoapNoteFormValues) => {
    createNote({
      patientId,
      encounterId,
      ...values,
    });
  };

  const handleAiAmbientSummarize = () => {
    setIsAiGenerating(true);
    toast.info('Gemini Ambient Scribe analyzing clinician-patient dialogue...');

    setTimeout(() => {
      setValue(
        'subjective',
        '42yo female returns for medication check. Reports adherence to daily inhaler with zero acute episodes in past month. Mild seasonal allergic rhinitis noted.'
      );
      setValue(
        'objective',
        'BP 118/78, Pulse 72 regular, RR 16, SpO2 99% on room air. Turbinates slightly boggy, no sinus tenderness. Clear breath sounds.'
      );
      setValue(
        'assessment',
        '1. Mild allergic rhinitis with controlled baseline reactive airway disease.'
      );
      setValue(
        'plan',
        '1. Add Fluticasone nasal spray 1 spray each nostril daily.\n2. Refill Albuterol inhaler for PRN use.'
      );
      setIsAiGenerating(false);
      toast.success('AI Ambient clinical summary populated into SOAP quadrants');
    }, 1200);
  };

  return (
    <Card className="w-full bg-surface border-line shadow-xs">
      {/* SOAP Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">SOAP Clinical Note</CardTitle>
              <Badge
                variant={activeNote?.status === 'SIGNED' ? 'success' : 'warning'}
                size="sm"
                dot
              >
                {activeNote?.status || 'DRAFT'}
              </Badge>
            </div>
            <p className="text-xs text-ink-muted">Encounter ID: {encounterId}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiAmbientSummarize}
            isLoading={isAiGenerating}
            disabled={isLocked}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-accent" />}
          >
            Ambient Scribe Draft
          </Button>

          {activeNote?.id && !isLocked && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => signNote(activeNote.id)}
              isLoading={isSigning}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
            >
              Sign & Lock Note
            </Button>
          )}
        </div>
      </CardHeader>

      {/* SOAP Note 4-Quadrant Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-5 space-y-5">
          {/* Subjective Section */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-brand text-brand-foreground text-xs font-bold flex items-center justify-center">
                  S
                </span>
                <span className="text-sm font-semibold text-ink">Subjective</span>
              </div>
              <span className="text-[11px] text-ink-muted">Chief Complaint, HPI, Review of Systems</span>
            </div>
            <FormField error={errors.subjective?.message}>
              <Textarea
                id="subjective"
                rows={3}
                disabled={isLocked}
                placeholder="Document patient's history, current symptoms, duration..."
                {...register('subjective')}
              />
            </FormField>
          </div>

          {/* Objective Section */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-accent text-white text-xs font-bold flex items-center justify-center">
                  O
                </span>
                <span className="text-sm font-semibold text-ink">Objective</span>
              </div>
              <span className="text-[11px] text-ink-muted">Physical Exam, Diagnostics, Clinical Data</span>
            </div>
            <FormField error={errors.objective?.message}>
              <Textarea
                id="objective"
                rows={3}
                disabled={isLocked}
                placeholder="Document physical examination findings, observations..."
                {...register('objective')}
              />
            </FormField>
          </div>

          {/* Assessment Section */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-warning text-white text-xs font-bold flex items-center justify-center">
                  A
                </span>
                <span className="text-sm font-semibold text-ink">Assessment</span>
              </div>
              <span className="text-[11px] text-ink-muted">Clinical Diagnoses & Differential</span>
            </div>
            <FormField error={errors.assessment?.message}>
              <Textarea
                id="assessment"
                rows={3}
                disabled={isLocked}
                placeholder="Document clinical diagnosis, status of chronic conditions..."
                {...register('assessment')}
              />
            </FormField>
          </div>

          {/* Plan Section */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-success text-white text-xs font-bold flex items-center justify-center">
                  P
                </span>
                <span className="text-sm font-semibold text-ink">Plan</span>
              </div>
              <span className="text-[11px] text-ink-muted">Orders, Prescriptions, Follow-up</span>
            </div>
            <FormField error={errors.plan?.message}>
              <Textarea
                id="plan"
                rows={3}
                disabled={isLocked}
                placeholder="Document treatment course, medications, instructions..."
                {...register('plan')}
              />
            </FormField>
          </div>
        </CardContent>

        {/* Action Footer */}
        <CardFooter className="flex items-center justify-between p-5 bg-surface-subtle/50">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            {isLocked ? (
              <span className="flex items-center gap-1.5 text-success font-medium">
                <CheckCircle2 className="h-4 w-4" /> Signed by Dr. Sarah Jenkins (Locked)
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-ink-muted" /> Auto-saved locally
              </span>
            )}
          </div>

          {!isLocked && (
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save SOAP Note
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};
