import { supabase } from "@/lib/supabase";
import { Category, AccountMap, Transaction } from "@/types/finance";
import { showError, showSuccess } from "@/utils/toast";

// --- Categories ---
export async function fetchCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("[finance.ts] Error fetching categories:", error);
    showError("Failed to load categories.");
    return [];
  }
  return data as Category[];
}

// --- Account Maps ---
export async function fetchAccountMaps(userId: string): Promise<AccountMap[]> {
  const { data, error } = await supabase
    .from('account_maps')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("[finance.ts] Error fetching account maps:", error);
    showError("Failed to load account maps.");
    return [];
  }
  return data as AccountMap[];
}

// --- Transactions ---
export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("[finance.ts] Error fetching transactions:", error);
    showError("Failed to load transactions.");
    return [];
  }
  return data as Transaction[];
}

export async function insertTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("[finance.ts] Error inserting transaction:", error);
    showError("Failed to add transaction.");
    return null;
  }
  showSuccess("Transaction added successfully!");
  return data as Transaction;
}

export async function insertTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<Transaction[]> {
  if (transactions.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select();

  if (error) {
    console.error("[finance.ts] Error inserting multiple transactions:", error);
    showError("Failed to add multiple transactions.");
    return [];
  }
  showSuccess(`Successfully added ${data.length} transactions!`);
  return data as Transaction[];
}