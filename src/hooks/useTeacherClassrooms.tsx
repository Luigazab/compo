import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface TeacherClassroomAssignment {
  classroom: Tables<'classrooms'>;
  role: 'primary' | 'co-teacher';
  assignmentId?: string; // Only for co-teachers (from junction table)
}

// Fetch all classrooms for a teacher (both primary and co-teacher roles)
export function useTeacherClassrooms(teacherId: string | undefined) {
  return useQuery({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: async (): Promise<TeacherClassroomAssignment[]> => {
      if (!teacherId) return [];
      
      // Get classrooms where teacher is the primary teacher
      const { data: primaryClassrooms, error: primaryError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherId);
      
      if (primaryError) throw primaryError;
      
      // Get classrooms where teacher is a co-teacher (from junction table)
      const { data: coTeacherAssignments, error: coTeacherError } = await supabase
        .from('teacher_classrooms')
        .select(`
          id,
          is_primary,
          classrooms (*)
        `)
        .eq('teacher_id', teacherId);
      
      if (coTeacherError) throw coTeacherError;
      
      // Combine and deduplicate
      const assignments: TeacherClassroomAssignment[] = [];
      const seenClassroomIds = new Set<string>();
      
      // Add primary classrooms first
      for (const classroom of primaryClassrooms || []) {
        seenClassroomIds.add(classroom.id);
        assignments.push({
          classroom,
          role: 'primary',
        });
      }
      
      // Add co-teacher classrooms (if not already a primary teacher)
      for (const assignment of coTeacherAssignments || []) {
        const classroom = assignment.classrooms as Tables<'classrooms'>;
        if (classroom && !seenClassroomIds.has(classroom.id)) {
          seenClassroomIds.add(classroom.id);
          assignments.push({
            classroom,
            role: 'co-teacher',
            assignmentId: assignment.id,
          });
        }
      }
      
      return assignments;
    },
    enabled: !!teacherId,
  });
}

// Assign a co-teacher to a classroom
export function useAssignCoTeacher() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teacherId, classroomId }: { 
      teacherId: string; 
      classroomId: string; 
    }) => {
      const { data, error } = await supabase
        .from('teacher_classrooms')
        .insert({
          teacher_id: teacherId,
          classroom_id: classroomId,
          is_primary: false, // Co-teachers are never primary in junction table
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

// Remove a co-teacher from a classroom
export function useRemoveCoTeacher() {
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
