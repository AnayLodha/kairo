import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademics, EXAM_TYPES } from '@/hooks/useAcademics';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BookOpen,
  Trash2,
  Loader2,
  GraduationCap,
  Settings,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Academics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newSubject, setNewSubject] = useState('');
  
  const { subjects, subjectNames, isLoading: subjectsLoading, addSubject, deleteSubject, initializeDefaultSubjects } = useSubjects();
  const { marks, isLoading, addMark, deleteMark, subjectAverages, overallAverage } = useAcademics(subjectNames);
  const { toast } = useToast();

  // Initialize default subjects for existing users who don't have any
  useEffect(() => {
    // Only try to initialize if not loading and we have no subjects
    // AND we haven't already tried in this session (optional optimization)
    if (!subjectsLoading && subjects.length === 0) {
      console.log('No subjects found, initializing defaults...');
      initializeDefaultSubjects.mutate();
    }
  }, [subjectsLoading, subjects.length, initializeDefaultSubjects]);

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !examType || !marksObtained || !maxMarks) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMark.mutateAsync({
        subject,
        exam_type: examType,
        marks_obtained: parseFloat(marksObtained),
        max_marks: parseFloat(maxMarks),
        date,
      });
      
      setIsOpen(false);
      setSubject('');
      setExamType('');
      setMarksObtained('');
      setMaxMarks('100');
      
      toast({
        title: "Marks added",
        description: `${subject} ${examType} marks have been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add marks",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMark = async (id: string) => {
    try {
      await deleteMark.mutateAsync(id);
      toast({ title: "Entry deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    
    try {
      await addSubject.mutateAsync(newSubject);
      setNewSubject('');
      toast({ title: "Subject added" });
    } catch (error: any) {
      console.error("Error adding subject:", error);
      toast({
        title: "Failed to add subject",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    // Check if subject has marks
    const hasMarks = marks.some(m => m.subject === name);
    if (hasMarks) {
      toast({
        title: "Cannot delete",
        description: "This subject has recorded marks. Delete those first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await deleteSubject.mutateAsync(id);
      toast({ title: "Subject removed" });
    } catch (error) {
      toast({
        title: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-destructive" />;
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getScoreColor = (percentage: number | null) => {
    if (percentage === null) return 'hsl(var(--muted))';
    if (percentage >= 75) return 'hsl(var(--success))';
    if (percentage >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  // Prepare chart data - group by date for line chart
  const lineChartData = marks
    .reduce((acc: { date: string; percentage: number }[], mark) => {
      const percentage = (mark.marks_obtained / mark.max_marks) * 100;
      acc.push({ date: format(new Date(mark.date), 'MMM d'), percentage: Math.round(percentage) });
      return acc;
    }, [])
    .slice(-10);

  // Subject bar chart data
  const barChartData = subjectAverages.map(({ subject, average }) => ({
    subject: subject.length > 8 ? subject.slice(0, 8) + '...' : subject,
    fullSubject: subject,
    average: average || 0,
    fill: getScoreColor(average),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Academic Progress</h1>
            <p className="text-muted-foreground">Track your exam performance</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isSubjectsOpen} onOpenChange={setIsSubjectsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Manage Subjects</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="New subject name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubject();
                        }
                      }}
                    />
                    <Button onClick={handleAddSubject} disabled={addSubject.isPending || !newSubject.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {subjectsLoading ? (
                      <div className="text-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                      </div>
                    ) : subjects.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No subjects yet</p>
                    ) : (
                      subjects.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="font-medium">{s.name}</span>
                          <button
                            onClick={() => handleDeleteSubject(s.id, s.name)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Marks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Add Exam Marks</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMark} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectNames.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXAM_TYPES.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marks Obtained</Label>
                      <Input
                        type="number"
                        value={marksObtained}
                        onChange={(e) => setMarksObtained(e.target.value)}
                        placeholder="85"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Marks</Label>
                      <Input
                        type="number"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        placeholder="100"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={addMark.isPending}>
                    {addMark.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Marks'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft col-span-2 lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-display">{overallAverage ?? '--'}%</p>
              <p className="text-sm text-muted-foreground">Overall Average</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft col-span-2 lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
              <p className="text-2xl font-display">{marks.length}</p>
              <p className="text-sm text-muted-foreground">Entries Recorded</p>
            </CardContent>
          </Card>

          {subjectAverages
            .filter(s => s.average !== null)
            .sort((a, b) => (b.average || 0) - (a.average || 0))
            .slice(0, 2)
            .map(({ subject, average, trend }, i) => (
              <Card key={subject} className="shadow-soft">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {getTrendIcon(trend)}
                    <span className="text-xs text-muted-foreground">
                      {i === 0 ? 'Best' : 'Strong'}
                    </span>
                  </div>
                  <p className="text-lg font-display truncate">{subject}</p>
                  <p className="text-2xl font-display">{average}%</p>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Progress Over Time */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[0, 100]} 
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
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Add marks to see trends
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {barChartData.some(d => d.average > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis 
                        type="category" 
                        dataKey="subject" 
                        width={80} 
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name, props) => [
                          `${value}%`,
                          props.payload.fullSubject
                        ]}
                      />
                      <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectAverages.map(({ subject, average, trend }) => (
            <Card key={subject} className="shadow-soft hover:shadow-card transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{subject}</p>
                    <p className="text-3xl font-display mt-1">
                      {average !== null ? `${average}%` : '--'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getTrendIcon(trend)}
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getScoreColor(average) }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Entries */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : marks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No marks recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Exam</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.slice().reverse().slice(0, 10).map((mark) => {
                      const percentage = Math.round((mark.marks_obtained / mark.max_marks) * 100);
                      return (
                        <tr key={mark.id} className="border-b border-border/50 group">
                          <td className="py-3 font-medium">{mark.subject}</td>
                          <td className="py-3 text-muted-foreground">{mark.exam_type}</td>
                          <td className="py-3">
                            <span 
                              className="inline-flex items-center gap-1"
                              style={{ color: getScoreColor(percentage) }}
                            >
                              {mark.marks_obtained}/{mark.max_marks} ({percentage}%)
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {format(new Date(mark.date), 'MMM d, yyyy')}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteMark(mark.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Academics;
