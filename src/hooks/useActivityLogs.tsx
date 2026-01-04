import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ActivityLog = Tables<'daily_activity_logs'>;
export type ActivityLogInsert = TablesInsert<'daily_activity_logs'>;
export type ActivityLogUpdate = TablesUpdate<'daily_activity_logs'>;

export type ActivityMedia = Tables<'activity_media'>;

export function useActivityLogs(childId?: string, date?: string) {
  return useQuery({
    queryKey: ['activity-logs', childId, date],
    queryFn: async () => {
      let query = supabase
        .from('daily_activity_logs')
        .select(`
          *,
          activity_media (*)
        `)
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

export function useActivityLog(logId: string | undefined) {
  return useQuery({
    queryKey: ['activity-log', logId],
    queryFn: async () => {
      if (!logId) return null;
      
      const { data, error } = await supabase
        .from('daily_activity_logs')
        .select(`
          *,
          activity_media (*)
        `)
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
      queryClient.invalidateQueries({ queryKey: ['activity-log', variables.id] });
    },
  });
}

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
      
      // Save to database
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
    },
  });
}
