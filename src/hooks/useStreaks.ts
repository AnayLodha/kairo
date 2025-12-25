import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

export interface UserStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at: string;
}

export const useStreaks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: streak, isLoading } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      let newStreak = 1;
      let newLongest = streak?.longest_streak || 1;

      if (streak?.last_active_date) {
        const daysDiff = differenceInDays(new Date(today), new Date(streak.last_active_date));
        
        if (daysDiff === 0) {
          // Already updated today
          return streak;
        } else if (daysDiff === 1) {
          // Consecutive day
          newStreak = (streak.current_streak || 0) + 1;
        }
        // If daysDiff > 1, streak resets to 1
      }

      if (newStreak > newLongest) {
        newLongest = newStreak;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .upsert([{
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
        }], {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaks', user?.id] });
    },
  });

  return {
    streak,
    isLoading,
    updateStreak,
    currentStreak: streak?.current_streak || 0,
    longestStreak: streak?.longest_streak || 0,
  };
};
