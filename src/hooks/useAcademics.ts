import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from './useSubjects';

export interface AcademicMark {
  id: string;
  subject: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
  date: string;
  created_at: string;
}

export const EXAM_TYPES = [
  'UT1',
  'UT2',
  'Half-Yearly',
  'UT3',
  'Final',
];

export const useAcademics = (subjectNames: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['academic_marks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('academic_marks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as AcademicMark[];
    },
    enabled: !!user,
  });

  const addMark = useMutation({
    mutationFn: async (mark: Omit<AcademicMark, 'id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('academic_marks')
        .insert([{ ...mark, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_marks', user?.id] });
    },
  });

  const deleteMark = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_marks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic_marks', user?.id] });
    },
  });

  // Calculate averages per subject - use provided subjects or unique from marks
  const effectiveSubjects = subjectNames.length > 0 
    ? subjectNames 
    : [...new Set(marks.map(m => m.subject))];

  const subjectAverages = effectiveSubjects.map(subject => {
    const subjectMarks = marks.filter(m => m.subject === subject);
    if (subjectMarks.length === 0) return { subject, average: null, trend: 'neutral' as const };
    
    const avg = subjectMarks.reduce((sum, m) => sum + (m.marks_obtained / m.max_marks) * 100, 0) / subjectMarks.length;
    
    // Calculate trend (comparing last two entries)
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (subjectMarks.length >= 2) {
      const sorted = [...subjectMarks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = (sorted[0].marks_obtained / sorted[0].max_marks) * 100;
      const previous = (sorted[1].marks_obtained / sorted[1].max_marks) * 100;
      trend = latest > previous ? 'up' : latest < previous ? 'down' : 'neutral';
    }
    
    return { subject, average: Math.round(avg), trend };
  });

  // Overall average
  const overallAverage = marks.length > 0
    ? Math.round(marks.reduce((sum, m) => sum + (m.marks_obtained / m.max_marks) * 100, 0) / marks.length)
    : null;

  return {
    marks,
    isLoading,
    addMark,
    deleteMark,
    subjectAverages,
    overallAverage,
  };
};
