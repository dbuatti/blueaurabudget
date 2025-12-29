import { Category, AccountMap } from "@/types/finance";

// Helper to generate simple UUIDs for demonstration
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Placeholder user ID for client-side type compliance.
// In a real Supabase insertion, this would come from auth.uid().
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000"; 

// Example Primary Categories
const primaryCategories: Category[] = [
  { id: generateId(), name: "Housing", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Transportation", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Food", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Utilities", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Entertainment", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Income", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Savings", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
  { id: generateId(), name: "Work Expenses", type: "primary", parent_id: null, user_id: DUMMY_USER_ID },
];

// Example Sub-Categories (linking to primary categories)
const subCategories: Category[] = [
  { id: generateId(), name: "Rent", type: "sub", parent_id: primaryCategories[0].id, user_id: DUMMY_USER_ID }, // Housing
  { id: generateId(), name: "Mortgage", type: "sub", parent_id: primaryCategories[0].id, user_id: DUMMY_USER_ID }, // Housing
  { id: generateId(), name: "Car Payment", type: "sub", parent_id: primaryCategories[1].id, user_id: DUMMY_USER_ID }, // Transportation
  { id: generateId(), name: "Fuel", type: "sub", parent_id: primaryCategories[1].id, user_id: DUMMY_USER_ID }, // Transportation
  { id: generateId(), name: "Groceries", type: "sub", parent_id: primaryCategories[2].id, user_id: DUMMY_USER_ID }, // Food
  { id: generateId(), name: "Restaurants", type: "sub", parent_id: primaryCategories[2].id, user_id: DUMMY_USER_ID }, // Food
  { id: generateId(), name: "Electricity", type: "sub", parent_id: primaryCategories[3].id, user_id: DUMMY_USER_ID }, // Utilities
  { id: generateId(), name: "Internet", type: "sub", parent_id: primaryCategories[3].id, user_id: DUMMY_USER_ID }, // Utilities
  { id: generateId(), name: "Movies", type: "sub", parent_id: primaryCategories[4].id, user_id: DUMMY_USER_ID }, // Entertainment
  { id: generateId(), name: "Salary", type: "sub", parent_id: primaryCategories[5].id, user_id: DUMMY_USER_ID }, // Income
  { id: generateId(), name: "Investment", type: "sub", parent_id: primaryCategories[6].id, user_id: DUMMY_USER_ID }, // Savings
  { id: generateId(), name: "Software", type: "sub", parent_id: primaryCategories[7].id, user_id: DUMMY_USER_ID }, // Work Expenses
];

export const seedCategories: Category[] = [...primaryCategories, ...subCategories];

export const seedAccountMaps: AccountMap[] = [
  { id: generateId(), account_number: "90593060", display_name: "Credit Card", user_id: DUMMY_USER_ID },
  { id: generateId(), account_number: "12345678", display_name: "Checking Account", user_id: DUMMY_USER_ID },
  { id: generateId(), account_number: "87654321", display_name: "Savings Account", user_id: DUMMY_USER_ID },
];

// You can use these arrays to populate your Supabase tables.
// For example, in a Supabase client, you might do:
// await supabase.from('categories').insert(seedCategories);
// await supabase.from('account_maps').insert(seedAccountMaps);