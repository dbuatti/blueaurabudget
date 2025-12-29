-- Enable the "uuid-ossp" extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary', 'sub')),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create the account_maps table
CREATE TABLE public.account_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create the transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  debit NUMERIC(10, 2),
  credit NUMERIC(10, 2),
  account_id UUID REFERENCES public.account_maps(id) ON DELETE CASCADE NOT NULL,
  category_1_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_2_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_work BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories table
CREATE POLICY "Users can view their own categories." ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories." ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories." ON public.categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories." ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for account_maps table
CREATE POLICY "Users can view their own account maps." ON public.account_maps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own account maps." ON public.account_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own account maps." ON public.account_maps
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own account maps." ON public.account_maps
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions." ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions." ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions." ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions." ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Seed Data
-- Insert primary categories and capture their IDs
WITH inserted_primary_categories AS (
  INSERT INTO public.categories (name, type, user_id) VALUES
  ('Housing', 'primary', auth.uid()),
  ('Transportation', 'primary', auth.uid()),
  ('Food', 'primary', auth.uid()),
  ('Utilities', 'primary', auth.uid()),
  ('Entertainment', 'primary', auth.uid()),
  ('Income', 'primary', auth.uid()),
  ('Savings', 'primary', auth.uid()),
  ('Work Expenses', 'primary', auth.uid())
  RETURNING id, name
)
-- Insert sub-categories, linking to their respective primary categories
INSERT INTO public.categories (name, type, parent_id, user_id) VALUES
('Rent', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Housing'), auth.uid()),
('Mortgage', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Housing'), auth.uid()),
('Car Payment', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Transportation'), auth.uid()),
('Fuel', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Transportation'), auth.uid()),
('Groceries', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Food'), auth.uid()),
('Restaurants', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Food'), auth.uid()),
('Electricity', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Utilities'), auth.uid()),
('Internet', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Utilities'), auth.uid()),
('Movies', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Entertainment'), auth.uid()),
('Salary', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Income'), auth.uid()),
('Investment', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Savings'), auth.uid()),
('Software', 'sub', (SELECT id FROM inserted_primary_categories WHERE name = 'Work Expenses'), auth.uid());

-- Insert account maps
INSERT INTO public.account_maps (account_number, display_name, user_id) VALUES
('90593060', 'Credit Card', auth.uid()),
('12345678', 'Checking Account', auth.uid()),
('87654321', 'Savings Account', auth.uid());