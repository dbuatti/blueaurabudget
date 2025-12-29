import { supabase } from "@/lib/supabase";
import { Category, AccountMap, Transaction, Budget } from "@/types/finance";
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

export async function updateTransactionIsWork(transactionId: string, isWork: boolean): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_work: isWork })
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error("[finance.ts] Error updating transaction 'is_work' status:", error);
    showError("Failed to update transaction work status.");
    return null;
  }
  showSuccess("Transaction work status updated successfully!");
  return data as Transaction;
}

// --- Budgets ---
export async function fetchBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("[finance.ts] Error fetching budgets:", error);
    showError("Failed to load budgets.");
    return [];
  }
  return data as Budget[];
}

export async function upsertBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(budget, { onConflict: 'category_id, user_id' })
    .select()
    .single();

  if (error) {
    console.error("[finance.ts] Error upserting budget:", error);
    showError("Failed to save budget.");
    return null;
  }
  showSuccess("Budget saved successfully!");
  return data as Budget;
}