/**
 * AuraCare System-wide application constants.
 */

export const APP_NAME = 'AuraCare EHR';
export const APP_VERSION = '1.0.0-phase1';
export const APP_DESCRIPTION = 'Next-Generation Multi-Tenant EHR & Practice Management';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLINICAL_DIRECTOR: 'clinical_director',
  PHYSICIAN: 'physician',
  NURSE: 'nurse',
  BILLING: 'billing',
  PATIENT: 'patient',
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auracare_auth_token',
  REFRESH_TOKEN: 'auracare_refresh_token',
  USER_DATA: 'auracare_user_data',
  THEME: 'auracare_theme',
  SIDEBAR_COLLAPSED: 'auracare_sidebar_collapsed',
  ACTIVE_TENANT: 'auracare_active_tenant',
} as const;

export const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes HIPAA idle timeout
