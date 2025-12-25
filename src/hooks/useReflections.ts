import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export interface Reflection {
  id: string;
  content: string;
  date: string;
  created_at: string;
}

export const useReflections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: reflections = [], isLoading } = useQuery({
    queryKey: ['reflections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as Reflection[];
    },
    enabled: !!user,
  });

  const todayReflection = reflections.find(r => r.date === today);

  const saveReflection = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_reflections')
        .upsert([{ 
          user_id: user.id, 
          content,
          date: today,
        }], {
          onConflict: 'user_id,date',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', user?.id] });
    },
  });

  return {
    reflections,
    todayReflection,
    isLoading,
    saveReflection,
  };
};
