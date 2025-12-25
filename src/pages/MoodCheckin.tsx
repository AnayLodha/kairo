import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMood, MOODS } from '@/hooks/useMood';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { Heart, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MoodCheckin = () => {
  const { todayMood, moodEntries, weekMoods, avgEnergy, saveMood, isLoading } = useMood();
  const { toast } = useToast();
  
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setEnergyLevel(todayMood.energy_level);
      setHasCheckedIn(true);
    }
  }, [todayMood]);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveMood.mutateAsync({ mood: selectedMood, energy_level: energyLevel });
      setHasCheckedIn(true);
      toast({
        title: "Check-in saved!",
        description: "Your mood has been recorded for today.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const entry = moodEntries.find(m => m.date === format(date, 'yyyy-MM-dd'));
    return {
      date: format(date, 'EEE'),
      energy: entry?.energy_level || null,
      mood: entry?.mood || null,
    };
  });

  const getMoodLabel = (value: string) => {
    const mood = MOODS.find(m => m.value === value);
    return mood?.label || '';
  };

  const getMoodEmoji = (value: string) => {
    const mood = MOODS.find(m => m.value === value);
    return mood?.emoji || '';
  };

  const getEnergyLabel = (level: number) => {
    if (level === 1) return 'Very Low';
    if (level === 2) return 'Low';
    if (level === 3) return 'Moderate';
    if (level === 4) return 'High';
    return 'Very High';
  };

  // Mood distribution for the week
  const moodDistribution = MOODS.map(mood => ({
    ...mood,
    count: weekMoods.filter(m => m.mood === mood.value).length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">Mood Check-in</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Check-in Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <CardTitle className="font-display text-lg">How are you feeling?</CardTitle>
              </div>
              {hasCheckedIn && (
                <div className="flex items-center gap-1 text-success text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Checked in</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Mood Selection */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select your mood</p>
              <div className="flex flex-wrap justify-center gap-4">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                      selectedMood === mood.value
                        ? "bg-primary/10 ring-2 ring-primary scale-105"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  <p className="text-sm text-muted-foreground">Energy Level</p>
                </div>
                <span className="text-sm font-medium">{getEnergyLabel(energyLevel)}</span>
              </div>
              <Slider
                value={[energyLevel]}
                onValueChange={([value]) => setEnergyLevel(value)}
                min={1}
                max={5}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveMood}
              disabled={saveMood.isPending || !selectedMood}
              className="w-full"
              size="lg"
            >
              {saveMood.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasCheckedIn ? (
                'Update Check-in'
              ) : (
                'Save Check-in'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Average Energy (7 days)</p>
              <p className="text-3xl font-display mt-2">
                {avgEnergy !== null ? avgEnergy.toFixed(1) : '--'}/5
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">Check-ins This Week</p>
              <p className="text-3xl font-display mt-2">{weekMoods.length}/7</p>
            </CardContent>
          </Card>
        </div>

        {/* Energy Trend Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Energy Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {weekMoods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        if (value === null) return ['--', 'Energy'];
                        const moodEmoji = props.payload.mood ? getMoodEmoji(props.payload.mood) : '';
                        return [`${value}/5 ${moodEmoji}`, 'Energy'];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--warning))' }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Start checking in to see your trends
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Mood Distribution (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {moodDistribution.map((mood) => (
                <div 
                  key={mood.value}
                  className="text-center p-3 rounded-lg bg-muted/50"
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <p className="text-xl font-display mt-2">{mood.count}</p>
                  <p className="text-xs text-muted-foreground">{mood.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : moodEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No check-ins yet. Start tracking your mood!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {moodEntries.slice(0, 7).map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <div>
                        <p className="font-medium">{getMoodLabel(entry.mood)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.date), 'EEEE, MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Energy</p>
                      <p className="font-display">{entry.energy_level}/5</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MoodCheckin;
