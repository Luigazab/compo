import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAddWellbeingMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      wellbeingReportId, 
      file, 
      caption 
    }: { 
      wellbeingReportId: string; 
      file: File; 
      caption?: string 
    }) => {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `wellbeing/${wellbeingReportId}/${Date.now()}.${fileExt}`;
      
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
        .from('wellbeing_media')
        .insert({
          wellbeing_report_id: wellbeingReportId,
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
      queryClient.invalidateQueries({ queryKey: ['wellbeing-reports'] });
    },
  });
}

export function useDeleteWellbeingMedia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('wellbeing_media')
        .delete()
        .eq('id', mediaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing-reports'] });
    },
  });
}
