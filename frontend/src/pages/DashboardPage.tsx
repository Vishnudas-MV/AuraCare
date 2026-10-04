import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AppointmentList } from '@/features/scheduler/components/AppointmentList';
import { useAppointments } from '@/features/scheduler/useAppointments';
import { BookAppointmentModal } from '@/features/scheduler/components/BookAppointmentModal';
import { AmbientAiWidget } from '@/features/common/AmbientAiWidget';
import { HipaaComplianceBadge } from '@/features/common/HipaaComplianceBadge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const { data: appointments = [], isLoading } = useAppointments();

  return (
    <PageContainer
      title="Clinical Command Center"
      description="Welcome back, Dr. Jenkins. Here is your practice overview for today."
      actions={
        <div className="flex items-center gap-3">
          <HipaaComplianceBadge />
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsBookModalOpen(true)}
          >
            Schedule Encounter
          </Button>
        </div>
      }
    >
      {/* Top Clinical Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Encounters Today</p>
            <h3 className="text-2xl font-bold text-ink mt-1">12</h3>
            <p className="text-[11px] text-brand font-medium mt-1 flex items-center">
              4 completed <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Pending SOAP Notes</p>
            <h3 className="text-2xl font-bold text-warning mt-1">3</h3>
            <p className="text-[11px] text-ink-muted mt-1">Require physician sign-off</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Active In-Exam</p>
            <h3 className="text-2xl font-bold text-ink mt-1">1</h3>
            <p className="text-[11px] text-success font-medium mt-1">Exam Room 3B: E. Vance</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Total Panel Patients</p>
            <h3 className="text-2xl font-bold text-ink mt-1">842</h3>
            <p className="text-[11px] text-ink-muted mt-1">+14 new this month</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Ambient AI Banner */}
      <div className="mb-6">
        <AmbientAiWidget />
      </div>

      {/* Main Dual Columns: Daily Schedule & Fast Patient Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentList
            appointments={appointments}
            isLoading={isLoading}
            onSelectAppointment={(apt) => navigate(`/patients/${apt.patientId}`)}
          />
        </div>

        {/* Quick Actions & Recent Patient Charts */}
        <div className="space-y-6">
          <Card className="bg-surface border-line">
            <CardHeader className="p-5">
              <CardTitle className="text-sm font-semibold">Priority Clinical Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div
                onClick={() => navigate('/patients/pat_01j7x8k9m0')}
                className="p-3 rounded-lg border border-line bg-surface-subtle/50 hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Sign SOAP: Eleanor Vance</span>
                  <Badge variant="warning" size="sm">Pending Sign</Badge>
                </div>
                <p className="text-[11px] text-ink-muted mt-1">Asthma follow-up note ready for digital signature</p>
              </div>

              <div
                onClick={() => navigate('/patients/pat_01j7x8k9m0')}
                className="p-3 rounded-lg border border-line bg-surface-subtle/50 hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Lab Review: Marcus Holloway</span>
                  <Badge variant="brand" size="sm">New Results</Badge>
                </div>
                <p className="text-[11px] text-ink-muted mt-1">Comprehensive Metabolic Panel received 30m ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </PageContainer>
  );
};
