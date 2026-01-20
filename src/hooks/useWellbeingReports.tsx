import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type WellbeingReport = Tables<'wellbeing_reports'>;
export type WellbeingReportInsert = TablesInsert<'wellbeing_reports'>;
export type WellbeingReportUpdate = TablesUpdate<'wellbeing_reports'>;

export function useWellbeingReports(childId?: string) {
  return useQuery({
    queryKey: ['wellbeing-reports', childId],
    queryFn: async () => {
      let query = supabase
        .from('wellbeing_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WellbeingReport[];
    },
  });
}

export function useWellbeingReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ['wellbeing-report', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      const { data, error } = await supabase
        .from('wellbeing_reports')
        .select('*')
        .eq('id', reportId)
        .maybeSingle();
      
      if (error) throw error;
      return data as WellbeingReport | null;
    },
    enabled: !!reportId,
  });
}

export function useCreateWellbeingReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: WellbeingReportInsert) => {
      const { data, error } = await supabase
        .from('wellbeing_reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing-reports'] });
    },
  });
}

export function useUpdateWellbeingReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: WellbeingReportUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('wellbeing_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing-reports'] });
      queryClient.invalidateQueries({ queryKey: ['wellbeing-report', variables.id] });
    },
  });
}

export function useRecentWellbeingReports(childIds: string[], limit: number = 5) {
  return useQuery({
    queryKey: ['recent-wellbeing-reports', childIds, limit],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('wellbeing_reports')
        .select('id, child_id, report_date, incident_type, description, severity, parent_notified, created_at')
        .in('child_id', childIds)
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as WellbeingReport[];
    },
    enabled: childIds.length > 0,
  });
}

export function useUnreadWellbeingReportsCount(childIds: string[]) {
  return useQuery({
    queryKey: ['unread-wellbeing-reports-count', childIds],
    queryFn: async () => {
      if (childIds.length === 0) return 0;
      
      const { count, error } = await supabase
        .from('wellbeing_reports')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
        .eq('parent_notified', false);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: childIds.length > 0,
  });
}