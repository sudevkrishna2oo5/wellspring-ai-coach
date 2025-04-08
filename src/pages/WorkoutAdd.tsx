
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];

const WorkoutAdd = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Omit<WorkoutInsert, 'user_id' | 'date'>>({
    name: '',
    type: '',
    duration: '',
    calories: '',
    notes: ''
  });

  const handleChange = (field: keyof typeof workout, value: string) => {
    setWorkout(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Authentication required",
          description: "Please login to save workouts",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { error } = await supabase.from('workouts').insert({
        user_id: session.session.user.id,
        name: workout.name,
        type: workout.type,
        duration: parseInt(workout.duration as string),
        calories: workout.calories ? parseInt(workout.calories as string) : null,
        notes: workout.notes
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your workout has been logged.",
      });
      navigate('/workout');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b py-4 px-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workout')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Add Workout</h1>
      </header>

      <main className="p-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input
                  id="name"
                  value={workout.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Morning Run, Upper Body Strength"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={workout.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    placeholder="30"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories Burned</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={workout.calories}
                    onChange={(e) => handleChange('calories', e.target.value)}
                    placeholder="200"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={workout.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="How did you feel? What went well? What could improve?"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Workout"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default WorkoutAdd;
