-- Quotes table for Obrized quote builder
-- Run this migration after activating the Supabase project

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',

  -- Provider snapshot
  provider_company TEXT NOT NULL DEFAULT '',
  provider_name TEXT NOT NULL DEFAULT '',
  provider_email TEXT NOT NULL DEFAULT '',
  provider_phone TEXT NOT NULL DEFAULT '',
  provider_address TEXT NOT NULL DEFAULT '',
  provider_license TEXT DEFAULT '',
  provider_hst TEXT DEFAULT '',

  -- Client
  client_name TEXT NOT NULL DEFAULT '',
  client_company TEXT DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT DEFAULT '',
  client_address TEXT NOT NULL DEFAULT '',

  -- Project
  project_name TEXT NOT NULL DEFAULT '',
  project_address TEXT DEFAULT '',
  project_description TEXT DEFAULT '',
  valid_until DATE,

  -- Line items stored as JSON array
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Financials
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 13,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,

  -- Payment terms (Toronto/Ontario standard)
  advance_percent INTEGER DEFAULT 20,
  payment_methods TEXT[] DEFAULT ARRAY['e-transfer','cheque'],
  payment_due_days INTEGER DEFAULT 30,
  late_interest_rate NUMERIC(4,2) DEFAULT 2,
  include_collection_clause BOOLEAN DEFAULT TRUE,
  include_lien_clause BOOLEAN DEFAULT TRUE,

  -- Custom notes
  custom_notes TEXT DEFAULT '',

  -- Client e-signature
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  signature_data TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quotes_user_email_idx ON quotes(user_email);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
