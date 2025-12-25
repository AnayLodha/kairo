import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays } from 'date-fns';

export interface MoodEntry {
  id: string;
  mood: string;
  energy_level: number;
  date: string;
  created_at: string;
}

export const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😤', label: 'Stressed', value: 'stressed' },
];

export const useMood = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['mood_entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as MoodEntry[];
    },
    enabled: !!user,
  });

  const todayMood = moodEntries.find(m => m.date === today);

  const saveMood = useMutation({
    mutationFn: async ({ mood, energy_level }: { mood: string; energy_level: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('mood_entries')
        .upsert([{ 
          user_id: user.id, 
          mood, 
          energy_level,
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
      queryClient.invalidateQueries({ queryKey: ['mood_entries', user?.id] });
    },
  });

  // Get mood distribution for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const weekMoods = moodEntries.filter(m => last7Days.includes(m.date));
  
  const avgEnergy = weekMoods.length > 0
    ? Math.round(weekMoods.reduce((sum, m) => sum + m.energy_level, 0) / weekMoods.length * 10) / 10
    : null;

  return {
    moodEntries,
    todayMood,
    isLoading,
    saveMood,
    avgEnergy,
    weekMoods,
  };
};
