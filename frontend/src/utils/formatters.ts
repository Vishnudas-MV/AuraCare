/**
 * Specialized formatting utilities for clinical EHR records.
 */

/**
 * Format ISO timestamp into human-readable clinical date & time.
 * e.g., "Oct 04, 2026, 09:30 AM"
 */
export function formatClinicalDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format ISO date string into readable date.
 * e.g., "Oct 04, 2026"
 */
export function formatClinicalDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculates current age from a Date of Birth string (YYYY-MM-DD).
 */
export function calculateAge(dobString: string | null | undefined): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Formats a Medical Record Number (MRN) for consistent display.
 */
export function formatMRN(mrn: string | null | undefined): string {
  if (!mrn) return '—';
  return mrn.toUpperCase();
}

/**
 * Formats US Phone number: (XXX) XXX-XXXX
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
