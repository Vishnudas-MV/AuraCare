import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export interface HipaaComplianceBadgeProps {
  tenantName?: string;
}

export const HipaaComplianceBadge: React.FC<HipaaComplianceBadgeProps> = ({
  tenantName = 'AuraCare Regional Health System',
}) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Tooltip
        content="AES-256 GCM encrypted at rest & in transit. Client request ID logged to immutable PostgreSQL audit trail."
        position="top"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-line text-ink-muted">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="font-medium text-ink">HIPAA Security Tier 3</span>
          <span className="text-ink-muted hidden sm:inline">• {tenantName}</span>
        </div>
      </Tooltip>
    </div>
  );
};
