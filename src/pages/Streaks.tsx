
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trophy, Timer, Flame, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import BottomNavbar from '@/components/BottomNavbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type WorkoutDay = {
  date: Date;
  type: 'cardio' | 'strength' | 'flexibility' | 'rest' | 'planned';
  completed: boolean;
};

const Streaks = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [streakCount, setStreakCount] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [cheatDay, setCheatDay] = useState<Date | null>(null);
  const [showCheatDayTips, setShowCheatDayTips] = useState(false);

  useEffect(() => {
    // Fetch workout data from database in a real app
    const fetchWorkoutData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          toast.error('You must be logged in to view your workout data');
          return;
        }

        // In a real app, this would be fetched from your database
        // For now, let's create some sample data
        const today = new Date();
        const mockWorkouts: WorkoutDay[] = [];
        
        // Add past workouts
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          // Randomly determine if this was a workout day (70% chance)
          if (Math.random() < 0.7) {
            const types = ['cardio', 'strength', 'flexibility'] as const;
            mockWorkouts.push({
              date: new Date(date),
              type: types[Math.floor(Math.random() * types.length)],
              completed: true
            });
          } else if (Math.random() < 0.5) {
            // Rest day
            mockWorkouts.push({
              date: new Date(date),
              type: 'rest',
              completed: true
            });
          }
        }
        
        // Add planned workouts
        for (let i = 1; i <= 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          
          // 50% chance of planned workout for future dates
          if (Math.random() < 0.5) {
            const types = ['cardio', 'strength', 'flexibility'] as const;
            mockWorkouts.push({
              date: new Date(date),
              type: types[Math.floor(Math.random() * types.length)],
              completed: false
            });
          }
        }
        
        setWorkoutDays(mockWorkouts);
        
        // Calculate current streak
        let currentStreak = 0;
        let dayToCheck = new Date();
        dayToCheck.setDate(dayToCheck.getDate() - 1); // Start from yesterday
        
        while (true) {
          const found = mockWorkouts.find(
            workout => 
              workout.date.toDateString() === dayToCheck.toDateString() && 
              (workout.completed || workout.type === 'rest')
          );
          
          if (found) {
            currentStreak++;
            dayToCheck.setDate(dayToCheck.getDate() - 1);
          } else {
            break;
          }
        }
        
        setStreakCount(currentStreak);
        
        // Calculate weekly progress
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        const completedThisWeek = mockWorkouts.filter(
          workout => 
            workout.date >= startOfWeek && 
            workout.date <= today && 
            workout.completed && 
            workout.type !== 'rest'
        ).length;
        
        setWeeklyProgress(completedThisWeek);
      } catch (error) {
        console.error('Error fetching workout data:', error);
        toast.error('Failed to load workout data');
      }
    };

    fetchWorkoutData();
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const workoutForDate = workoutDays.find(
        day => day.date.toDateString() === date.toDateString()
      );
      
      if (workoutForDate) {
        toast.info(
          `${workoutForDate.completed ? 'Completed' : 'Planned'} ${workoutForDate.type} workout`
        );
      }
    }
  };

  const markCheatDay = () => {
    if (!selectedDate) return;
    
    setCheatDay(selectedDate);
    setShowCheatDayTips(true);
    toast.success(`Cheat day marked for ${selectedDate.toLocaleDateString()}`);
  };

  const renderCalendarDay = (day: Date) => {
    const workout = workoutDays.find(
      w => w.date.toDateString() === day.toDateString()
    );
    
    // Check if it's a cheat day
    const isCheatDay = cheatDay && cheatDay.toDateString() === day.toDateString();
    
    if (!workout && !isCheatDay) return day.getDate();
    
    let className = 'relative w-full h-full flex items-center justify-center';
    let bgColor = 'bg-transparent';
    
    if (workout) {
      if (workout.type === 'cardio' && workout.completed) {
        bgColor = 'bg-blue-500';
      } else if (workout.type === 'strength' && workout.completed) {
        bgColor = 'bg-red-500';
      } else if (workout.type === 'flexibility' && workout.completed) {
        bgColor = 'bg-green-500';
      } else if (workout.type === 'rest') {
        bgColor = 'bg-gray-200 dark:bg-gray-700';
      } else if (!workout.completed) {
        bgColor = 'bg-amber-200 dark:bg-amber-800';
      }
    }
    
    if (isCheatDay) {
      bgColor = 'bg-purple-300 dark:bg-purple-900';
    }
    
    return (
      <div className={`${className} ${bgColor} rounded-full`}>
        {day.getDate()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fixed top-0 inset-x-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Workout Streaks</h1>
        </div>
      </header>

      <main className="pt-16 pb-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" /> 
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-5xl font-bold">{streakCount}</span>
                <p className="text-muted-foreground">days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Flame className="h-5 w-5 mr-2 text-red-500" /> 
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{weeklyProgress} of {weeklyGoal} workouts</span>
                  <span className="text-sm font-medium">{Math.round((weeklyProgress / weeklyGoal) * 100)}%</span>
                </div>
                <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" /> 
              Workout Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => (
                  <button {...props}>
                    {renderCalendarDay(date)}
                  </button>
                )
              }}
            />

            <div className="mt-4 flex flex-wrap gap-2 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs">Cardio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">Strength</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Flexibility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-xs">Rest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-200 dark:bg-amber-800" />
                <span className="text-xs">Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-300 dark:bg-purple-800" />
                <span className="text-xs">Cheat Day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <Button onClick={markCheatDay} disabled={!selectedDate} variant="outline">
            Mark Selected as Cheat Day
          </Button>

          {showCheatDayTips && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cheat Day Recovery Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Hydration</h3>
                  <p className="text-sm text-muted-foreground">Drink at least 3 liters of water to flush out excess sodium and toxins.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">HIIT Workout</h3>
                  <p className="text-sm text-muted-foreground">A 20-minute high-intensity interval training session can help boost your metabolism.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Intermittent Fasting</h3>
                  <p className="text-sm text-muted-foreground">Consider a 16:8 fasting window to give your digestive system a break.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Fiber-Rich Foods</h3>
                  <p className="text-sm text-muted-foreground">Include vegetables and whole grains to aid digestion and regulate blood sugar.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNavbar currentPage="/streaks" />
    </div>
  );
};

export default Streaks;
