import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  BookOpen, 
  Heart, 
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react';
const kairoLogo = import.meta.env.BASE_URL + 'kairo-logo.png';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={kairoLogo} alt="Kairo" className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  const features = [
    {
      icon: Target,
      title: 'Daily Focus Hub',
      description: 'Track tasks, build streaks, and reflect on your day',
    },
    {
      icon: BookOpen,
      title: 'Academic Tracker',
      description: 'Monitor exam performance across all subjects',
    },
    {
      icon: Heart,
      title: 'Mood Check-in',
      description: 'Understand patterns between energy and productivity',
    },
    {
      icon: Lightbulb,
      title: 'Creative Zone',
      description: 'Capture ideas for games, AI projects, and more',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={kairoLogo} alt="Kairo" className="w-10 h-10 object-contain" />
            <span className="font-display text-xl">Kairo</span>
          </div>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Your personal growth companion
          </div>
          
          <h1 className="font-display text-4xl lg:text-6xl text-foreground mb-6 leading-tight">
            Find Your Purpose,
            <br />
            <span className="text-primary">Track Your Growth</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A calm, student-friendly space to manage academics, track mood, capture creative ideas, 
            and build habits that last. Designed for focused minds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, i) => (
            <div 
              key={feature.title}
              className="p-6 rounded-2xl bg-card shadow-card border border-border/50 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Philosophy Section */}
        <div className="max-w-2xl mx-auto text-center mt-20 py-12 animate-fade-in">
          <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-4">
            What is Kairo?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Kairo (καιρός) is a Greek concept meaning "the opportune moment." 
            It represents seizing the right time for action and growth. 
            This app helps you make the most of every moment in your journey.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Built with care for students who dream big.</p>
        <p className="mt-2">Made by Anay Lodha 👑</p>
      </footer>
    </div>
  );
};

export default Index;
