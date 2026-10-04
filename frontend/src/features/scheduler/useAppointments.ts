import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulerService } from './scheduler.service';
import { queryKeys } from '@/lib/tanstack-query';
import type { CreateAppointmentInput } from './scheduler.types';
import { toast } from 'sonner';

export function useAppointments(dateFilter: string = 'today') {
  return useQuery({
    queryKey: queryKeys.scheduler.appointments(dateFilter),
    queryFn: () => schedulerService.getTodayAppointments(),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => schedulerService.createAppointment(input),
    onSuccess: (data) => {
      toast.success(`Appointment booked for ${data.patientName}`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduler.all,
      });
    },
    onError: () => {
      toast.error('Failed to schedule appointment');
    },
  });
}
