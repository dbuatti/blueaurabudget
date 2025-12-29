"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Transaction } from "@/types/finance";
import { seedCategories, seedAccountMaps } from "@/data/seed";
import { generateId } from "@/lib/finance-utils";

interface ManualTransactionFormProps {
  onTransactionAdded: (transaction: Transaction) => void;
}

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().min(1, "Description is required."),
  amount: z.number().positive("Amount must be positive."),
  type: z.enum(["debit", "credit"]),
  accountId: z.string().min(1, "Account is required."),
  category1Id: z.string().nullable().optional(),
  isWork: z.boolean().default(false),
  notes: z.string().nullable().optional(),
});

const ManualTransactionForm: React.FC<ManualTransactionFormProps> = ({ onTransactionAdded }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      amount: 0,
      type: "debit",
      accountId: "",
      category1Id: null,
      isWork: false,
      notes: "",
    },
  });

  const primaryCategories = seedCategories.filter(cat => cat.type === 'primary');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newTransaction: Transaction = {
      id: generateId(),
      date: format(values.date, 'yyyy-MM-dd'),
      description: values.description,
      debit: values.type === 'debit' ? values.amount : null,
      credit: values.type === 'credit' ? values.amount : null,
      account_id: values.accountId,
      category_1_id: values.category1Id || null,
      category_2_id: null, // Sub-category can be added later
      is_work: values.isWork,
      notes: values.notes || null,
    };

    onTransactionAdded(newTransaction);
    showSuccess("Transaction added successfully!");
    form.reset(); // Reset form after submission
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Manual Transaction Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => form.setValue("date", date!)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="e.g., Coffee at Starbucks"
            />
            {form.formState.errors.description && <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {form.formState.errors.amount && <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select onValueChange={(value) => form.setValue("type", value as "debit" | "credit")} value={form.watch("type")}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Debit (Expense)</SelectItem>
                <SelectItem value="credit">Credit (Income)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Account</Label>
            <Select onValueChange={(value) => form.setValue("accountId", value)} value={form.watch("accountId")}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {seedAccountMaps.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId && <p className="text-red-500 text-sm mt-1">{form.formState.errors.accountId.message}</p>}
          </div>

          <div>
            <Label htmlFor="category1">Primary Category</Label>
            <Select onValueChange={(value) => form.setValue("category1Id", value)} value={form.watch("category1Id") || ""}>
              <SelectTrigger id="category1">
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {primaryCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isWork"
              checked={form.watch("isWork")}
              onCheckedChange={(checked) => form.setValue("isWork", checked)}
            />
            <Label htmlFor="isWork">Is Work Related?</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Add any additional notes here..."
            />
          </div>

          <Button type="submit" className="w-full">Add Transaction</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualTransactionForm;