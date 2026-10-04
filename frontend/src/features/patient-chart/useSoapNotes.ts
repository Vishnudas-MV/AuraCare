import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chartService } from './chart.service';
import { queryKeys } from '@/lib/tanstack-query';
import type { CreateSoapNoteInput, PatientChartData } from './chart.types';
import type { SoapNoteDto } from '@/types';
import { toast } from 'sonner';

/**
 * Hook to retrieve full patient chart data including vitals and SOAP history.
 */
export function usePatientChart(patientId: string) {
  return useQuery({
    queryKey: queryKeys.charts.byPatient(patientId),
    queryFn: () => chartService.getPatientChart(patientId),
    enabled: Boolean(patientId),
  });
}

/**
 * Hook to create a SOAP note with TanStack Query v5 optimistic updates.
 */
export function useCreateSoapNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSoapNoteInput) => chartService.createSoapNote(input),

    // Optimistic Update
    onMutate: async (newNoteInput: CreateSoapNoteInput) => {
      // 1. Cancel ongoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.charts.byPatient(patientId),
      });

      // 2. Snapshot current state for rollback
      const previousChart = queryClient.getQueryData<PatientChartData>(
        queryKeys.charts.byPatient(patientId)
      );

      // 3. Optimistically insert temporary note into cache
      if (previousChart) {
        const optimisticNote: SoapNoteDto = {
          id: `temp_${Date.now()}`,
          tenantId: previousChart.patient.tenantId,
          encounterId: newNoteInput.encounterId,
          patientId,
          providerId: 'usr_current',
          status: 'PENDING',
          subjective: newNoteInput.subjective,
          objective: newNoteInput.objective,
          assessment: newNoteInput.assessment,
          plan: newNoteInput.plan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<PatientChartData>(
          queryKeys.charts.byPatient(patientId),
          {
            ...previousChart,
            soapNotes: [optimisticNote, ...previousChart.soapNotes],
          }
        );
      }

      return { previousChart };
    },

    onError: (_err, _newNote, context) => {
      // Rollback on error
      if (context?.previousChart) {
        queryClient.setQueryData(
          queryKeys.charts.byPatient(patientId),
          context.previousChart
        );
      }
      toast.error('Failed to save SOAP note to chart');
    },

    onSuccess: (savedNote) => {
      toast.success('SOAP note recorded in chart successfully');
      // Invalidate to synchronize server ID & timestamps
      queryClient.setQueryData<PatientChartData>(
        queryKeys.charts.byPatient(patientId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            soapNotes: old.soapNotes.map((note) =>
              note.id.startsWith('temp_') ? savedNote : note
            ),
          };
        }
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.charts.byPatient(patientId),
      });
    },
  });
}

/**
 * Hook to sign a completed SOAP note.
 */
export function useSignSoapNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => chartService.signSoapNote(noteId),
    onSuccess: () => {
      toast.success('SOAP note signed and locked');
      queryClient.invalidateQueries({
        queryKey: queryKeys.charts.byPatient(patientId),
      });
    },
    onError: () => {
      toast.error('Failed to sign clinical note');
    },
  });
}
