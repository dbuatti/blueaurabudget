"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { AccountMap, Transaction } from "@/types/finance";
import { parseDDMMYYYY, getWeekStart, getMonthIndex, getYearMonthLabel, isDuplicateTransaction, generateId } from "@/lib/finance-utils";
import { seedAccountMaps } from "@/data/seed"; // Using seed data for accounts
import { useSupabaseSession } from "@/hooks/use-supabase-session"; // Import the new hook

interface CsvUploaderProps {
  onTransactionsProcessed: (transactions: Transaction[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onTransactionsProcessed }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [existingTransactions, setExistingTransactions] = useState<Omit<Transaction, 'id' | 'user_id'>[]>([]); // Simulate existing transactions for duplicate check
  const { userId, loading: sessionLoading } = useSupabaseSession(); // Get userId from the hook

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (sessionLoading) {
      showError("Session is still loading. Please wait.");
      return;
    }
    if (!userId) {
      showError("You must be logged in to upload transactions.");
      return;
    }
    if (!selectedAccountId) {
      showError("Please select an account before uploading.");
      return;
    }

    acceptedFiles.forEach((file) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedTransactions: Omit<Transaction, 'id' | 'user_id'>[] = [];
          let duplicatesCount = 0;

          results.data.forEach((row: any) => {
            const ingDate = row.Date; // e.g., "01-01-2023"
            const ingDescription = row.Description;
            const ingCredit = parseFloat(row.Credit) || null;
            const ingDebit = parseFloat(row.Debit) || null;

            if (!ingDate || !ingDescription) {
              console.warn("Skipping row due to missing Date or Description:", row);
              return;
            }

            const transactionDate = parseDDMMYYYY(ingDate);
            const formattedDate = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD

            const newTransaction: Omit<Transaction, 'id' | 'user_id'> = {
              date: formattedDate,
              description: ingDescription,
              debit: ingDebit,
              credit: ingCredit,
              account_id: selectedAccountId,
              category_1_id: null, // Will be categorized later
              category_2_id: null, // Will be categorized later
              is_work: false, // Default to false
              notes: null,
            };

            // For duplicate check, we don't need user_id or id
            if (isDuplicateTransaction(newTransaction, existingTransactions)) {
              duplicatesCount++;
            } else {
              parsedTransactions.push(newTransaction);
            }
          });

          const transactionsWithIds: Transaction[] = parsedTransactions.map(tx => ({
            ...tx,
            id: generateId(),
            user_id: userId!, // Assign the current user's ID
          }));

          // Update simulated existing transactions
          setExistingTransactions(prev => [...prev, ...parsedTransactions]);

          onTransactionsProcessed(transactionsWithIds);

          let summaryMessage = `Successfully imported ${transactionsWithIds.length} new transactions.`;
          if (duplicatesCount > 0) {
            summaryMessage += ` ${duplicatesCount} duplicates were skipped.`;
          }
          showSuccess(summaryMessage);
        },
        error: (error: any) => {
          showError(`Error parsing CSV: ${error.message}`);
        },
      });
    });
  }, [selectedAccountId, existingTransactions, onTransactionsProcessed, userId, sessionLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] }, disabled: !userId || sessionLoading });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload ING CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="account-select">Select Account</Label>
          <Select onValueChange={setSelectedAccountId} value={selectedAccountId || ""}>
            <SelectTrigger id="account-select" disabled={!userId || sessionLoading}>
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {seedAccountMaps.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.display_name} ({account.account_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          } ${!selectedAccountId || !userId || sessionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} disabled={!selectedAccountId || !userId || sessionLoading} />
          {sessionLoading ? (
            <p>Loading user session...</p>
          ) : !userId ? (
            <p className="text-sm text-red-500 mt-2">Please log in to upload transactions.</p>
          ) : isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop ING CSV files here, or click to select files</p>
          )}
          {!selectedAccountId && userId && <p className="text-sm text-red-500 mt-2">Please select an account first.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvUploader;