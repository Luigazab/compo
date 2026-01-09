import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeacherClassroom {
  id: string;
  teacher_id: string;
  classroom_id: string;
  is_primary: boolean | null;
  created_at: string | null;
}

export function useTeacherClassrooms(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase
        .from('teacher_classrooms')
        .select(`
          *,
          classrooms (*)
        `)
        .eq('teacher_id', teacherId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });
}

export function useAssignTeacherToClassroom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teacherId, classroomId, isPrimary = false }: { 
      teacherId: string; 
      classroomId: string; 
      isPrimary?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('teacher_classrooms')
        .insert({
          teacher_id: teacherId,
          classroom_id: classroomId,
          is_primary: isPrimary,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}

export function useRemoveTeacherFromClassroom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teacherId, classroomId }: { teacherId: string; classroomId: string }) => {
      const { error } = await supabase
        .from('teacher_classrooms')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('classroom_id', classroomId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}
