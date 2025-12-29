import { format, parseISO, startOfWeek } from "date-fns";
import { Transaction } from "@/types/finance";

/**
 * Parses a date string from DD-MM-YYYY format to a Date object.
 * @param dateString The date string in DD-MM-YYYY format.
 * @returns A Date object.
 */
export const parseDDMMYYYY = (dateString: string): Date => {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Calculates the start of the week (Monday) for a given date.
 * @param date The date to calculate the week start from.
 * @returns The date string for the start of the week (YYYY-MM-DD).
 */
export const getWeekStart = (date: Date): string => {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'); // Monday is 1
};

/**
 * Generates a month index in YYYYMM format.
 * @param date The date to generate the month index from.
 * @returns The month index string (YYYYMM).
 */
export const getMonthIndex = (date: Date): string => {
  return format(date, 'yyyyMM');
};

/**
 * Generates a year-month label in mmm-yyyy format.
 * @param date The date to generate the label from.
 * @returns The year-month label string (mmm-yyyy).
 */
export const getYearMonthLabel = (date: Date): string => {
  return format(date, 'MMM-yyyy');
};

/**
 * Checks if a transaction is a duplicate based on date, description, and amount.
 * In a real application, this would query a database.
 * For demonstration, it checks against a provided array of existing transactions.
 * @param newTransaction The transaction to check.
 * @param existingTransactions An array of existing transactions.
 * @returns True if a duplicate is found, false otherwise.
 */
export const isDuplicateTransaction = (
  newTransaction: Omit<Transaction, 'id'>,
  existingTransactions: Omit<Transaction, 'id'>[]
): boolean => {
  return existingTransactions.some(
    (existing) =>
      existing.date === newTransaction.date &&
      existing.description === newTransaction.description &&
      (existing.debit === newTransaction.debit || existing.credit === newTransaction.credit)
  );
};

// Helper to generate simple UUIDs for demonstration
export const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);