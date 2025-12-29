"use client";

import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import CsvUploader from "@/components/CsvUploader";
import ManualTransactionForm from "@/components/ManualTransactionForm";
import { Transaction, Category, AccountMap } from "@/types/finance";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchAccountMaps, fetchTransactions } from "@/services/finance";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card component imports

const Index = () => {
  const { userId, loading: sessionLoading } = useSupabaseSession();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: () => fetchCategories(userId!),
    enabled: !!userId && !sessionLoading,
  });

  // Fetch account maps
  const { data: accountMaps = [], isLoading: accountMapsLoading } = useQuery<AccountMap[]>({
    queryKey: ['accountMaps', userId],
    queryFn: () => fetchAccountMaps(userId!),
    enabled: !!userId && !sessionLoading,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: () => fetchTransactions(userId!),
    enabled: !!userId && !sessionLoading,
  });

  const handleTransactionsProcessed = () => {
    refetchTransactions(); // Refetch transactions after CSV upload
  };

  const handleTransactionAdded = () => {
    refetchTransactions(); // Refetch transactions after manual entry
  };

  const isLoading = sessionLoading || categoriesLoading || accountMapsLoading || transactionsLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Personal Finance Intelligence</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Upload your bank statements or add manual transactions.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <CsvUploader
            onTransactionsProcessed={handleTransactionsProcessed}
            accountMaps={accountMaps}
            existingTransactions={transactions}
          />
          <ManualTransactionForm
            onTransactionAdded={handleTransactionAdded}
            categories={categories}
            accountMaps={accountMaps}
          />
        </div>
      )}

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Processed Transactions</h2>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : transactions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No transactions yet. Upload a CSV or add one manually!</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md max-h-96 overflow-y-auto">
            <pre className="text-sm text-left text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
              {JSON.stringify(transactions, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;