
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dumbbell, Utensils, Moon, Brain, BarChart2 } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wellspring</h1>
        {user ? (
          <Button 
            variant="outline" 
            onClick={() => handleNavigation('/profile')}
          >
            Profile
          </Button>
        ) : (
          <Button
            onClick={() => handleNavigation('/auth')}
          >
            Sign In
          </Button>
        )}
      </header>

      <main className="flex-1 p-6 pb-16">
        {user ? (
          <Dashboard />
        ) : (
          <WelcomeScreen onGetStarted={() => handleNavigation('/auth')} />
        )}
      </main>
      
      {user && <BottomNavbar currentPage="home" />}
    </div>
  );
};

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-6">Your Complete Wellness Journey</h1>
      <p className="text-xl mb-8 text-muted-foreground">
        Track workouts, meals, sleep, meditation, and see your progress with AI-powered insights.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FeatureCard 
          icon={<Dumbbell className="h-10 w-10" />} 
          title="Workout Tracking" 
          description="Log and track your fitness activities" 
        />
        <FeatureCard 
          icon={<Utensils className="h-10 w-10" />} 
          title="Nutrition Logging" 
          description="Track meals and monitor macros" 
        />
        <FeatureCard 
          icon={<BarChart2 className="h-10 w-10" />} 
          title="Progress Analytics" 
          description="Visualize your wellness journey" 
        />
      </div>
      
      <Button size="lg" onClick={onGetStarted}>
        Get Started
      </Button>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  // This is a placeholder for the actual dashboard which will be implemented later
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Dashboard</h2>
      <p className="text-muted-foreground">Welcome back! Here's your wellness summary.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Workout" value="Not logged" icon={<Dumbbell className="h-5 w-5" />} />
        <StatCard title="Today's Meals" value="0 kcal" icon={<Utensils className="h-5 w-5" />} />
        <StatCard title="Sleep Score" value="No data" icon={<Moon className="h-5 w-5" />} />
        <StatCard title="Meditation" value="0 min" icon={<Brain className="h-5 w-5" />} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Your recent wellness activities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Start tracking to see your activity</p>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-medium">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default Index;
