
import { useState } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

type TimerFormProps = {
  onStart: (minutes: number, seconds: number, label: string) => void;
  presets?: { label: string; minutes: number; seconds: number }[];
};

const TimerForm = ({ onStart, presets }: TimerFormProps) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [label, setLabel] = useState('Workout');

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num <= 180) {
      setMinutes(num);
    } else if (value === '') {
      setMinutes(0);
    }
  };

  const handleSecondsChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num < 60) {
      setSeconds(num);
    } else if (value === '') {
      setSeconds(0);
    }
  };

  const adjustMinutes = (amount: number) => {
    setMinutes(prev => Math.max(0, Math.min(180, prev + amount)));
  };

  const adjustSeconds = (amount: number) => {
    setSeconds(prev => Math.max(0, Math.min(59, prev + amount)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes > 0 || seconds > 0) {
      onStart(minutes, seconds, label);
    }
  };

  const handlePresetClick = (preset: { label: string; minutes: number; seconds: number }) => {
    setMinutes(preset.minutes);
    setSeconds(preset.seconds);
    setLabel(preset.label);
    onStart(preset.minutes, preset.seconds, preset.label);
  };

  const defaultPresets = [
    { label: 'Quick HIIT', minutes: 4, seconds: 0 },
    { label: 'Rest Period', minutes: 1, seconds: 0 },
    { label: 'Water Break', minutes: 0, seconds: 30 },
  ];

  const timerPresets = presets || defaultPresets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="gradient-card border-violet-light/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-DEFAULT" />
            Set Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timer-label">Timer Label</Label>
                <Input
                  id="timer-label"
                  placeholder="e.g., Workout, Rest, Meditation"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustMinutes(-1)}
                        disabled={minutes <= 0}
                        className="rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        max="180"
                        value={minutes}
                        onChange={(e) => handleMinutesChange(e.target.value)}
                        className="rounded-none text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustMinutes(1)}
                        disabled={minutes >= 180}
                        className="rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Label className="text-xs text-center block mt-1">Minutes</Label>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustSeconds(-5)}
                        disabled={seconds <= 0}
                        className="rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => handleSecondsChange(e.target.value)}
                        className="rounded-none text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustSeconds(5)}
                        disabled={seconds >= 59}
                        className="rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Label className="text-xs text-center block mt-1">Seconds</Label>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
              disabled={minutes === 0 && seconds === 0}
            >
              Start Timer
            </Button>
            
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Presets</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {timerPresets.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                    className="text-xs"
                  >
                    {preset.label} ({preset.minutes}:{preset.seconds.toString().padStart(2, '0')})
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TimerForm;
