import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { UserPlus, Search, Shield } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { DataTable } from '@/components/data/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { PatientDto } from '@/types';
import { formatMRN, formatClinicalDate, calculateAge, formatPhone } from '@/utils/formatters';

const MOCK_PATIENTS: PatientDto[] = [
  {
    id: 'pat_01j7x8k9m0',
    tenantId: 'tenant_auracare_general',
    mrn: 'MRN-849204',
    firstName: 'Eleanor',
    lastName: 'Vance',
    dateOfBirth: '1984-06-14',
    gender: 'Female',
    email: 'e.vance@example.org',
    phone: '5550192834',
    address: '742 Evergreen Terrace, Seattle, WA',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'pat_02k9y1m2n3',
    tenantId: 'tenant_auracare_general',
    mrn: 'MRN-102948',
    firstName: 'Marcus',
    lastName: 'Holloway',
    dateOfBirth: '1992-11-20',
    gender: 'Male',
    email: 'm.holloway@example.org',
    phone: '5550183921',
    address: '1088 Mission St, San Francisco, CA',
    createdAt: '2025-03-22T09:30:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'pat_03l4z5o6p7',
    tenantId: 'tenant_auracare_general',
    mrn: 'MRN-554912',
    firstName: 'Amara',
    lastName: 'Chen',
    dateOfBirth: '1976-03-05',
    gender: 'Female',
    email: 'a.chen@example.org',
    phone: '5550174829',
    address: '450 West 33rd St, New York, NY',
    createdAt: '2025-02-10T11:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'pat_04m8q9r0s1',
    tenantId: 'tenant_auracare_general',
    mrn: 'MRN-339102',
    firstName: 'David',
    lastName: 'Miller',
    dateOfBirth: '1961-08-19',
    gender: 'Male',
    email: 'd.miller@example.org',
    phone: '5550165738',
    address: '221B Baker Street, Boston, MA',
    createdAt: '2025-04-01T14:15:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
];

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.mrn.toLowerCase().includes(term)
    );
  });

  const columns: ColumnDef<PatientDto>[] = [
    {
      accessorKey: 'mrn',
      header: 'MRN',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-brand">
          {formatMRN(row.original.mrn)}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Patient Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
            {row.original.firstName[0]}
            {row.original.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-sm text-ink">
              {row.original.lastName}, {row.original.firstName}
            </div>
            <div className="text-[11px] text-ink-muted">
              {row.original.gender || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'DOB / Age',
      cell: ({ row }) => {
        const age = calculateAge(row.original.dateOfBirth);
        return (
          <span className="text-xs">
            {formatClinicalDate(row.original.dateOfBirth)}{' '}
            <span className="text-ink-muted">({age} yo)</span>
          </span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <span className="text-xs text-ink-muted">{formatPhone(row.original.phone)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Chart Security',
      cell: () => (
        <Badge variant="success" size="sm" dot>
          AES-256 Vault
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer
      title="Patient Chart Registry"
      description="Manage active clinical patient records, encrypted demographics, and medical charts."
      actions={
        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => navigate('/patients/pat_01j7x8k9m0')}
        >
          New Patient Record
        </Button>
      }
    >
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Filter by patient name or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="text-xs text-ink-muted flex items-center gap-2">
          <Shield className="h-4 w-4 text-success" />
          <span>Showing {filteredPatients.length} encrypted records</span>
        </div>
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
      />
    </PageContainer>
  );
};
