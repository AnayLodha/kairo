import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreativeIdea {
  id: string;
  title: string;
  note: string | null;
  category: string | null;
  created_at: string;
}

export const IDEA_CATEGORIES = [
  'Game Dev',
  'AI Project',
  'Design',
  'MUN Speech',
  'Other',
];

export const useCreativeIdeas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['creative_ideas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('creative_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CreativeIdea[];
    },
    enabled: !!user,
  });

  const addIdea = useMutation({
    mutationFn: async ({ title, note, category }: { title: string; note?: string; category?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('creative_ideas')
        .insert([{ user_id: user.id, title, note, category }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative_ideas', user?.id] });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creative_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative_ideas', user?.id] });
    },
  });

  return {
    ideas,
    isLoading,
    addIdea,
    deleteIdea,
  };
};
