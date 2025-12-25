import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTasks } from '@/hooks/useTasks';
import { useReflections } from '@/hooks/useReflections';
import { useStreaks } from '@/hooks/useStreaks';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Flame,
  Target,
  PenLine,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const DailyFocus = () => {
  const [newTask, setNewTask] = useState('');
  const [reflection, setReflection] = useState('');
  const { tasks, isLoading, addTask, toggleTask, deleteTask, completionRate } = useTasks();
  const { todayReflection, saveReflection } = useReflections();
  const { currentStreak, longestStreak } = useStreaks();
  const { toast } = useToast();

  // Initialize reflection from saved data
  useState(() => {
    if (todayReflection?.content) {
      setReflection(todayReflection.content);
    }
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      await addTask.mutateAsync(newTask);
      setNewTask('');
      toast({
        title: "Task added",
        description: "Your task has been added to today's focus.",
      });
    } catch (error) {
      toast({
        title: "Failed to add task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await toggleTask.mutateAsync({ id, completed: !completed });
    } catch (error) {
      toast({
        title: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({
        title: "Task deleted",
      });
    } catch (error) {
      toast({
        title: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;
    
    try {
      await saveReflection.mutateAsync(reflection);
      toast({
        title: "Reflection saved",
        description: "Your daily reflection has been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save reflection",
        variant: "destructive",
      });
    }
  };

  const pieData = [
    { name: 'Completed', value: completionRate },
    { name: 'Remaining', value: 100 - completionRate },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const remainingCount = tasks.length - completedCount;

  const barData = [
    { name: 'Done', value: completedCount, fill: 'hsl(var(--success))' },
    { name: 'To Do', value: remainingCount, fill: 'hsl(var(--muted))' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">Daily Focus</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-display">{tasks.length}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-display">{completionRate}%</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-warning" />
              </div>
              <p className="text-2xl font-display">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-lg">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1"
                />
                <Button type="submit" disabled={addTask.isPending || !newTask.trim()}>
                  {addTask.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </form>

              {/* Task List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No tasks for today. Add one above!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="group flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id, task.completed)}
                        className="flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  {tasks.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="hsl(var(--muted))" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Add tasks to see progress
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  {tasks.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Reflection */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              <CardTitle className="font-display text-lg">Daily Reflection</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How was your day? What did you learn? What are you grateful for?"
              className="min-h-[120px] resize-none"
            />
            <Button 
              onClick={handleSaveReflection}
              disabled={saveReflection.isPending || !reflection.trim()}
            >
              {saveReflection.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Reflection'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DailyFocus;
