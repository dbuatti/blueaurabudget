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
import { parseDDMMYYYY, isDuplicateTransaction, generateId } from "@/lib/finance-utils";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { insertTransactions } from "@/services/finance"; // Import the new service

interface CsvUploaderProps {
  onTransactionsProcessed: () => void; // No longer passes transactions directly
  accountMaps: AccountMap[];
  existingTransactions: Transaction[];
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ onTransactionsProcessed, accountMaps, existingTransactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const { userId, loading: sessionLoading } = useSupabaseSession();

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
        complete: async (results) => {
          const transactionsToInsert: Omit<Transaction, 'id'>[] = [];
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

            const newTransactionCandidate: Omit<Transaction, 'id' | 'user_id'> = {
              date: formattedDate,
              description: ingDescription,
              debit: ingDebit,
              credit: ingCredit,
              account_id: selectedAccountId,
              category_1_id: null,
              category_2_id: null,
              is_work: false,
              notes: null,
            };

            // Check against existing transactions from Supabase
            if (isDuplicateTransaction(newTransactionCandidate, existingTransactions)) {
              duplicatesCount++;
            } else {
              transactionsToInsert.push({
                ...newTransactionCandidate,
                user_id: userId,
              });
            }
          });

          if (transactionsToInsert.length > 0) {
            const inserted = await insertTransactions(transactionsToInsert);
            if (inserted.length > 0) {
              onTransactionsProcessed(); // Trigger refetch in parent
            }
          }

          let summaryMessage = `Processed ${transactionsToInsert.length} new transactions.`;
          if (duplicatesCount > 0) {
            summaryMessage += ` ${duplicatesCount} duplicates were skipped.`;
          }
          if (transactionsToInsert.length === 0 && duplicatesCount === 0) {
            showError("No new transactions to add or all were duplicates.");
          } else {
            showSuccess(summaryMessage);
          }
        },
        error: (error: any) => {
          showError(`Error parsing CSV: ${error.message}`);
        },
      });
    });
  }, [selectedAccountId, existingTransactions, onTransactionsProcessed, userId, sessionLoading, accountMaps]);

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
              {accountMaps.map((account) => (
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