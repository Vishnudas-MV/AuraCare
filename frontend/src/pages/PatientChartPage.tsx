import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { ChartSkeleton } from '@/components/feedback/Skeleton';
import { usePatientChart } from '@/features/patient-chart/useSoapNotes';
import { PatientDemographicsCard } from '@/features/patient-chart/components/PatientDemographicsCard';
import { VitalsSummary } from '@/features/patient-chart/components/VitalsSummary';
import { SoapNoteEditor } from '@/features/patient-chart/components/SoapNoteEditor';
import { AmbientAiWidget } from '@/features/common/AmbientAiWidget';

export const PatientChartPage: React.FC = () => {
  const { id = 'pat_01j7x8k9m0' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: chartData, isLoading, error } = usePatientChart(id);

  if (isLoading) {
    return (
      <PageContainer title="Clinical Electronic Health Record">
        <ChartSkeleton />
      </PageContainer>
    );
  }

  if (error || !chartData) {
    return (
      <PageContainer title="Error Loading Chart">
        <div className="p-8 text-center bg-surface border border-line rounded-xl">
          <p className="text-danger font-medium text-sm">
            Unable to load clinical record for patient ID: {id}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/patients')}
          >
            Back to Patients
          </Button>
        </div>
      </PageContainer>
    );
  }

  const activeSoapNote =
    chartData.soapNotes.length > 0 ? chartData.soapNotes[0] : undefined;

  return (
    <PageContainer
      title={`${chartData.patient.lastName}, ${chartData.patient.firstName}`}
      description={`Medical Record No: ${chartData.patient.mrn} • Authorized Clinical Encounter`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/patients')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Directory
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Print Chart
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Encrypted Demographics Card */}
        <PatientDemographicsCard patient={chartData.patient} />

        {/* 2. Real-Time Vitals Summary */}
        <VitalsSummary vitals={chartData.recentVitals} />

        {/* 3. Ambient Scribe Intelligence */}
        <AmbientAiWidget />

        {/* 4. SOAP Note 4-Quadrant Clinical Documentation */}
        <SoapNoteEditor
          patientId={chartData.patient.id}
          encounterId="enc_3301"
          activeNote={activeSoapNote}
        />
      </div>
    </PageContainer>
  );
};
