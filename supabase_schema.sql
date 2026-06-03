-- ==========================================
-- Schema Completo do Banco de Dados Supabase (BuildrAI)
-- ==========================================

-- 1. Tabela profiles (Perfis de Usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  password_hash TEXT,
  provider TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_name TEXT DEFAULT 'Free',
  billing_cycle TEXT,
  subscription_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela estimates (Orçamentos de Plantas)
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  province TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  items JSONB DEFAULT '[]'::jsonb,
  total_value NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela contracts (Auditorias CCDC)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  counterparty TEXT DEFAULT '',
  value NUMERIC DEFAULT 0,
  overall_risk TEXT NOT NULL,
  clauses_count INTEGER DEFAULT 0,
  analysis JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'analyzed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela safety_reports (Relatórios de OHS/COR)
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  raw_transcript TEXT DEFAULT '',
  report JSONB DEFAULT '{}'::jsonb,
  report_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela invoices (Proper Invoices / Prompt Payment)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  project_name TEXT NOT NULL,
  province TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'submitted',
  is_proper BOOLEAN DEFAULT false,
  submitted_at DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  wsib_uploaded BOOLEAN DEFAULT false,
  lien_waiver_uploaded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Ativar Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Nota de Segurança: Como as rotas de API do Next.js realizam operações do lado do servidor
-- usando a chave SUPABASE_SERVICE_KEY (service_role), as políticas de RLS são ignoradas de forma segura.
-- Portanto, nenhuma política adicional de acesso público (via chave "anon") é necessária.
