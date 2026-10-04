import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/feedback/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/forms/FormField';
import { Select } from '@/components/ui/Select';
import { useCreateAppointment } from '../useAppointments';

export interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  patientName: string;
  patientMrn: string;
  appointmentTime: string;
  durationMinutes: number;
  reason: string;
  room: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { mutate: bookAppointment, isPending } = useCreateAppointment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      patientName: '',
      patientMrn: 'MRN-849204',
      appointmentTime: '2026-10-04T14:00',
      durationMinutes: 30,
      reason: '',
      room: 'Exam Room 3A',
    },
  });

  const onSubmit = (values: FormValues) => {
    bookAppointment(
      {
        patientId: 'pat_temp_01',
        patientName: values.patientName,
        patientMrn: values.patientMrn,
        providerId: 'usr_sarah_jenkins_md',
        appointmentTime: new Date(values.appointmentTime).toISOString(),
        durationMinutes: Number(values.durationMinutes),
        reason: values.reason,
        room: values.room,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Clinical Appointment"
      description="Book an in-person or telehealth patient encounter"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Patient Full Name" required error={errors.patientName?.message}>
          <Input
            placeholder="e.g. Johnathan Doe"
            {...register('patientName', { required: 'Patient name is required' })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="MRN" required>
            <Input {...register('patientMrn')} />
          </FormField>
          <FormField label="Exam Room">
            <Input {...register('room')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Appointment Time" required>
            <Input type="datetime-local" {...register('appointmentTime')} />
          </FormField>
          <FormField label="Duration (Min)">
            <Select
              options={[
                { value: '15', label: '15 minutes (Follow-up)' },
                { value: '30', label: '30 minutes (Standard)' },
                { value: '45', label: '45 minutes (Comprehensive)' },
                { value: '60', label: '60 minutes (Intake / New)' },
              ]}
              {...register('durationMinutes')}
            />
          </FormField>
        </div>

        <FormField label="Chief Complaint / Reason for Encounter" required>
          <Input
            placeholder="e.g., Hypertension follow-up, Routine wellness check"
            {...register('reason', { required: 'Reason is required' })}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            Confirm Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
