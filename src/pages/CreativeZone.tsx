import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreativeIdeas, IDEA_CATEGORIES } from '@/hooks/useCreativeIdeas';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Lightbulb, 
  Trash2, 
  Loader2,
  Search,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const CreativeZone = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const { ideas, isLoading, addIdea, deleteIdea } = useCreativeIdeas();
  const { toast } = useToast();

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Please add a title",
        variant: "destructive",
      });
      return;
    }

    try {
      await addIdea.mutateAsync({ 
        title: title.trim(), 
        note: note.trim() || undefined, 
        category: category || undefined 
      });
      
      setIsOpen(false);
      setTitle('');
      setNote('');
      setCategory('');
      
      toast({
        title: "Idea captured!",
        description: "Your creative spark has been saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to save idea",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea.mutateAsync(id);
      toast({ title: "Idea deleted" });
    } catch (error) {
      toast({
        title: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  // Filter ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = searchQuery === '' || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.note?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || idea.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Count by category
  const categoryCounts = IDEA_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = ideas.filter(i => i.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Game Dev': 'bg-info/20 text-info',
      'AI Project': 'bg-primary/20 text-primary',
      'Design': 'bg-accent text-accent-foreground',
      'MUN Speech': 'bg-warning/20 text-warning',
      'Other': 'bg-muted text-muted-foreground',
    };
    return colors[cat] || 'bg-muted text-muted-foreground';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Creative Zone</h1>
            <p className="text-muted-foreground">Capture your ideas and inspirations</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-warning" />
                  Capture an Idea
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddIdea} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your idea?"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {IDEA_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add more details..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={addIdea.isPending}>
                  {addIdea.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Save Idea
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card 
            className={cn(
              "shadow-soft cursor-pointer transition-all",
              filterCategory === 'all' && "ring-2 ring-primary"
            )}
            onClick={() => setFilterCategory('all')}
          >
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-display">{ideas.length}</p>
              <p className="text-xs text-muted-foreground">All Ideas</p>
            </CardContent>
          </Card>
          
          {IDEA_CATEGORIES.map((cat) => (
            <Card 
              key={cat}
              className={cn(
                "shadow-soft cursor-pointer transition-all",
                filterCategory === cat && "ring-2 ring-primary"
              )}
              onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
            >
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl font-display">{categoryCounts[cat] || 0}</p>
                <p className="text-xs text-muted-foreground truncate">{cat}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas..."
            className="pl-10"
          />
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredIdeas.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              {ideas.length === 0 ? (
                <>
                  <p className="text-lg font-medium text-foreground mb-2">No ideas yet</p>
                  <p className="text-muted-foreground mb-4">
                    Start capturing your creative sparks!
                  </p>
                  <Button onClick={() => setIsOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Idea
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-foreground mb-2">No matching ideas</p>
                  <p className="text-muted-foreground">
                    Try a different search or filter
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Card 
                key={idea.id} 
                className="shadow-soft hover:shadow-card transition-all group"
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-warning flex-shrink-0" />
                        <h3 className="font-medium text-foreground truncate">{idea.title}</h3>
                      </div>
                      
                      {idea.category && (
                        <span className={cn(
                          "inline-block text-xs px-2 py-1 rounded-full mb-2",
                          getCategoryColor(idea.category)
                        )}>
                          {idea.category}
                        </span>
                      )}
                      
                      {idea.note && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                          {idea.note}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        {format(new Date(idea.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreativeZone;
