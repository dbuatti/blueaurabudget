export interface Category {
  id: string;
  name: string;
  type: 'primary' | 'sub';
  parent_id: string | null; // References Category.id for sub-categories
  user_id: string; // Added for Supabase RLS
}

export interface AccountMap {
  id: string;
  account_number: string; // e.g., "90593060"
  display_name: string; // e.g., "Credit Card"
  user_id: string; // Added for Supabase RLS
}

export interface Transaction {
  id: string;
  date: string; // ISO date string, e.g., "YYYY-MM-DD"
  description: string;
  debit: number | null; // Amount for expenses
  credit: number | null; // Amount for income
  account_id: string; // References AccountMap.id
  category_1_id: string | null; // References Category.id for primary category
  category_2_id: string | null; // References Category.id for sub-category
  is_work: boolean;
  notes: string | null;
  user_id: string; // Added for Supabase RLS
}