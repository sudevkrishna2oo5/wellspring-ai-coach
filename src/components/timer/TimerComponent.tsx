
import { useState, useEffect, useRef } from 'react';
import { Timer, Pause, Play, RotateCcw, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type TimerProps = {
  initialMinutes?: number;
  initialSeconds?: number;
  label?: string;
  onComplete?: () => void;
};

const TimerComponent = ({
  initialMinutes = 0,
  initialSeconds = 0,
  label = 'Workout Timer',
  onComplete,
}: TimerProps) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();
  
  // Total initial time in seconds for progress calculation
  const totalInitialTime = useRef((initialMinutes * 60) + initialSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Create audio element on mount
  useEffect(() => {
    const audio = new Audio('/assets/timer-complete.mp3');
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval as ReturnType<typeof setInterval>);
            setIsActive(false);
            if (onComplete) onComplete();
            
            // Play sound when timer completes
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch(error => {
                console.error('Error playing audio:', error);
              });
            }
            
            toast({
              title: 'Timer Complete!',
              description: `Your ${label} has finished.`,
              duration: 5000,
            });
            
            return;
          }
          setMinutes(prevMinutes => prevMinutes - 1);
          setSeconds(59);
        } else {
          setSeconds(prevSeconds => prevSeconds - 1);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, label, onComplete, soundEnabled, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? 'Sound disabled' : 'Sound enabled',
      duration: 2000,
    });
  };

  // Calculate remaining time as a percentage for the progress bar
  const calculateProgress = () => {
    const currentTotalSeconds = (minutes * 60) + seconds;
    const initialTotalSeconds = totalInitialTime.current;
    if (initialTotalSeconds === 0) return 100;
    return ((initialTotalSeconds - currentTotalSeconds) / initialTotalSeconds) * 100;
  };

  // Format time display
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="gradient-card border-indigo-light/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              <Timer className="mr-2 h-5 w-5 text-indigo-DEFAULT" />
              <h3 className="font-medium text-lg">{label}</h3>
            </div>
            
            <div className="text-4xl font-bold mb-4 font-mono">
              {formatTime(minutes, seconds)}
            </div>
            
            <Progress 
              value={calculateProgress()} 
              className="w-full mb-6 h-2"
              indicatorClassName="bg-indigo-DEFAULT"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTimer}
                className="border-indigo-DEFAULT/50 text-indigo-DEFAULT hover:bg-indigo-DEFAULT/10"
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="border-violet-DEFAULT/50 text-violet-DEFAULT hover:bg-violet-DEFAULT/10"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
                className={`${
                  soundEnabled 
                    ? "border-green-500/50 text-green-500 hover:bg-green-500/10" 
                    : "border-red-500/50 text-red-500 hover:bg-red-500/10"
                }`}
              >
                {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TimerComponent;
