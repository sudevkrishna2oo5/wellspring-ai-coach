
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, ArrowLeft, Plus, Calendar, Clock, Flame, Trash2 } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { format } from 'date-fns';
import { toast as sonnerToast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'];

const Workout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch workouts on component mount
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          toast({
            title: "Authentication required",
            description: "Please login to view workouts",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        
        setWorkouts(data || []);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast({
          title: "Failed to load workouts",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [navigate, toast]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state to remove the deleted workout
      setWorkouts(workouts.filter(workout => workout.id !== id));
      
      sonnerToast.success("Workout deleted successfully");
    } catch (error) {
      console.error('Error deleting workout:', error);
      sonnerToast.error("Failed to delete workout");
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b py-4 px-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Workouts</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Recent Workouts</h2>
          <Button size="sm" onClick={() => navigate('/workout/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : workouts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No workouts logged yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/workout/add')}
              >
                Add Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <WorkoutCard 
                key={workout.id} 
                workout={workout} 
                onDelete={() => handleDelete(workout.id)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavbar currentPage="workout" />
    </div>
  );
};

interface WorkoutCardProps {
  workout: Workout;
  onDelete: () => void;
}

const WorkoutCard = ({ workout, onDelete }: WorkoutCardProps) => {
  const workoutTypeColors = {
    cardio: "bg-blue-100 text-blue-800",
    strength: "bg-red-100 text-red-800",
    flexibility: "bg-green-100 text-green-800",
    sports: "bg-yellow-100 text-yellow-800",
    other: "bg-purple-100 text-purple-800",
  };

  const typeColor = workoutTypeColors[workout.type as keyof typeof workoutTypeColors] || workoutTypeColors.other;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{workout.name}</h3>
            <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${typeColor}`}>
              {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(new Date(workout.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{workout.duration} mins</span>
          </div>
          {workout.calories && (
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-1" />
              <span>{workout.calories} kcal</span>
            </div>
          )}
        </div>
        {workout.notes && (
          <div className="mt-3 pt-3 border-t text-sm">
            <p className="text-muted-foreground">{workout.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Workout;
