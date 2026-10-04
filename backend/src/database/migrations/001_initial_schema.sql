-- AuraCare EHR Enterprise Schema Migration 001
-- Multi-Tenant PostgreSQL Architecture with Row-Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tenants Table (Global SaaS Organizations)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    tier VARCHAR(50) NOT NULL DEFAULT 'enterprise',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Tenant-specific Providers, Staff, and Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'physician',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

-- 3. Patients (MPI - Master Patient Index Demographics with PII/PHI Encryption)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mrn VARCHAR(100) NOT NULL, -- Medical Record Number
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob_encrypted TEXT NOT NULL,          -- AES-256-GCM Encrypted Date of Birth
    ssn_encrypted TEXT,                   -- AES-256-GCM Encrypted Social Security Number
    insurance_id_encrypted TEXT,          -- AES-256-GCM Encrypted Primary Insurance ID
    gender VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_patient_mrn UNIQUE (tenant_id, mrn)
);

-- 4. Clinical Encounters
CREATE TABLE IF NOT EXISTS encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    encounter_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SOAP Clinical Notes (Subjective, Objective, Assessment, Plan)
CREATE TABLE IF NOT EXISTS soap_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, SIGNED, FAILED
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    raw_transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. HIPAA Audit Logs (Who, What, When, Tenant, IP)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(100) NOT NULL,
    user_agent TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable and Force RLS on all tenant-isolated clinical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY;

ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters FORCE ROW LEVEL SECURITY;

ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Dynamic tenant isolation policy using session setting `app.current_tenant_id`
DO $$
BEGIN
    -- Patients Policy
    DROP POLICY IF EXISTS tenant_isolation_patients ON patients;
    CREATE POLICY tenant_isolation_patients ON patients
        AS PERMISSIVE FOR ALL TO PUBLIC
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

    -- Encounters Policy
    DROP POLICY IF EXISTS tenant_isolation_encounters ON encounters;
    CREATE POLICY tenant_isolation_encounters ON encounters
        AS PERMISSIVE FOR ALL TO PUBLIC
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

    -- SOAP Notes Policy
    DROP POLICY IF EXISTS tenant_isolation_soap_notes ON soap_notes;
    CREATE POLICY tenant_isolation_soap_notes ON soap_notes
        AS PERMISSIVE FOR ALL TO PUBLIC
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

    -- Audit Logs Policy
    DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs;
    CREATE POLICY tenant_isolation_audit_logs ON audit_logs
        AS PERMISSIVE FOR ALL TO PUBLIC
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

    -- Users Policy
    DROP POLICY IF EXISTS tenant_isolation_users ON users;
    CREATE POLICY tenant_isolation_users ON users
        AS PERMISSIVE FOR ALL TO PUBLIC
        USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
        WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
END
$$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_patients_tenant_mrn ON patients(tenant_id, mrn);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_notes_encounter ON soap_notes(tenant_id, encounter_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_time ON audit_logs(tenant_id, created_at DESC);
