"use client";

import { useState } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import CsvUploader from "@/components/CsvUploader";
import ManualTransactionForm from "@/components/ManualTransactionForm";
import { Transaction } from "@/types/finance";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleTransactionsProcessed = (newTransactions: Transaction[]) => {
    setTransactions((prev) => [...prev, ...newTransactions]);
    console.log("All Transactions:", [...transactions, ...newTransactions]);
  };

  const handleTransactionAdded = (newTransaction: Transaction) => {
    setTransactions((prev) => [...prev, newTransaction]);
    console.log("All Transactions:", [...transactions, newTransaction]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Personal Finance Intelligence</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Upload your bank statements or add manual transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <CsvUploader onTransactionsProcessed={handleTransactionsProcessed} />
        <ManualTransactionForm onTransactionAdded={handleTransactionAdded} />
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Processed Transactions (for demonstration)</h2>
        {transactions.length === 0 ? (
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