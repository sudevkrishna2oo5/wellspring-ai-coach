
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StepTracker } from '@/components/fitness/StepTracker';
import { StepChart } from '@/components/fitness/StepChart';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import StepsIcon from '@/components/icons/StepsIcon';

export default function StepProgress() {
  const navigate = useNavigate();
  const [dailyGoal] = useState(10000);
  const [currentSteps, setCurrentSteps] = useState(0);
  
  // Get step count from StepTracker component
  useEffect(() => {
    // In a real app, we'd get this from a health API or device sensor
    // This is a demo that simulates steps increasing over time
    const interval = setInterval(() => {
      setCurrentSteps(prev => {
        const newValue = prev + Math.floor(Math.random() * 10);
        return newValue > dailyGoal ? dailyGoal : newValue;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [dailyGoal]);
  
  // Calculate calories burned using the formula Steps × 0.05
  const caloriesBurned = Math.round(currentSteps * 0.05);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/5 via-background to-indigo-500/5 flex flex-col transition-colors duration-300">
      <motion.header 
        className="py-4 px-6 flex justify-between items-center gradient-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-white flex items-center">
            <StepsIcon className="h-5 w-5 mr-2" />
            Step Tracker
          </h1>
        </div>
      </motion.header>

      <main className="flex-1 p-4 pb-20 space-y-6 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <StepTracker dailyGoal={dailyGoal} />

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="gradient-card h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Daily Goal</p>
                  <p className="text-lg font-medium">{dailyGoal.toLocaleString()}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="gradient-card h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-rose-500/10 p-3 mb-2">
                    <Flame className="h-5 w-5 text-rose-500" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Calories</p>
                  <p className="text-lg font-medium">{caloriesBurned}</p>
                  <p className="text-xs text-muted-foreground">Steps × 0.05</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card className="gradient-card h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-teal-500/10 p-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-teal-500" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Tracking</p>
                  <p className="text-lg font-medium">Auto</p>
                  <p className="text-xs text-muted-foreground">Updates live</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Weekly Chart */}
          <StepChart />

          {/* Explanation Card */}
          <Card className="gradient-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">About Step Tracking</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your steps are tracked automatically using your device's motion sensors or health data from Google Fit/Apple Health.
                Calories are calculated using the formula: Steps × 0.05.
              </p>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Note: This is a simulated demo. In a real application, step data would be pulled from device sensors or health APIs.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <BottomNavbar currentPage="progress" />
    </div>
  );
}
