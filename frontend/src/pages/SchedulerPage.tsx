import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { AppointmentList } from '@/features/scheduler/components/AppointmentList';
import { useAppointments } from '@/features/scheduler/useAppointments';
import { BookAppointmentModal } from '@/features/scheduler/components/BookAppointmentModal';

export const SchedulerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const { data: appointments = [], isLoading } = useAppointments('today');

  return (
    <PageContainer
      title="Clinical Scheduler & Encounters"
      description="Manage exam room assignments, provider time-blocks, and appointment check-ins."
      actions={
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsBookModalOpen(true)}
        >
          Book Appointment
        </Button>
      }
    >
      <div className="space-y-6">
        <AppointmentList
          appointments={appointments}
          isLoading={isLoading}
          onSelectAppointment={(apt) => navigate(`/patients/${apt.patientId}`)}
        />
      </div>

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </PageContainer>
  );
};
