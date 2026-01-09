import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Document = Tables<'required_documents'>;
export type DocumentInsert = TablesInsert<'required_documents'>;
export type DocumentUpdate = TablesUpdate<'required_documents'>;

export function useDocuments(childId?: string) {
  return useQuery({
    queryKey: ['documents', childId],
    queryFn: async () => {
      let query = supabase
        .from('required_documents')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (childId) {
        query = query.eq('child_id', childId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      const { data, error } = await supabase
        .from('required_documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Document | null;
    },
    enabled: !!documentId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (doc: DocumentInsert) => {
      const { data, error } = await supabase
        .from('required_documents')
        .insert(doc)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: DocumentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('required_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, file, childId }: { documentId: string; file: File; childId: string }) => {
      // Upload to storage - using a simple path structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${childId}/${documentId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get signed URL (private bucket)
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 3600 * 24 * 365); // 1 year
      
      // Update document record - use explicit table reference to avoid ambiguity
      const { data, error } = await supabase
        .from('required_documents')
        .update({
          file_url: urlData?.signedUrl || fileName,
          status: 'submitted',
          submission_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', documentId)
        .select('id, child_id, document_type, due_date, file_url, status, submission_date, created_at')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('required_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
