import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Child = Tables<'children'>;
export type ChildInsert = TablesInsert<'children'>;
export type ChildUpdate = TablesUpdate<'children'>;

export function useChildren(classroomId?: string) {
  return useQuery({
    queryKey: ['children', classroomId],
    queryFn: async () => {
      let query = supabase.from('children').select('*').eq('is_active', true);
      
      if (classroomId) {
        query = query.eq('classroom_id', classroomId);
      }
      
      const { data, error } = await query.order('first_name');
      if (error) throw error;
      return data as Child[];
    },
  });
}

export function useChild(childId: string | undefined) {
  return useQuery({
    queryKey: ['child', childId],
    queryFn: async () => {
      if (!childId) return null;
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Child | null;
    },
    enabled: !!childId,
  });
}

export function useParentChildren(parentId: string | undefined) {
  return useQuery({
    queryKey: ['parent-children', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const { data, error } = await supabase
        .from('child_parent')
        .select(`
          child_id,
          relationship,
          is_primary,
          children (*)
        `)
        .eq('parent_id', parentId);
      
      if (error) throw error;
      return data?.map(cp => cp.children).filter(Boolean) as Child[];
    },
    enabled: !!parentId,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (child: ChildInsert) => {
      const { data, error } = await supabase
        .from('children')
        .insert(child)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ChildUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['child', variables.id] });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from('children')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}
