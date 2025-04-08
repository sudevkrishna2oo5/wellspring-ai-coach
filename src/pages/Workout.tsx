import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, ArrowLeft, Plus } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';

const Workout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState([]);
  
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

        {workouts.length === 0 ? (
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
            {/* Workout cards will be mapped here when we have data */}
          </div>
        )}
      </main>

      <BottomNavbar currentPage="workout" />
    </div>
  );
};

export default Workout;
