import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subject {
  id: string;
  name: string;
  created_at: string;
}

// Default subjects for new users who don't have any yet
export const DEFAULT_SUBJECTS = [
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
];

export const useSubjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['user_subjects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!user,
  });

  const addSubject = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_subjects')
        .insert([{ name: name.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding subject:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_subjects', user?.id] });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_subjects', user?.id] });
    },
  });

  // Initialize default subjects if user has none
  const initializeDefaultSubjects = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const inserts = DEFAULT_SUBJECTS.map(name => ({
        name,
        user_id: user.id,
      }));
      
      const { error } = await supabase
        .from('user_subjects')
        .insert(inserts);

      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_subjects', user?.id] });
    },
  });

  // Get subject names as array for use in other components
  const subjectNames = subjects.map(s => s.name);

  return {
    subjects,
    subjectNames,
    isLoading,
    addSubject,
    deleteSubject,
    initializeDefaultSubjects,
  };
};
