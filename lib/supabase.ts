import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Create a local offline mock database client
class LocalQueryBuilder {
  private tableName: string;
  private filters: Array<{ field: string; val: any }> = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private isSingle: boolean = false;
  private dataDir: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dataDir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (e) {}
    }
  }

  private getData(): any[] {
    const filePath = path.join(this.dataDir, `${this.tableName}.json`);
    if (!fs.existsSync(filePath)) {
      // Seed default profiles or items if empty
      if (this.tableName === "profiles") {
        return [
          {
            id: "1",
            email: "john.carter@jcconstruction.ca",
            name: "John Carter",
            company: "JC Construction Ltd.",
            // Bcrypt of "password123"
            password_hash: "$2b$10$DqK8R1MGY04Hz.G66yCM9.ztHJOO7xeFxmPSwSNXas8TCVwmRbFAq",
            provider: "credentials",
            avatar_url: null,
            created_at: new Date().toISOString(),
            plan_name: "Starter",
            billing_cycle: "monthly",
            subscription_status: "active",
            stripe_customer_id: "cus_mock123",
            stripe_subscription_id: "sub_mock123"
          }
        ];
      }
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      return [];
    }
  }

  private saveData(data: any[]) {
    const filePath = path.join(this.dataDir, `${this.tableName}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {}
  }

  select(columns?: string) {
    return this;
  }

  eq(field: string, val: any) {
    this.filters.push({ field, val });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    let items = this.getData();

    // Apply filters
    for (const filter of this.filters) {
      items = items.filter((item) => {
        const itemVal = item[filter.field];
        if (typeof itemVal === "string" && typeof filter.val === "string") {
          return itemVal.toLowerCase() === filter.val.toLowerCase();
        }
        return itemVal === filter.val;
      });
    }

    // Apply sorting
    if (this.orderField) {
      items.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.isSingle) {
      if (items.length === 0) {
        return { data: null, error: { message: "Row not found" } };
      }
      return { data: items[0], error: null };
    }

    return { data: items, error: null };
  }

  // Promise-like then method so we can await the query builder directly!
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  insert(row: any) {
    const items = this.getData();
    const newRow = {
      id: row.id || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      created_at: new Date().toISOString(),
      ...row,
    };
    items.push(newRow);
    this.saveData(items);

    const chain = {
      select: () => ({
        single: async () => ({ data: newRow, error: null }),
        then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
          return Promise.resolve({ data: [newRow], error: null }).then(onfulfilled, onrejected);
        }
      }),
      then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
        return Promise.resolve({ data: [newRow], error: null }).then(onfulfilled, onrejected);
      }
    };
    return chain as any;
  }

  update(updates: any) {
    const items = this.getData();
    let updatedRow: any = null;

    const newItems = items.map((item) => {
      let matches = true;
      for (const filter of this.filters) {
        if (item[filter.field] !== filter.val) {
          matches = false;
        }
      }
      if (matches) {
        updatedRow = { ...item, ...updates };
        return updatedRow;
      }
      return item;
    });

    if (updatedRow) {
      this.saveData(newItems);
    }

    const chain = {
      select: () => ({
        single: async () => ({ data: updatedRow, error: null }),
        then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
          return Promise.resolve({ data: updatedRow ? [updatedRow] : [], error: null }).then(onfulfilled, onrejected);
        }
      }),
      then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
        return Promise.resolve({ data: updatedRow ? [updatedRow] : [], error: null }).then(onfulfilled, onrejected);
      }
    };
    return chain as any;
  }
}

const mockSupabase = {
  from: (tableName: string) => {
    return new LocalQueryBuilder(tableName);
  }
};

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : (mockSupabase as any);

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string;
  name: string;
  company: string;
  password_hash: string | null;
  provider: string;
  avatar_url: string | null;
  created_at: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan_name?: "Free" | "Starter" | "Pro";
  billing_cycle?: "monthly" | "annually";
  subscription_status?: "active" | "canceled" | "past_due" | null;
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
