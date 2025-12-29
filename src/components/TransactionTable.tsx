"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Briefcase } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Category, AccountMap, Transaction } from "@/types/finance";
import { getWeekStart, getMonthIndex, getYearMonthLabel } from "@/lib/finance-utils";
import { useMutation } from "@tanstack/react-query";
import { updateTransactionIsWork } from "@/services/finance";
import { showError } from "@/utils/toast";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  accountMaps: AccountMap[];
  refetchTransactions: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  accountMaps,
  refetchTransactions,
}) => {
  const updateWorkStatusMutation = useMutation({
    mutationFn: ({ transactionId, isWork }: { transactionId: string; isWork: boolean }) =>
      updateTransactionIsWork(transactionId, isWork),
    onSuccess: () => {
      refetchTransactions();
    },
    onError: (error) => {
      console.error("Failed to update work status:", error);
      showError("Failed to update work status.");
    },
  });

  const handleWorkToggle = (transactionId: string, currentIsWork: boolean) => {
    updateWorkStatusMutation.mutate({ transactionId, isWork: !currentIsWork });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Credit</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead>Category 1</TableHead>
            <TableHead>Category 2</TableHead>
            <TableHead className="text-center">
              <Briefcase className="h-4 w-4 inline-block mr-1" /> Work
            </TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-gray-500 dark:text-gray-400">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const transactionDate = parseISO(transaction.date);
              const account = accountMaps.find((acc) => acc.id === transaction.account_id);
              const category1 = categories.find((cat) => cat.id === transaction.category_1_id);
              const category2 = categories.find((cat) => cat.id === transaction.category_2_id);

              // Derived fields (calculated on-the-fly)
              const weekStart = getWeekStart(transactionDate);
              const monthIndex = getMonthIndex(transactionDate);
              const monthYearLabel = getYearMonthLabel(transactionDate);

              // console.log(`Transaction ID: ${transaction.id}`);
              // console.log(`  Week Start: ${weekStart}`);
              // console.log(`  Month Index: ${monthIndex}`);
              // console.log(`  Month-Year Label: ${monthYearLabel}`);

              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(transactionDate, 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {account ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {account.display_name}
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    {transaction.credit ? `$${transaction.credit.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {transaction.debit ? `$${transaction.debit.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>{category1?.name || "Uncategorized"}</TableCell>
                  <TableCell>{category2?.name || "-"}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={transaction.is_work}
                      onCheckedChange={() => handleWorkToggle(transaction.id, transaction.is_work)}
                      aria-label="Toggle work related"
                    />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{transaction.notes || "-"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;