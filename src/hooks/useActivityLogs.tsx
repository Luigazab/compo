import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'daily_activity_logs'>;
export type ActivityLogInsert = TablesInsert<'daily_activity_logs'>;
export type ActivityLogUpdate = TablesUpdate<'daily_activity_logs'>;

// Original hook - keep for backward compatibility
export function useActivityLogs(childId?: string, date?: string) {
  return useQuery({
    queryKey: ['activity-logs', childId, date],
    queryFn: async () => {
      let query = supabase
        .from('daily_activity_logs')
        .select('*')
        .order('log_date', { ascending: false });
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      if (date) {
        query = query.eq('log_date', date);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// NEW: Parent-specific hook that filters by child IDs
export function useParentActivityLogs(childIds: string[]) {
  return useQuery({
    queryKey: ['parent-activity-logs', childIds],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .select('*')
        .in('child_id', childIds)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: childIds.length > 0,
  });
}

export function useActivityLog(logId: string | undefined) {
  return useQuery({
    queryKey: ['activity-log', logId],
    queryFn: async () => {
      if (!logId) return null;
      
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .select('*')
        .eq('id', logId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!logId,
  });
}

// NEW: Create activity log with photo upload
export function useCreateActivityLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { log: ActivityLogInsert; photo?: File }) => {
      let photoUrl: string | null = null;
      
      // Upload photo first if provided
      if (data.photo) {
        const fileExt = data.photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('activity-photos')
          .upload(fileName, data.photo);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('activity-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }
      
      // Create activity log with photo URL
      const { data: activityLog, error } = await supabase
        .from('daily_activity_logs')
        .insert({
          ...data.log,
          activity_media_url: photoUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return activityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['parent-activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['today-activity-logs'] });
    },
  });
}

export function useUpdateActivityLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ActivityLogUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['parent-activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['activity-log', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['today-activity-logs'] });
    },
  });
}

// NEW: Toggle acknowledgement
export function useToggleAcknowledgement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ activityId, isAcknowledged }: { activityId: string; isAcknowledged: boolean }) => {
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .update({ is_acknowledged: !isAcknowledged })
        .eq('id', activityId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['parent-activity-logs'] });
    },
  });
}

export function useTodayActivityLogs(childIds: string[]) {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['today-activity-logs', childIds, today],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .select('id, child_id, log_date, arrival_time, pickup_time, activities, mood, nap_duration, general_notes')
        .in('child_id', childIds)
        .eq('log_date', today)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: childIds.length > 0,
  });
}