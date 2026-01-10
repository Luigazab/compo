import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Announcement = Tables<'announcements'>;
export type AnnouncementInsert = TablesInsert<'announcements'>;
export type AnnouncementUpdate = TablesUpdate<'announcements'>;

export function useAnnouncements(classroomId?: string) {
  return useQuery({
    queryKey: ['announcements', classroomId],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (classroomId) {
        query = query.or(`classroom_id.eq.${classroomId},classroom_id.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useAnnouncement(announcementId: string | undefined) {
  return useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: async () => {
      if (!announcementId) return null;
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Announcement | null;
    },
    enabled: !!announcementId,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: AnnouncementInsert) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: AnnouncementUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement', variables.id] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useRecentAnnouncements(limit: number = 2) {
  return useQuery({
    queryKey: ['recent-announcements', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, priority, created_at, is_pinned')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useAnnouncementsCount() {
  return useQuery({
    queryKey: ['announcements-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count ?? 0;
    },
  });
}