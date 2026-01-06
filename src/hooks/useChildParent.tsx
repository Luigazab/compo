import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ChildParent = Tables<'child_parent'>;
export type ChildParentInsert = TablesInsert<'child_parent'>;

export function useChildParents(childId?: string) {
  return useQuery({
    queryKey: ['child-parents', childId],
    queryFn: async () => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('child_parent')
        .select(`
          *,
          users:parent_id (id, full_name, email, phone)
        `)
        .eq('child_id', childId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
}

export function useCreateChildParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ChildParentInsert) => {
      const { data: result, error } = await supabase
        .from('child_parent')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['child-parents', variables.child_id] });
      queryClient.invalidateQueries({ queryKey: ['parent-children'] });
    },
  });
}

export function useDeleteChildParent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, parentId }: { childId: string; parentId: string }) => {
      const { error } = await supabase
        .from('child_parent')
        .delete()
        .eq('child_id', childId)
        .eq('parent_id', parentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-parents'] });
      queryClient.invalidateQueries({ queryKey: ['parent-children'] });
    },
  });
}
