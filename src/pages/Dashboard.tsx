import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/hooks/useTasks';
import { useAcademics } from '@/hooks/useAcademics';
import { useMood, MOODS } from '@/hooks/useMood';
import { useStreaks } from '@/hooks/useStreaks';
import { useCreativeIdeas } from '@/hooks/useCreativeIdeas';
import { 
  Target, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Sparkles,
  Heart,
  Lightbulb,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { tasks, completionRate } = useTasks();
  const { subjectAverages, overallAverage } = useAcademics();
  const { todayMood, avgEnergy } = useMood();
  const { currentStreak, longestStreak, updateStreak } = useStreaks();
  const { ideas } = useCreativeIdeas();

  // Update streak on dashboard load
  useEffect(() => {
    if (tasks.length > 0 && tasks.some(t => t.completed)) {
      updateStreak.mutate();
    }
  }, [tasks]);

  const pieData = [
    { name: 'Completed', value: completionRate },
    { name: 'Remaining', value: 100 - completionRate },
  ];

  const generateInsight = () => {
    const insights: string[] = [];
    
    // Academic insights
    const improving = subjectAverages.filter(s => s.trend === 'up');
    const declining = subjectAverages.filter(s => s.trend === 'down');
    
    if (improving.length > 0) {
      insights.push(`${improving[0].subject} is showing improvement! Keep it up.`);
    }
    if (declining.length > 0 && insights.length === 0) {
      insights.push(`${declining[0].subject} might need some extra attention.`);
    }
    
    // Task insights
    if (completionRate >= 80) {
      insights.push("You're crushing it today! Great task completion rate.");
    } else if (completionRate < 50 && tasks.length > 0) {
      insights.push("Take it one task at a time. You've got this.");
    }
    
    // Streak insights
    if (currentStreak >= 7) {
      insights.push(`Amazing ${currentStreak}-day streak! Consistency is your superpower.`);
    } else if (currentStreak >= 3) {
      insights.push(`${currentStreak} days strong! Building great habits.`);
    }
    
    // Energy insights
    if (avgEnergy && avgEnergy < 2.5) {
      insights.push("Your energy has been lower lately. Remember to rest well.");
    }
    
    if (insights.length === 0) {
      insights.push("Every day is a new opportunity to grow. You're doing great!");
    }
    
    return insights[0];
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getMoodEmoji = () => {
    if (!todayMood) return null;
    const mood = MOODS.find(m => m.value === todayMood.mood);
    return mood?.emoji;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Insight Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-foreground font-medium">{generateInsight()}</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Tasks</p>
                  <p className="text-2xl font-display">{tasks.filter(t => t.completed).length}/{tasks.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-display">{currentStreak} days</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className="text-2xl font-display">{overallAverage ?? '--'}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-card transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Mood</p>
                  <p className="text-2xl font-display">{getMoodEmoji() ?? '--'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg">Today's Focus</CardTitle>
              <Link 
                to="/focus" 
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No tasks for today yet.</p>
                  <Link to="/focus" className="text-primary hover:underline text-sm">
                    Add your first task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion Chart */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                {tasks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground text-sm">No data yet</div>
                )}
              </div>
              <p className="text-center text-2xl font-display text-foreground">
                {completionRate}%
              </p>
              <p className="text-center text-sm text-muted-foreground">
                of tasks completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Academic Overview */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg">Academic Snapshot</CardTitle>
              <Link 
                to="/academics" 
                className="text-sm text-primary hover:underline"
              >
                View details
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {subjectAverages.slice(0, 6).map(({ subject, average, trend }) => (
                  <div 
                    key={subject}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium truncate">{subject}</p>
                      <p className="text-lg font-display">{average ?? '--'}%</p>
                    </div>
                    {getTrendIcon(trend)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Ideas */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg">Recent Ideas</CardTitle>
              <Link 
                to="/creative" 
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {ideas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No ideas captured yet.</p>
                  <Link to="/creative" className="text-primary hover:underline text-sm">
                    Add your first idea
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ideas.slice(0, 4).map((idea) => (
                    <div 
                      key={idea.id}
                      className="p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-warning flex-shrink-0" />
                        <p className="font-medium truncate">{idea.title}</p>
                      </div>
                      {idea.category && (
                        <span className="text-xs text-muted-foreground mt-1 inline-block">
                          {idea.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
