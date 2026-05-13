import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  name: string;
  company: string;
  password_hash: string;
  created_at: string;
};

export type Estimate = {
  id: string;
  user_email: string;
  project_name: string;
  province: string;
  status: "draft" | "submitted" | "won" | "lost";
  items: EstimateItem[];
  total_value: number;
  confidence: number;
  created_at: string;
};

export type EstimateItem = {
  id: string;
  csi_code: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  material_cost: number;
  labour_hours: number;
  labour_rate: number;
};

export type Contract = {
  id: string;
  user_email: string;
  name: string;
  contract_type: string;
  counterparty: string;
  value: number;
  overall_risk: "low" | "medium" | "high" | "critical";
  clauses_count: number;
  analysis: ContractAnalysis | null;
  status: "pending" | "analyzed";
  created_at: string;
};

export type ContractAnalysis = {
  overall_risk: string;
  summary: string;
  clauses: ContractClause[];
};

export type ContractClause = {
  clause_number: string;
  clause_title: string;
  original_text: string;
  risk_level: string;
  risk_reason: string;
  suggested_text?: string;
  category: string;
};

export type SafetyReport = {
  id: string;
  user_email: string;
  project_name: string;
  report_type: string;
  raw_transcript: string;
  report: SafetyReportData | null;
  report_date: string;
  created_at: string;
};

export type SafetyReportData = {
  date: string;
  project: string;
  workers_on_site: number;
  weather: string;
  temperature_c: number;
  work_performed: string;
  hazards_noted: string[];
  corrective_actions: string;
  incidents: string;
  compliance_flags: string[];
};

export type Invoice = {
  id: string;
  user_email: string;
  invoice_number: string;
  project_name: string;
  province: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  status: "draft" | "submitted" | "certified" | "paid" | "disputed" | "overdue";
  is_proper: boolean;
  submitted_at: string | null;
  due_date: string | null;
  wsib_uploaded: boolean;
  lien_waiver_uploaded: boolean;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
};
