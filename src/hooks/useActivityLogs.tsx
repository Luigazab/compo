import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'daily_activity_logs'>;
export type ActivityLogInsert = TablesInsert<'daily_activity_logs'>;
export type ActivityLogUpdate = TablesUpdate<'daily_activity_logs'>;
export type ActivityMedia = Tables<'activity_media'>;

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

export function useCreateActivityLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: ActivityLogInsert) => {
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

// LEGACY: Keep for backward compatibility with activity_media table
// (even though we're using activity_media_url column now)

export function useAddActivityMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ activityLogId, file, caption }: { activityLogId: string; file: File; caption?: string }) => {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${activityLogId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('activity-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('activity-photos')
        .getPublicUrl(fileName);
      
      // Save to database (activity_media table)
      const { data, error } = await supabase
        .from('activity_media')
        .insert({
          activity_log_id: activityLogId,
          media_url: publicUrl,
          caption,
          media_type: file.type.startsWith('image/') ? 'image' : 'video',
        })
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

export function useDeleteActivityMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('activity_media')
        .delete()
        .eq('id', mediaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.invalidateQueries({ queryKey: ['parent-activity-logs'] });
    },
  });
}