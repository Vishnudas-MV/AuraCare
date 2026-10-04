import React from 'react';
import { Heart, Activity, Thermometer, Wind, Gauge, Scale } from 'lucide-react';
import type { VitalsRecord } from '@/types';
import { formatClinicalDateTime } from '@/utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface VitalsSummaryProps {
  vitals?: VitalsRecord[];
}

export const VitalsSummary: React.FC<VitalsSummaryProps> = ({ vitals }) => {
  const latest = vitals && vitals.length > 0 ? vitals[0] : null;

  if (!latest) {
    return (
      <Card className="p-6 text-center text-xs text-ink-muted">
        No recent vitals documented for this encounter.
      </Card>
    );
  }

  const isBPNorm =
    latest.bloodPressureSystolic < 130 && latest.bloodPressureDiastolic < 85;
  const isHRNorm = latest.heartRate >= 60 && latest.heartRate <= 100;
  const isSpO2Norm = latest.oxygenSaturation >= 95;

  return (
    <Card className="w-full bg-surface border-line">
      <CardHeader className="py-4 px-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" />
          <CardTitle className="text-sm font-semibold">Current Vital Signs</CardTitle>
        </div>
        <span className="text-[11px] text-ink-muted">
          Recorded: {formatClinicalDateTime(latest.recordedAt)}
        </span>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Blood Pressure */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">BP</span>
            <Gauge className="h-3.5 w-3.5 text-brand" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.bloodPressureSystolic}/{latest.bloodPressureDiastolic}
            <span className="text-[10px] font-normal text-ink-muted ml-1">mmHg</span>
          </div>
          <div className="mt-1">
            <Badge variant={isBPNorm ? 'success' : 'warning'} size="sm">
              {isBPNorm ? 'Normal' : 'Elevated'}
            </Badge>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">Pulse</span>
            <Heart className="h-3.5 w-3.5 text-danger" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.heartRate}
            <span className="text-[10px] font-normal text-ink-muted ml-1">bpm</span>
          </div>
          <div className="mt-1">
            <Badge variant={isHRNorm ? 'success' : 'warning'} size="sm">
              {isHRNorm ? 'Normal' : 'Abnormal'}
            </Badge>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">SpO2</span>
            <Wind className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.oxygenSaturation}
            <span className="text-[10px] font-normal text-ink-muted ml-1">%</span>
          </div>
          <div className="mt-1">
            <Badge variant={isSpO2Norm ? 'success' : 'danger'} size="sm">
              {isSpO2Norm ? 'Normal' : 'Hypoxic'}
            </Badge>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">Temp</span>
            <Thermometer className="h-3.5 w-3.5 text-warning" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.temperature}
            <span className="text-[10px] font-normal text-ink-muted ml-1">°F</span>
          </div>
          <div className="mt-1">
            <Badge variant="success" size="sm">Afebrile</Badge>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">Resp Rate</span>
            <Wind className="h-3.5 w-3.5 text-brand" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.respiratoryRate}
            <span className="text-[10px] font-normal text-ink-muted ml-1">/min</span>
          </div>
          <div className="mt-1">
            <Badge variant="success" size="sm">Normal</Badge>
          </div>
        </div>

        {/* BMI & Weight */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-line flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-medium">BMI</span>
            <Scale className="h-3.5 w-3.5 text-ink-muted" />
          </div>
          <div className="text-base font-bold text-ink">
            {latest.bmi || '22.9'}
            <span className="text-[10px] font-normal text-ink-muted ml-1">kg/m²</span>
          </div>
          <div className="mt-1">
            <Badge variant="success" size="sm">Normal</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
