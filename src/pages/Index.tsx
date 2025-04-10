import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dumbbell, Utensils, Moon, Brain, BarChart2, User, LogOut, MessageSquare, ArrowRight, AlarmClock } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { motion } from 'framer-motion';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Failed to log out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 flex flex-col">
      <motion.header 
        className="py-4 px-6 flex justify-between items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold flex items-center">
          <div className="w-8 h-8 rounded-full bg-white mr-2 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-violet-DEFAULT" />
          </div>
          FitVibe
        </h1>
        {user ? (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/chat')}
              className="text-white hover:bg-white/10"
            >
              <MessageSquare className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Assistant</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleNavigation('/profile')}
              className="text-white hover:bg-white/10"
            >
              <User className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => handleNavigation('/auth')}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            Sign In
          </Button>
        )}
      </motion.header>

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
      <motion.h1 
        className="text-4xl font-bold mb-6 bg-gradient-to-r from-violet-dark to-indigo-DEFAULT bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Your Complete Wellness Journey
      </motion.h1>
      
      <motion.p 
        className="text-xl mb-8 text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Track workouts, meals, sleep, meditation, and see your progress with AI-powered insights.
      </motion.p>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <FeatureCard 
          icon={<Dumbbell className="h-10 w-10 text-violet-DEFAULT" />} 
          title="Workout Tracking" 
          description="Log and track your fitness activities" 
          color="violet"
        />
        <FeatureCard 
          icon={<Utensils className="h-10 w-10 text-indigo-DEFAULT" />} 
          title="Nutrition Logging" 
          description="Track meals and monitor macros" 
          color="indigo"
        />
        <FeatureCard 
          icon={<BarChart2 className="h-10 w-10 text-blue-500" />} 
          title="Progress Analytics" 
          description="Visualize your wellness journey" 
          color="blue"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button 
          size="lg" 
          onClick={onGetStarted}
          className="bg-gradient-to-r from-violet-dark to-indigo-DEFAULT hover:from-violet-DEFAULT hover:to-indigo-dark transition-all duration-300 group"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => {
  const bgStyles = {
    violet: "gradient-card border-violet-light/30",
    indigo: "gradient-card border-indigo-light/30",
    blue: "gradient-card border-blue-500/30"
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.15)' }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className={`${bgStyles[color]} hover:shadow-lg transition-all duration-300`}>
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const cardClasses = "hover:shadow-md transition-all duration-300 cursor-pointer";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <WelcomeHeader />
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, staggerChildren: 0.1 }}
      >
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <StatCard 
            title="Today's Workout" 
            value="Not logged" 
            icon={<Dumbbell className="h-5 w-5 text-violet-DEFAULT" />}
            onClick={() => navigate('/workout')}
            color="violet"
          />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <StatCard 
            title="Today's Meals" 
            value="0 kcal" 
            icon={<Utensils className="h-5 w-5 text-indigo-DEFAULT" />}
            onClick={() => navigate('/meals')}
            color="indigo"
          />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <StatCard 
            title="Sleep Score" 
            value="No data" 
            icon={<Moon className="h-5 w-5 text-blue-500" />}
            onClick={() => navigate('/mind')}
            color="blue"
          />
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <StatCard 
            title="Meditation" 
            value="0 min" 
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            onClick={() => navigate('/mind')}
            color="purple"
          />
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div 
          className="md:col-span-2"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card 
            className={`gradient-card border-violet-light/30 ${cardClasses} h-full`} 
            onClick={() => navigate('/workout')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-violet-DEFAULT" />
                Workout Overview
              </CardTitle>
              <CardDescription>Track your fitness activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Log your workouts to see progress</p>
                <Button variant="outline" className="border-violet-DEFAULT/50 text-violet-DEFAULT hover:bg-violet-DEFAULT/10">
                  Add Workout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className={`gradient-card border-indigo-light/30 ${cardClasses} h-full`} onClick={() => navigate('/chat')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-DEFAULT" />
                AI Assistant
              </CardTitle>
              <CardDescription>Get personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Chat with your AI wellness coach</p>
                <Button variant="outline" className="border-indigo-DEFAULT/50 text-indigo-DEFAULT hover:bg-indigo-DEFAULT/10">
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className={`gradient-card border-blue-500/30 ${cardClasses} h-full`} onClick={() => navigate('/meals')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-blue-500" />
                Nutrition Log
              </CardTitle>
              <CardDescription>Track your meals and nutrients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Record your meals and track macros</p>
                <Button variant="outline" className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                  Log Meal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className={`gradient-card border-purple-500/30 ${cardClasses} h-full`} onClick={() => navigate('/timer')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlarmClock className="h-5 w-5 text-purple-500" />
                Workout Timer
              </CardTitle>
              <CardDescription>Set timers for your workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Create custom interval timers</p>
                <Button variant="outline" className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10">
                  Set Timer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Card className={`gradient-card border-indigo-light/30 ${cardClasses} h-full`} onClick={() => navigate('/progress')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-DEFAULT" />
                Your Progress
              </CardTitle>
              <CardDescription>Visualize your wellness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Track metrics to see your progress</p>
                <Button variant="outline" className="border-indigo-DEFAULT/50 text-indigo-DEFAULT hover:bg-indigo-DEFAULT/10">
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon, onClick, color }) => {
  const colorMap = {
    violet: "border-violet-light/30 hover:border-violet-DEFAULT/50",
    indigo: "border-indigo-light/30 hover:border-indigo-DEFAULT/50",
    blue: "border-blue-500/30 hover:border-blue-500/50",
    purple: "border-purple-500/30 hover:border-purple-500/50"
  };

  return (
    <Card 
      className={`gradient-card ${colorMap[color]} transition-all duration-300`} 
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between cursor-pointer">
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
