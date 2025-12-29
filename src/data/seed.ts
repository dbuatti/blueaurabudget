import { Category, AccountMap } from "@/types/finance";

// Helper to generate simple UUIDs for demonstration
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Example Primary Categories
const primaryCategories: Category[] = [
  { id: generateId(), name: "Housing", type: "primary", parent_id: null },
  { id: generateId(), name: "Transportation", type: "primary", parent_id: null },
  { id: generateId(), name: "Food", type: "primary", parent_id: null },
  { id: generateId(), name: "Utilities", type: "primary", parent_id: null },
  { id: generateId(), name: "Entertainment", type: "primary", parent_id: null },
  { id: generateId(), name: "Income", type: "primary", parent_id: null },
  { id: generateId(), name: "Savings", type: "primary", parent_id: null },
  { id: generateId(), name: "Work Expenses", type: "primary", parent_id: null },
];

// Example Sub-Categories (linking to primary categories)
const subCategories: Category[] = [
  { id: generateId(), name: "Rent", type: "sub", parent_id: primaryCategories[0].id }, // Housing
  { id: generateId(), name: "Mortgage", type: "sub", parent_id: primaryCategories[0].id }, // Housing
  { id: generateId(), name: "Car Payment", type: "sub", parent_id: primaryCategories[1].id }, // Transportation
  { id: generateId(), name: "Fuel", type: "sub", parent_id: primaryCategories[1].id }, // Transportation
  { id: generateId(), name: "Groceries", type: "sub", parent_id: primaryCategories[2].id }, // Food
  { id: generateId(), name: "Restaurants", type: "sub", parent_id: primaryCategories[2].id }, // Food
  { id: generateId(), name: "Electricity", type: "sub", parent_id: primaryCategories[3].id }, // Utilities
  { id: generateId(), name: "Internet", type: "sub", parent_id: primaryCategories[3].id }, // Utilities
  { id: generateId(), name: "Movies", type: "sub", parent_id: primaryCategories[4].id }, // Entertainment
  { id: generateId(), name: "Salary", type: "sub", parent_id: primaryCategories[5].id }, // Income
  { id: generateId(), name: "Investment", type: "sub", parent_id: primaryCategories[6].id }, // Savings
  { id: generateId(), name: "Software", type: "sub", parent_id: primaryCategories[7].id }, // Work Expenses
];

export const seedCategories: Category[] = [...primaryCategories, ...subCategories];

export const seedAccountMaps: AccountMap[] = [
  { id: generateId(), account_number: "90593060", display_name: "Credit Card" },
  { id: generateId(), account_number: "12345678", display_name: "Checking Account" },
  { id: generateId(), account_number: "87654321", display_name: "Savings Account" },
];

// You can use these arrays to populate your Supabase tables.
// For example, in a Supabase client, you might do:
// await supabase.from('categories').insert(seedCategories);
// await supabase.from('account_maps').insert(seedAccountMaps);