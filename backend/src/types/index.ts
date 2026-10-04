export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiErrorDetail;
  meta?: ApiMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogEntry {
  id?: string;
  tenant_id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: Record<string, unknown>;
  created_at?: string;
}
