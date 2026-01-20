import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type MealLog = Tables<'meal_logs'>;
export type MealLogInsert = TablesInsert<'meal_logs'>;
export type MealLogUpdate = TablesUpdate<'meal_logs'>;

export function useMealLogs(childId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['meal-logs', childId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('meal_logs')
        .select('*')
        .order('meal_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      if (startDate) {
        query = query.gte('meal_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('meal_date', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MealLog[];
    },
  });
}

export function useTodayMealLogs(childId?: string) {
  const today = new Date().toISOString().split('T')[0];
  return useMealLogs(childId, today, today);
}

export function useCreateMealLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: MealLogInsert) => {
      const { data, error } = await supabase
        .from('meal_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs'] });
    },
  });
}

export function useCreateBulkMealLogs() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logs: MealLogInsert[]) => {
      const { data, error } = await supabase
        .from('meal_logs')
        .insert(logs)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs'] });
    },
  });
}

export function useUpdateMealLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: MealLogUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('meal_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-logs'] });
    },
  });
}
