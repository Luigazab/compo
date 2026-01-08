import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SchoolSettings {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  timezone: string | null;
  date_format: string | null;
  language: string | null;
  open_time: string | null;
  close_time: string | null;
  work_days: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  created_at: string | null;
}

export interface NotificationSetting {
  id: string;
  setting_key: string;
  setting_value: boolean;
  created_at: string | null;
}

export function useSchoolSettings() {
  return useQuery({
    queryKey: ['school-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as SchoolSettings | null;
    },
  });
}

export function useCreateSchoolSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<SchoolSettings>) => {
      const { data, error } = await supabase
        .from('school_settings')
        .insert(settings as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
    },
  });
}

export function useUpdateSchoolSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SchoolSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('school_settings')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
    },
  });
}

export function useUpsertSchoolSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<SchoolSettings>) => {
      // Check if settings already exist
      const { data: existing } = await supabase
        .from('school_settings')
        .select('id')
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('school_settings')
          .update(settings as any)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('school_settings')
          .insert(settings as any)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
    },
  });
}

export function useHolidays() {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date');
      
      if (error) throw error;
      return data as Holiday[];
    },
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holiday: { name: string; date: string }) => {
      const { data, error } = await supabase
        .from('holidays')
        .insert(holiday)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*');
      
      if (error) throw error;
      return data as NotificationSetting[];
    },
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { data, error } = await supabase
        .from('notification_settings')
        .update({ setting_value: value })
        .eq('setting_key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}
