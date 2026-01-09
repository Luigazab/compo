import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Classroom = Tables<'classrooms'>;
export type ClassroomInsert = TablesInsert<'classrooms'>;
export type ClassroomUpdate = TablesUpdate<'classrooms'>;

export function useClassrooms() {
  return useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Classroom[];
    },
  });
}

export function useClassroom(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: async () => {
      if (!classroomId) return null;
      
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Classroom | null;
    },
    enabled: !!classroomId,
  });
}

// Get all classrooms assigned to a teacher (supports multi-classroom)
export function useTeacherClassrooms(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      
      // Check both the legacy teacher_id field and the junction table
      const { data: legacyData, error: legacyError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId);
      
      if (legacyError) throw legacyError;
      
      const { data: junctionData, error: junctionError } = await supabase
        .from('teacher_classrooms')
        .select('classrooms (*)')
        .eq('teacher_id', teacherId);
      
      if (junctionError) throw junctionError;
      
      // Combine and deduplicate results
      const junctionClassrooms = junctionData
        ?.map(tc => tc.classrooms)
        .filter((c): c is Classroom => c !== null) || [];
      
      const allClassrooms = [...(legacyData || []), ...junctionClassrooms];
      const uniqueClassrooms = allClassrooms.filter((classroom, index, self) =>
        index === self.findIndex(c => c.id === classroom.id)
      );
      
      return uniqueClassrooms;
    },
    enabled: !!teacherId,
  });
}

// Legacy function for backwards compatibility - returns first classroom
export function useTeacherClassroom(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-classroom', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      
      // Check legacy field first
      const { data: legacyData, error: legacyError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId)
        .maybeSingle();
      
      if (legacyError && legacyError.code !== 'PGRST116') throw legacyError;
      if (legacyData) return legacyData as Classroom;
      
      // Check junction table
      const { data: junctionData, error: junctionError } = await supabase
        .from('teacher_classrooms')
        .select('classrooms (*)')
        .eq('teacher_id', teacherId)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (junctionError && junctionError.code !== 'PGRST116') throw junctionError;
      if (junctionData?.classrooms) return junctionData.classrooms as Classroom;
      
      // Fallback to any assigned classroom
      const { data: anyData, error: anyError } = await supabase
        .from('teacher_classrooms')
        .select('classrooms (*)')
        .eq('teacher_id', teacherId)
        .limit(1)
        .maybeSingle();
      
      if (anyError && anyError.code !== 'PGRST116') throw anyError;
      return anyData?.classrooms as Classroom | null;
    },
    enabled: !!teacherId,
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classroom: ClassroomInsert) => {
      const { data, error } = await supabase
        .from('classrooms')
        .insert(classroom)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ClassroomUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('classrooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      queryClient.invalidateQueries({ queryKey: ['classroom', variables.id] });
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    },
  });
}
