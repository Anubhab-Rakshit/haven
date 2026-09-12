// ─── Browser-Safe Supabase Client ──────────────────────────────────────────────
// Uses Vite-injected env vars. Falls back gracefully when not configured.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _client;
  }
  return null;
}

// ─── Row ↔ Record Mapping ─────────────────────────────────────────────────────
// Mirrors src/escrow/service.ts mapping but browser-safe.

export interface EscrowRecord {
  id: string;
  contractAddress: string;
  buyerAddress: string;
  sellerAddress: string;
  amount: string;
  condition: string;
  state: number;
  stateLabel: string;
  createdAt: string;
  updatedAt: string;
  fundedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  disputedAt: string | null;
  resolvedAt: string | null;
  cancelledAt: string | null;
  transactionHash: string;
  buyerSecret: string;
  sellerSecret: string;
  salt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToRecord(row: any): EscrowRecord {
  return {
    id: row.id,
    contractAddress: row.contract_address,
    buyerAddress: row.buyer_address,
    sellerAddress: row.seller_address,
    amount: row.amount,
    condition: row.condition,
    state: row.state,
    stateLabel: row.state_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fundedAt: row.funded_at,
    deliveredAt: row.delivered_at,
    releasedAt: row.released_at,
    disputedAt: row.disputed_at,
    resolvedAt: row.resolved_at,
    cancelledAt: row.cancelled_at,
    transactionHash: row.transaction_hash,
    buyerSecret: row.buyer_secret,
    sellerSecret: row.seller_secret,
    salt: row.salt,
  };
}

export function recordToRow(record: EscrowRecord) {
  return {
    id: record.id,
    contract_address: record.contractAddress,
    buyer_address: record.buyerAddress,
    seller_address: record.sellerAddress,
    amount: record.amount,
    condition: record.condition,
    state: record.state,
    state_label: record.stateLabel,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    funded_at: record.fundedAt,
    delivered_at: record.deliveredAt,
    released_at: record.releasedAt,
    disputed_at: record.disputedAt,
    resolved_at: record.resolvedAt,
    cancelled_at: record.cancelledAt,
    transaction_hash: record.transactionHash,
    buyer_secret: record.buyerSecret,
    seller_secret: record.sellerSecret,
    salt: record.salt,
  };
}

// ─── Query Helpers ─────────────────────────────────────────────────────────────

export async function fetchEscrows(): Promise<EscrowRecord[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('escrows')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase fetch failed:', error.message);
    return [];
  }
  return (data || []).map(rowToRecord);
}

export async function fetchEscrow(id: string): Promise<EscrowRecord | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data, error } = await sb
    .from('escrows')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return rowToRecord(data);
}

export async function insertEscrow(record: EscrowRecord): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from('escrows').insert(recordToRow(record));
  if (error) {
    console.error('Supabase insert failed:', error.message);
    return false;
  }
  return true;
}

export async function updateEscrow(id: string, record: EscrowRecord): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from('escrows').update(recordToRow(record)).eq('id', id);
  if (error) {
    console.error('Supabase update failed:', error.message);
    return false;
  }
  return true;
}

export async function deleteEscrow(id: string): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from('escrows').delete().eq('id', id);
  if (error) {
    console.error('Supabase delete failed:', error.message);
    return false;
  }
  return true;
}

export async function clearAllSupabase(): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from('escrows').delete().neq('id', '');
  if (error) {
    console.error('Supabase clear failed:', error.message);
    return false;
  }
  return true;
}
