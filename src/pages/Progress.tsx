
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { BarChart2, ChevronLeft, Plus, Target } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { format, parseISO, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type ProgressRecord = Tables<"progress">;

const Progress = () => {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: '',
    body_fat_percentage: '',
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }
      
      try {
        // Fetch progress data
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .order('date', { ascending: true });
        
        if (progressError) throw progressError;
        setProgressRecords(progressData || []);
        
        // Fetch user goals
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('goals')
          .eq('id', session.session.user.id)
          .single();
        
        if (profileError) {
          if (profileError.code !== 'PGRST116') { // Not found error
            throw profileError;
          }
        } else {
          setUserGoals(profileData?.goals || []);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    try {
      const newProgress = {
        user_id: session.session.user.id,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
      };
      
      const { data, error } = await supabase
        .from('progress')
        .insert([newProgress])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Progress logged successfully!",
        variant: "default",
      });
      
      setProgressRecords([...progressRecords, data[0]]);
      setShowAddForm(false);
      setFormData({
        weight: '',
        body_fat_percentage: '',
      });
    } catch (error: any) {
      toast({
        title: "Error logging progress",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    const updatedGoals = [...userGoals, newGoal.trim()];
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ goals: updatedGoals })
        .eq('id', session.session.user.id);
      
      if (error) throw error;
      
      setUserGoals(updatedGoals);
      setNewGoal('');
      setShowGoalForm(false);
      
      toast({
        title: "Goal added successfully!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error adding goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveGoal = async (index: number) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    const updatedGoals = userGoals.filter((_, i) => i !== index);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ goals: updatedGoals })
        .eq('id', session.session.user.id);
      
      if (error) throw error;
      
      setUserGoals(updatedGoals);
      
      toast({
        title: "Goal removed",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error removing goal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Format data for charts
  const chartData = progressRecords.map(record => ({
    date: format(new Date(record.date), 'MMM dd'),
    weight: record.weight,
    bodyFat: record.body_fat_percentage
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16">
      <header className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white">
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Progress</h1>
      </header>
      
      <main className="p-4 max-w-4xl mx-auto">
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="log">Log Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            <Card className="gradient-card border-indigo-light/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-indigo-DEFAULT" />
                  Your Progress Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center my-10">
                    <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" orientation="left" stroke="#818CF8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(17,24,39,0.8)', borderColor: '#374151' }} />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight (kg/lbs)" 
                          stroke="#818CF8" 
                          strokeWidth={2} 
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="bodyFat" 
                          name="Body Fat %" 
                          stroke="#A78BFA" 
                          strokeWidth={2} 
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-medium">No progress data available</h3>
                    <p className="text-muted-foreground">
                      Start logging your measurements to visualize your progress
                    </p>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                    >
                      Log First Measurement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {progressRecords.length > 0 && (
              <Card className="gradient-card border-violet-light/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Weight</th>
                        <th className="text-left py-3 px-4">Body Fat %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressRecords.slice().reverse().map((record, i) => (
                        <tr key={record.id} className={i % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'}>
                          <td className="py-3 px-4">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                          <td className="py-3 px-4">{record.weight || '-'}</td>
                          <td className="py-3 px-4">{record.body_fat_percentage || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-6">
            <Card className="gradient-card border-violet-light/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-violet-DEFAULT" />
                    Your Goals
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowGoalForm(!showGoalForm)}
                    className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                  >
                    {showGoalForm ? 'Cancel' : <>Add Goal <Plus className="ml-1 h-4 w-4" /></>}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showGoalForm && (
                  <div className="mb-4 flex space-x-2">
                    <Input 
                      value={newGoal} 
                      onChange={(e) => setNewGoal(e.target.value)} 
                      placeholder="Enter your new goal..." 
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddGoal}
                      className="bg-violet-DEFAULT hover:bg-violet-dark"
                    >
                      Add
                    </Button>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center my-10">
                    <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
                  </div>
                ) : userGoals.length > 0 ? (
                  <ul className="space-y-3">
                    {userGoals.map((goal, index) => (
                      <li key={index} className="flex items-start justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT flex items-center justify-center text-white text-xs">
                            {index + 1}
                          </div>
                          <span>{goal}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveGoal(index)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-medium">No goals set yet</h3>
                    <p className="text-muted-foreground">
                      Set your fitness and wellness goals to stay motivated
                    </p>
                    <Button 
                      onClick={() => setShowGoalForm(true)}
                      className="mt-4 bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                    >
                      Add Your First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="log">
            <Card className="gradient-card border-indigo-light/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-indigo-DEFAULT" />
                  Log Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input 
                        id="weight" 
                        name="weight" 
                        type="number" 
                        step="0.1" 
                        value={formData.weight} 
                        onChange={handleInputChange} 
                        className="mt-1"
                        placeholder="Enter your weight"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="body_fat_percentage">Body Fat %</Label>
                      <Input 
                        id="body_fat_percentage" 
                        name="body_fat_percentage" 
                        type="number" 
                        step="0.1" 
                        value={formData.body_fat_percentage} 
                        onChange={handleInputChange} 
                        className="mt-1"
                        placeholder="Enter your body fat percentage"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                    disabled={!formData.weight && !formData.body_fat_percentage}
                  >
                    Log Progress
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavbar currentPage="progress" />
    </div>
  );
};

export default Progress;
