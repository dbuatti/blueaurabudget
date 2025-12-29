"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, fetchBudgets, upsertBudget } from "@/services/finance";
import { Category, Budget } from "@/types/finance";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";

const formSchema = z.object({
  budgets: z.record(z.string(), z.number().min(0, "Limit cannot be negative.").nullable()),
});

const BudgetSettings: React.FC = () => {
  const { userId, loading: sessionLoading } = useSupabaseSession();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories', userId],
    queryFn: () => fetchCategories(userId!),
    enabled: !!userId && !sessionLoading,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ['budgets', userId],
    queryFn: () => fetchBudgets(userId!),
    enabled: !!userId && !sessionLoading,
  });

  const primaryCategories = categories.filter(cat => cat.type === 'primary');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgets: {},
    },
  });

  useEffect(() => {
    if (budgets.length > 0 && primaryCategories.length > 0) {
      const initialBudgets: { [key: string]: number | null } = {};
      primaryCategories.forEach(cat => {
        const existingBudget = budgets.find(b => b.category_id === cat.id);
        initialBudgets[cat.id] = existingBudget ? existingBudget.monthly_limit : null;
      });
      form.reset({ budgets: initialBudgets });
    }
  }, [budgets, primaryCategories, form]);

  const upsertBudgetMutation = useMutation({
    mutationFn: (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => upsertBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', userId] });
    },
    onError: (error) => {
      console.error("Failed to save budget:", error);
      showError("Failed to save budget.");
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (sessionLoading) {
      showError("Session is still loading. Please wait.");
      return;
    }
    if (!userId) {
      showError("You must be logged in to manage budgets.");
      return;
    }

    for (const categoryId in values.budgets) {
      const monthlyLimit = values.budgets[categoryId];
      const existingBudget = budgets.find(b => b.category_id === categoryId); // Declared here

      if (monthlyLimit !== null && monthlyLimit >= 0) {
        await upsertBudgetMutation.mutateAsync({
          id: existingBudget?.id, // Pass existing ID for update
          category_id: categoryId,
          monthly_limit: monthlyLimit,
          user_id: userId,
        });
      } else if (monthlyLimit === null && existingBudget) {
        // If limit is set to null and a budget exists, consider deleting it or setting to 0
        // For now, we'll just not upsert if null. If user wants to delete, we'd need a delete function.
        // Or, we can upsert with 0 if that's the desired behavior for "no limit".
        await upsertBudgetMutation.mutateAsync({
          id: existingBudget?.id,
          category_id: categoryId,
          monthly_limit: 0, // Set to 0 if null is entered, effectively removing the limit
          user_id: userId,
        });
      }
    }
  };

  const isLoading = sessionLoading || categoriesLoading || budgetsLoading;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Budget Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !userId ? (
            <p className="text-center text-red-500">Please log in to manage budgets.</p>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {primaryCategories.length === 0 ? (
                <p className="text-center text-gray-500">No primary categories found. Please add some categories first.</p>
              ) : (
                primaryCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between space-x-4">
                    <Label htmlFor={`budget-${category.id}`} className="flex-1 text-lg">
                      {category.name}
                    </Label>
                    <div className="flex items-center space-x-2 w-1/3">
                      <span className="text-gray-600 dark:text-gray-400">$</span>
                      <Input
                        id={`budget-${category.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register(`budgets.${category.id}`, { valueAsNumber: true })}
                        className="w-full"
                      />
                    </div>
                    {form.formState.errors.budgets?.[category.id] && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.budgets?.[category.id]?.message}</p>
                    )}
                  </div>
                ))
              )}
              <Button type="submit" className="w-full" disabled={!userId || isLoading || primaryCategories.length === 0}>
                {isLoading ? "Loading..." : "Save Budgets"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSettings;