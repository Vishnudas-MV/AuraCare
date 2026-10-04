import React from 'react';
import { Clock, DoorOpen } from 'lucide-react';
import type { AppointmentDto } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export interface AppointmentListProps {
  appointments: AppointmentDto[];
  isLoading?: boolean;
  onSelectAppointment?: (apt: AppointmentDto) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading,
  onSelectAppointment,
}) => {
  const getStatusBadgeVariant = (status: AppointmentDto['status']) => {
    switch (status) {
      case 'IN_EXAM':
        return 'brand';
      case 'CHECKED_IN':
        return 'success';
      case 'SCHEDULED':
        return 'default';
      case 'COMPLETED':
        return 'outline';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Card className="w-full bg-surface border-line">
      <CardHeader className="p-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand" />
          <CardTitle className="text-base font-bold">Today's Patient Encounters</CardTitle>
        </div>
        <Badge variant="brand" size="sm">
          {appointments.length} Scheduled
        </Badge>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-line">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-ink-muted">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-muted">No appointments booked for this time block.</div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => onSelectAppointment && onSelectAppointment(apt)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle/80 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-subtle border border-line flex items-center justify-center text-ink shrink-0 font-semibold text-xs">
                  {apt.appointmentTime ? apt.appointmentTime.split('T')[1].substring(0, 5) : '09:00'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ink">{apt.patientName}</span>
                    <span className="text-xs text-ink-muted font-mono">({apt.patientMrn})</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">{apt.reason}</p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-muted mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {apt.durationMinutes} min
                    </span>
                    {apt.room && (
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-3 w-3 text-brand" /> {apt.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <Badge variant={getStatusBadgeVariant(apt.status)} size="md">
                  {apt.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
