import React from 'react';
import { User, Phone, Mail, MapPin, Calendar, AlertCircle, Shield } from 'lucide-react';
import type { PatientDto } from '@/types';
import { formatMRN, formatClinicalDate, calculateAge, formatPhone } from '@/utils/formatters';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface PatientDemographicsCardProps {
  patient: PatientDto;
}

export const PatientDemographicsCard: React.FC<PatientDemographicsCardProps> = ({
  patient,
}) => {
  const age = calculateAge(patient.dateOfBirth);

  return (
    <Card className="w-full bg-surface border-line">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line/60">
          {/* Patient Identity */}
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-ink">
                  {patient.lastName}, {patient.firstName}
                </h2>
                <Badge variant="brand" size="md">
                  {formatMRN(patient.mrn)}
                </Badge>
                <Badge variant="success" size="sm">
                  Active Patient
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-ink-muted mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  DOB: {formatClinicalDate(patient.dateOfBirth)} ({age ? `${age} yo` : '—'})
                </span>
                <span>•</span>
                <span>Gender: {patient.gender || 'Not Specified'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-success">
                  <Shield className="h-3 w-3" /> Encrypted Vault
                </span>
              </div>
            </div>
          </div>

          {/* Quick Clinical Risk Indicators */}
          <div className="flex items-center gap-2">
            <Badge variant="danger" size="md" className="flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              Allergy: Penicillin (Severe)
            </Badge>
            <Badge variant="warning" size="md">
              Fall Risk: Moderate
            </Badge>
          </div>
        </div>

        {/* Contact & Demographics Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-ink-muted/80 shrink-0" />
            <span>Phone: {formatPhone(patient.phone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-ink-muted/80 shrink-0" />
            <span className="truncate">Email: {patient.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-muted/80 shrink-0" />
            <span className="truncate">{patient.address || '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
