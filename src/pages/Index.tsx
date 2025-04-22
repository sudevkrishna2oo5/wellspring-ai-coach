import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, CheckCircle2, Flame, ListChecks } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import NotificationCenter from '@/components/NotificationCenter';
import { supabase } from '@/integrations/supabase/client';

const WelcomeHeader = ({ userName }: { userName: string | null }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-6"
  >
    <h1 className="text-3xl font-bold">
      Welcome back, {userName || 'User'}!
    </h1>
    <p className="text-muted-foreground">
      Here's a summary of your fitness activity.
    </p>
  </motion.div>
);

const ActivitySummary = () => (
  <>
    <div className="rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Flame className="mr-2 h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Activity</h3>
        </div>
        <p className="text-xs text-muted-foreground">Last 7 days</p>
      </div>
      <div className="text-2xl font-bold">3,452 kcal</div>
      <p className="text-sm text-muted-foreground">You burned 12% more calories than last week.</p>
    </div>

    <div className="rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <ListChecks className="mr-2 h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">Workouts</h3>
        </div>
        <p className="text-xs text-muted-foreground">This week</p>
      </div>
      <div className="text-2xl font-bold">5 workouts</div>
      <p className="text-sm text-muted-foreground">You completed 2 more workouts than last week.</p>
    </div>

    <div className="rounded-2xl bg-muted p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
          <h3 className="text-sm font-semibold">Progress</h3>
        </div>
        <p className="text-xs text-muted-foreground">This month</p>
      </div>
      <div className="text-2xl font-bold">+2.5 kg</div>
      <p className="text-sm text-muted-foreground">You gained 2.5 kg of muscle mass this month.</p>
    </div>
  </>
);

const WorkoutCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="rounded-2xl bg-muted p-5">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-sm font-semibold ml-2">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
    <Button variant="link" className="mt-4">
      View Details
    </Button>
  </div>
);

const Index = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (profileData) {
          setUserName(profileData.full_name);
        }
      }
    };

    fetchUserName();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16">
      <div className="container mx-auto px-4 pt-6 pb-24">
        <WelcomeHeader userName={userName} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 p-1">
            <div className="bg-background rounded-xl p-5">
              <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Connect with Experts
              </h2>
              <p className="text-muted-foreground mb-4">
                Get personalized guidance from fitness and wellness professionals
              </p>
              <Button
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                onClick={() => navigate('/professional-advice')}
              >
                Find Experts
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActivitySummary />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <WorkoutCard
            title="Daily Steps"
            description="Track your daily steps and stay active."
            icon={<Activity className="h-5 w-5 text-violet-500" />}
          />
          <WorkoutCard
            title="Calorie Intake"
            description="Monitor your calorie intake and maintain a balanced diet."
            icon={<Flame className="h-5 w-5 text-orange-500" />}
          />
          <WorkoutCard
            title="Workout Log"
            description="Keep a record of your workouts and track your progress."
            icon={<ListChecks className="h-5 w-5 text-blue-500" />}
          />
          <WorkoutCard
            title="Progress Tracker"
            description="Visualize your fitness journey and celebrate milestones."
            icon={<BarChart3 className="h-5 w-5 text-green-500" />}
          />
        </div>
      </div>

      <BottomNavbar currentPage="home" />
      <NotificationCenter />
    </div>
  );
};

export default Index;
