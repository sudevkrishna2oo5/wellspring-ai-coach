
import { useEffect, useState } from "react";
import { Steps, Activity, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface StepTrackerProps {
  dailyGoal?: number;
  className?: string;
}

export function StepTracker({ dailyGoal = 10000, className }: StepTrackerProps) {
  const [steps, setSteps] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(true);
  const { toast } = useToast();

  // Simulation function for demo purposes
  // In a real app, we'd use the Web Pedometer API or connect to Google Fit/Apple Health
  const simulateStepData = () => {
    // Simulate that we got a number of steps between 2000 and 8000
    const simulatedSteps = Math.floor(Math.random() * 6000) + 2000;
    setSteps(simulatedSteps);
    // Calculate calories using formula: steps × 0.05
    setCalories(Math.round(simulatedSteps * 0.05));
    setIsLoading(false);
  };

  useEffect(() => {
    // Check if the browser supports the required sensors
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // In a real app, we would request permission to access motion sensors
      // For this demo, we'll just simulate data after a short delay
      const timer = setTimeout(() => {
        simulateStepData();
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      // Sensor not available
      setSensorAvailable(false);
      setIsLoading(false);
      toast({
        title: "Sensor not available",
        description: "Step tracking requires motion sensors which aren't available on your device.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((steps / dailyGoal) * 100), 100);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="gradient-primary py-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Steps className="h-5 w-5" />
          Daily Step Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-pulse h-6 w-32 bg-muted rounded-md mb-4"></div>
            <div className="animate-pulse h-4 w-48 bg-muted rounded-md"></div>
            <div className="animate-pulse w-full h-2 bg-muted rounded-full mt-8"></div>
          </div>
        ) : !sensorAvailable ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              Step tracking requires motion sensors which aren't available on your device.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="step-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold tracking-tight"
                >
                  {steps.toLocaleString()}
                </motion.div>
                <p className="text-muted-foreground">steps today</p>
              </div>

              <div className="space-y-4">
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar-fill bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">0</span>
                  <span className="font-medium">{Math.round(progressPercentage)}% of daily goal</span>
                  <span className="text-muted-foreground">{dailyGoal.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="stats-card bg-teal-light/10 dark:bg-teal-dark/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Calories</p>
                      <p className="text-2xl font-semibold">{calories}</p>
                    </div>
                    <div className="rounded-full p-2 bg-teal-light/20 dark:bg-teal-light/10">
                      <Flame className="h-4 w-4 text-teal-dark" />
                    </div>
                  </div>
                </div>

                <div className="stats-card bg-amber-light/10 dark:bg-amber-dark/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Activity</p>
                      <p className="text-2xl font-semibold">
                        {progressPercentage < 30
                          ? "Low"
                          : progressPercentage < 70
                          ? "Medium"
                          : "High"}
                      </p>
                    </div>
                    <div className="rounded-full p-2 bg-amber-light/20 dark:bg-amber-light/10">
                      <Activity className="h-4 w-4 text-amber-dark" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-center text-muted-foreground">
                <p className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Last updated just now
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
