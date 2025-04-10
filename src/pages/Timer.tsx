
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import BottomNavbar from '@/components/BottomNavbar';
import TimerForm from '@/components/timer/TimerForm';
import TimerComponent from '@/components/timer/TimerComponent';

const Timer = () => {
  const navigate = useNavigate();
  const [activeTimer, setActiveTimer] = useState<{ 
    minutes: number; 
    seconds: number; 
    label: string;
  } | null>(null);

  const handleStartTimer = (minutes: number, seconds: number, label: string) => {
    setActiveTimer({ minutes, seconds, label });
  };

  const handleTimerComplete = () => {
    console.log('Timer completed');
    // You could add additional functionality here, such as:
    // - Showing a motivational message
    // - Logging the completed session
    // - Suggesting the next activity
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16">
      <motion.header 
        className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <AlarmClock className="mr-2 h-6 w-6" /> 
          Workout Timer
        </h1>
      </motion.header>
      
      <main className="container mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          {activeTimer ? (
            <>
              <TimerComponent
                initialMinutes={activeTimer.minutes}
                initialSeconds={activeTimer.seconds}
                label={activeTimer.label}
                onComplete={handleTimerComplete}
              />
              
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTimer(null)}
                >
                  Set New Timer
                </Button>
              </div>
            </>
          ) : (
            <TimerForm 
              onStart={handleStartTimer} 
              presets={[
                { label: 'Workout', minutes: 20, seconds: 0 },
                { label: 'Rest', minutes: 2, seconds: 0 },
                { label: 'HIIT Round', minutes: 0, seconds: 45 },
                { label: 'Plank', minutes: 1, seconds: 0 },
                { label: 'Meditation', minutes: 5, seconds: 0 },
                { label: 'Stretching', minutes: 3, seconds: 0 },
              ]}
            />
          )}
        </div>
      </main>
      
      <BottomNavbar currentPage="home" />
    </div>
  );
};

export default Timer;
