/**
 * lib/supabase.ts
 *
 * Self-hosted SQLite database — no Supabase needed.
 * Data stored at: .data/obrized.db (single file on your VPS)
 *
 * Drop-in compatible with the Supabase JS client patterns used across all API routes:
 *   supabase.from("table").select("*").eq("field", val).order("col").single()
 *   supabase.from("table").insert({...}).select().single()
 *   supabase.from("table").update({...}).eq("id", id).select().single()
 *   supabase.from("table").delete().eq("id", id)
 */

import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "obrized.db");

// JSON-serialized columns per table
const JSON_COLS: Record<string, Set<string>> = {
  estimates:      new Set(["items"]),
  contracts:      new Set(["analysis"]),
  safety_reports: new Set(["report"]),
  invoices:       new Set(["items"]),
  quotes:         new Set(["items", "payment_methods"]),
  clients:        new Set(["tags"]),
  jobs:           new Set([]),
};

// ─── Lazy SQLite singleton ────────────────────────────────────────────────────

let _db: any = null;

function getDb() {
  if (_db) return _db;

  // Require better-sqlite3 only when actually needed (avoids edge-runtime issues)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT DEFAULT '',
      company TEXT DEFAULT '',
      password_hash TEXT,
      provider TEXT DEFAULT 'credentials',
      avatar_url TEXT,
      plan_name TEXT DEFAULT 'Free',
      billing_cycle TEXT DEFAULT 'monthly',
      subscription_status TEXT DEFAULT 'active',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS estimates (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      project_name TEXT DEFAULT '',
      province TEXT DEFAULT 'ON',
      status TEXT DEFAULT 'draft',
      items TEXT DEFAULT '[]',
      total_value REAL DEFAULT 0,
      confidence REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      name TEXT DEFAULT '',
      contract_type TEXT DEFAULT '',
      counterparty TEXT DEFAULT '',
      value REAL DEFAULT 0,
      overall_risk TEXT DEFAULT 'medium',
      clauses_count INTEGER DEFAULT 0,
      analysis TEXT DEFAULT 'null',
      status TEXT DEFAULT 'analyzed',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS safety_reports (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      project_name TEXT DEFAULT '',
      report_type TEXT DEFAULT '',
      raw_transcript TEXT DEFAULT '',
      report TEXT DEFAULT 'null',
      report_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      invoice_number TEXT DEFAULT '',
      project_name TEXT DEFAULT '',
      province TEXT DEFAULT 'ON',
      items TEXT DEFAULT '[]',
      subtotal REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'submitted',
      is_proper INTEGER DEFAULT 0,
      submitted_at TEXT,
      due_date TEXT,
      wsib_uploaded INTEGER DEFAULT 0,
      lien_waiver_uploaded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      quote_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      provider_company TEXT DEFAULT '',
      provider_name TEXT DEFAULT '',
      provider_email TEXT DEFAULT '',
      provider_phone TEXT DEFAULT '',
      provider_address TEXT DEFAULT '',
      provider_license TEXT DEFAULT '',
      provider_hst TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      client_company TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      client_phone TEXT DEFAULT '',
      client_address TEXT DEFAULT '',
      project_name TEXT DEFAULT '',
      project_address TEXT DEFAULT '',
      project_description TEXT DEFAULT '',
      valid_until TEXT,
      items TEXT DEFAULT '[]',
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 13,
      tax_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      advance_percent INTEGER DEFAULT 20,
      payment_methods TEXT DEFAULT '["e-transfer","cheque"]',
      payment_due_days INTEGER DEFAULT 30,
      late_interest_rate REAL DEFAULT 2,
      include_collection_clause INTEGER DEFAULT 1,
      include_lien_clause INTEGER DEFAULT 1,
      custom_notes TEXT DEFAULT '',
      signed_at TEXT,
      signed_by TEXT,
      signature_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      name TEXT DEFAULT '',
      company TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      province TEXT DEFAULT 'ON',
      notes TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      client_id TEXT DEFAULT '',
      client_name TEXT DEFAULT '',
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'scheduled',
      priority TEXT DEFAULT 'normal',
      address TEXT DEFAULT '',
      scheduled_date TEXT,
      completed_date TEXT,
      estimated_hours REAL DEFAULT 0,
      actual_hours REAL DEFAULT 0,
      total_value REAL DEFAULT 0,
      quote_id TEXT DEFAULT '',
      invoice_id TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default demo profile if empty
  const profileCount = (_db.prepare("SELECT COUNT(*) as c FROM profiles").get() as any).c;
  if (profileCount === 0) {
    _db.prepare(`
      INSERT INTO profiles (id, email, name, company, password_hash, provider, plan_name, billing_cycle, subscription_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "1",
      "john.carter@jcconstruction.ca",
      "John Carter",
      "JC Construction Ltd.",
      "$2b$10$DqK8R1MGY04Hz.G66yCM9.ztHJOO7xeFxmPSwSNXas8TCVwmRbFAq",
      "credentials",
      "Starter",
      "monthly",
      "active",
    );
  }

  return _db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

function serializeRow(tableName: string, row: Record<string, any>): Record<string, any> {
  const jsonCols = JSON_COLS[tableName] ?? new Set();
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    result[k] = jsonCols.has(k) ? JSON.stringify(v ?? null) : v;
  }
  return result;
}

function deserializeRow(tableName: string, row: Record<string, any>): Record<string, any> {
  if (!row) return row;
  const jsonCols = JSON_COLS[tableName] ?? new Set();
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (jsonCols.has(k) && typeof v === "string") {
      try { result[k] = JSON.parse(v); } catch { result[k] = v; }
    } else if (k === "is_proper" || k === "wsib_uploaded" || k === "lien_waiver_uploaded" ||
               k === "include_collection_clause" || k === "include_lien_clause") {
      result[k] = Boolean(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

type Op = "select" | "insert" | "update" | "delete";

// ─── Query Builder ────────────────────────────────────────────────────────────

class SQLiteQueryBuilder {
  private _table: string;
  private _op: Op = "select";
  private _filters: Array<[string, any]> = [];
  private _order: { field: string; asc: boolean } | null = null;
  private _single = false;
  private _insertRow: Record<string, any> | null = null;
  private _updateFields: Record<string, any> | null = null;

  constructor(tableName: string) {
    this._table = tableName;
  }

  select(_cols?: string, _opts?: any) {
    this._op = "select";
    return this;
  }

  eq(field: string, val: any) {
    this._filters.push([field, val]);
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this._order = { field, asc: opts?.ascending !== false };
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  // ── Insert ──
  insert(row: Record<string, any>) {
    this._op = "insert";
    this._insertRow = row;
    // Return a chain that supports .select().single()
    const self = this;
    return {
      select: () => ({ single: () => self._execute() }),
      then: (res?: any, rej?: any) => self._execute().then(res, rej),
    };
  }

  // ── Update ──
  update(fields: Record<string, any>) {
    this._op = "update";
    this._updateFields = fields;
    // Chainable: .eq() → .select() → .single()
    const self = this;
    const chain = {
      eq: (f: string, v: any) => { self._filters.push([f, v]); return chain; },
      select: () => ({ single: () => self._execute() }),
      then: (res?: any, rej?: any) => self._execute().then(res, rej),
    };
    return chain;
  }

  // ── Delete ──
  delete() {
    this._op = "delete";
    const self = this;
    const chain = {
      eq: (f: string, v: any) => { self._filters.push([f, v]); return chain; },
      then: (res?: any, rej?: any) => self._execute().then(res, rej),
    };
    return chain;
  }

  // ── Execute (returns Promise) ──
  private async _execute(): Promise<{ data: any; error: null | { message: string }; count?: number }> {
    try {
      const db = getDb();
      const table = this._table;

      if (this._op === "insert") {
        const row = this._insertRow!;
        const newRow = { id: newId(), created_at: new Date().toISOString(), ...row };
        const serialized = serializeRow(table, newRow);
        const cols = Object.keys(serialized);
        const placeholders = cols.map(() => "?").join(", ");
        const vals = cols.map((c) => serialized[c]);
        db.prepare(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`).run(...vals);
        return { data: deserializeRow(table, newRow), error: null };
      }

      if (this._op === "update") {
        const updates = this._updateFields!;
        const serialized = serializeRow(table, updates);
        const setClauses = Object.keys(serialized).map((k) => `${k} = ?`).join(", ");
        const setVals = Object.values(serialized);
        const [whereSql, whereVals] = this._buildWhere();
        const sql = `UPDATE ${table} SET ${setClauses}${whereSql}`;
        db.prepare(sql).run(...setVals, ...whereVals);
        // Return the updated row
        const [fetchSql, fetchVals] = this._buildSelect("*");
        const updated = db.prepare(fetchSql).get(...fetchVals);
        const result = updated ? deserializeRow(table, updated as any) : null;
        return { data: result, error: null };
      }

      if (this._op === "delete") {
        const [whereSql, whereVals] = this._buildWhere();
        db.prepare(`DELETE FROM ${table}${whereSql}`).run(...whereVals);
        return { data: null, error: null };
      }

      // SELECT
      const [sql, vals] = this._buildSelect("*");
      if (this._single) {
        const row = db.prepare(sql).get(...vals);
        if (!row) return { data: null, error: { message: "Row not found" } };
        return { data: deserializeRow(table, row as any), error: null };
      }
      const rows = (db.prepare(sql).all(...vals) as any[]).map((r) => deserializeRow(table, r));
      return { data: rows, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message ?? "DB error" } };
    }
  }

  private _buildWhere(): [string, any[]] {
    if (this._filters.length === 0) return ["", []];
    const clauses = this._filters.map(([f]) => `${f} = ?`).join(" AND ");
    const vals = this._filters.map(([, v]) => v);
    return [` WHERE ${clauses}`, vals];
  }

  private _buildSelect(cols: string): [string, any[]] {
    const [whereSql, whereVals] = this._buildWhere();
    const orderSql = this._order
      ? ` ORDER BY ${this._order.field} ${this._order.asc ? "ASC" : "DESC"}`
      : "";
    return [`SELECT ${cols} FROM ${this._table}${whereSql}${orderSql}`, whereVals];
  }

  // ── Promise interface (allows `await supabase.from("t").select()...`) ──
  then(res?: (v: any) => any, rej?: (r: any) => any) {
    return this._execute().then(res, rej);
  }
}

// ─── Public supabase export ───────────────────────────────────────────────────

export const supabase = {
  from: (tableName: string) => new SQLiteQueryBuilder(tableName),
};

// ─── Types (unchanged from original) ─────────────────────────────────────────

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

export type Client = {
  id: string;
  user_email: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  notes: string;
  tags: string[];
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  user_email: string;
  client_id: string;
  client_name: string;
  title: string;
  description: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  address: string;
  scheduled_date: string | null;
  completed_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  total_value: number;
  quote_id: string;
  invoice_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
};
