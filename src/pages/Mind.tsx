
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ChevronLeft, Brain, Moon, Plus, Timer, AlarmCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { format } from 'date-fns';
import { SleepSummary } from '@/components/sleep/SleepSummary';
import { SleepChart } from '@/components/sleep/SleepChart';
import { getSleepAnalytics, SleepAnalytics } from '@/utils/sleepAnalytics';

type MeditationSession = Tables<"meditation">;
type SleepRecord = Tables<"sleep">;

const Mind = () => {
  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'meditation' | 'sleep'>('sleep');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sleepAnalytics, setSleepAnalytics] = useState<SleepAnalytics | null>(null);
  
  const [meditationForm, setMeditationForm] = useState({
    duration: '',
    type: 'mindfulness',
    notes: '',
  });
  
  const [sleepForm, setSleepForm] = useState({
    hours: '',
    quality_rating: '',
    notes: '',
    bedtime: format(new Date().setHours(22, 0), 'HH:mm'),
    wakeup: format(new Date().setHours(7, 0), 'HH:mm'),
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
        // Fetch meditation data
        const { data: meditationData, error: meditationError } = await supabase
          .from('meditation')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);
        
        if (meditationError) throw meditationError;
        setMeditationSessions(meditationData || []);
        
        // Fetch sleep data
        const { data: sleepData, error: sleepError } = await supabase
          .from('sleep')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);
        
        if (sleepError) throw sleepError;
        setSleepRecords(sleepData || []);

        // Calculate sleep analytics
        if (sleepData && sleepData.length > 0) {
          const analytics = getSleepAnalytics(sleepData);
          setSleepAnalytics(analytics);
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

  const handleMeditationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeditationForm({
      ...meditationForm,
      [name]: value
    });
  };

  const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSleepForm({
      ...sleepForm,
      [name]: value
    });
  };

  const handleMeditationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    try {
      const newMeditation = {
        user_id: session.session.user.id,
        duration: parseInt(meditationForm.duration),
        type: meditationForm.type,
        notes: meditationForm.notes,
      };
      
      const { data, error } = await supabase
        .from('meditation')
        .insert([newMeditation])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Meditation session added!",
        variant: "default",
      });
      
      setMeditationSessions([data[0], ...meditationSessions]);
      setShowAddForm(false);
      setMeditationForm({
        duration: '',
        type: 'mindfulness',
        notes: '',
      });
    } catch (error: any) {
      toast({
        title: "Error adding meditation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    try {
      const newSleep = {
        user_id: session.session.user.id,
        hours: parseFloat(sleepForm.hours),
        quality_rating: parseInt(sleepForm.quality_rating),
        notes: sleepForm.notes,
      };
      
      const { data, error } = await supabase
        .from('sleep')
        .insert([newSleep])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Sleep record added!",
        variant: "default",
      });
      
      const updatedRecords = [data[0], ...sleepRecords];
      setSleepRecords(updatedRecords);
      
      // Update analytics with new record
      const analytics = getSleepAnalytics(updatedRecords);
      setSleepAnalytics(analytics);
      
      setShowAddForm(false);
      setSleepForm({
        hours: '',
        quality_rating: '',
        notes: '',
        bedtime: format(new Date().setHours(22, 0), 'HH:mm'),
        wakeup: format(new Date().setHours(7, 0), 'HH:mm'),
      });
    } catch (error: any) {
      toast({
        title: "Error adding sleep record",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-2xl font-bold">Mind & Sleep</h1>
      </header>
      
      <main className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={activeTab === 'meditation' ? "default" : "outline"}
              className={activeTab === 'meditation' ? "bg-violet-DEFAULT hover:bg-violet-dark" : ""}
              onClick={() => setActiveTab('meditation')}
            >
              <Brain className="mr-2 h-4 w-4" />
              Meditation
            </Button>
            <Button 
              variant={activeTab === 'sleep' ? "default" : "outline"}
              className={activeTab === 'sleep' ? "bg-indigo-DEFAULT hover:bg-indigo-dark" : ""}
              onClick={() => setActiveTab('sleep')}
            >
              <Moon className="mr-2 h-4 w-4" />
              Sleep
            </Button>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`bg-gradient-to-r ${
              activeTab === 'meditation' 
                ? "from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark" 
                : "from-indigo-DEFAULT to-blue-500 hover:from-indigo-dark hover:to-blue-600"
            } transition-all duration-300`}
          >
            {showAddForm ? 'Cancel' : <>Add {activeTab === 'meditation' ? 'Session' : 'Record'} <Plus className="ml-2 h-4 w-4" /></>}
          </Button>
        </div>

        {/* Sleep Dashboard */}
        {activeTab === 'sleep' && !loading && sleepAnalytics && (
          <div className={`space-y-6 ${showAddForm ? 'mt-6' : ''}`}>
            <SleepSummary analytics={sleepAnalytics} />
            <SleepChart sleepRecords={sleepRecords} />
          </div>
        )}
        
        {showAddForm && (
          <Card className={`mb-6 gradient-card ${activeTab === 'meditation' ? 'border-violet-light/30' : 'border-indigo-light/30'}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                {activeTab === 'meditation' 
                  ? <><Brain className="mr-2 h-5 w-5 text-violet-DEFAULT" /> Log a Meditation Session</>
                  : <><Moon className="mr-2 h-5 w-5 text-indigo-DEFAULT" /> Log a Sleep Record</>
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'meditation' ? (
                <form onSubmit={handleMeditationSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input 
                      id="duration" 
                      name="duration" 
                      type="number" 
                      required
                      value={meditationForm.duration} 
                      onChange={handleMeditationChange} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      name="type"
                      value={meditationForm.type}
                      onChange={handleMeditationChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="mindfulness">Mindfulness</option>
                      <option value="focus">Focus</option>
                      <option value="stress-reduction">Stress Reduction</option>
                      <option value="sleep">Sleep</option>
                      <option value="guided">Guided</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={meditationForm.notes} 
                      onChange={handleMeditationChange} 
                      className="mt-1"
                      placeholder="How did you feel during this session?"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                  >
                    Save Session
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSleepSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hours">Hours Slept</Label>
                      <Input 
                        id="hours" 
                        name="hours" 
                        type="number" 
                        step="0.5"
                        required
                        value={sleepForm.hours} 
                        onChange={handleSleepChange} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quality_rating">Sleep Quality (1-10)</Label>
                      <Input 
                        id="quality_rating" 
                        name="quality_rating" 
                        type="number" 
                        min="1"
                        max="10"
                        required
                        value={sleepForm.quality_rating} 
                        onChange={handleSleepChange} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedtime">Bedtime</Label>
                      <Input 
                        id="bedtime" 
                        name="bedtime" 
                        type="time"
                        value={sleepForm.bedtime} 
                        onChange={handleSleepChange} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="wakeup">Wake-up Time</Label>
                      <Input 
                        id="wakeup" 
                        name="wakeup" 
                        type="time"
                        value={sleepForm.wakeup} 
                        onChange={handleSleepChange} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={sleepForm.notes} 
                      onChange={handleSleepChange} 
                      className="mt-1"
                      placeholder="How did you feel when you woke up?"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-DEFAULT to-blue-500 hover:from-indigo-dark hover:to-blue-600"
                  >
                    Save Record
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {activeTab === 'meditation' ? (
              meditationSessions.length > 0 ? (
                meditationSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-all duration-300 gradient-card border-violet-light/20">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg capitalize">{session.type} Meditation</h3>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Timer className="h-4 w-4 mr-1" /> {session.duration} minutes
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-3 border-t border-border pt-2">
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">No meditation sessions logged</h3>
                  <p className="text-muted-foreground">Track your meditation practice to improve your mindfulness</p>
                </div>
              )
            ) : sleepRecords.length > 0 ? (
              sleepRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-all duration-300 gradient-card border-indigo-light/20">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-indigo-DEFAULT" />
                          {record.hours} hours
                          {record.hours < 6 && (
                            <AlertTriangle className="h-4 w-4 ml-2 text-amber-DEFAULT" title="Less than recommended" />
                          )}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                  key={i}
                                  className={`h-2 w-6 first:rounded-l-full last:rounded-r-full mr-0.5 ${
                                    i < Math.ceil(record.quality_rating / 2) 
                                      ? 'bg-indigo-DEFAULT' 
                                      : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground ml-2">Quality: {record.quality_rating}/10</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    {record.notes && (
                      <div className="mt-3 border-t border-border pt-2">
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <Moon className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No sleep records logged</h3>
                <p className="text-muted-foreground">Track your sleep patterns to improve your rest</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNavbar currentPage="mind" />
    </div>
  );
};

export default Mind;
