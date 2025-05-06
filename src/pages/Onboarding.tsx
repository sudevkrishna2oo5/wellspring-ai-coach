
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Dumbbell, Home, Trophy, User } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [userData, setUserData] = useState({
    fullName: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    experienceLevel: 'beginner', // beginner, intermediate, advanced
    workoutPreference: 'home', // home or gym
    goals: [] as string[]
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.log("No active session, redirecting to auth page");
          navigate('/auth', { replace: true });
          return;
        }
        
        setCheckingAuth(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const experiences = [
    { value: 'beginner', label: 'Beginner (< 1 year)', description: 'New to fitness or just starting your journey' },
    { value: 'intermediate', label: 'Intermediate (1-3 years)', description: 'Regular workout routine with some experience' },
    { value: 'advanced', label: 'Advanced (3+ years)', description: 'Consistent training with advanced knowledge' }
  ];

  const commonGoals = [
    'Lose Weight',
    'Build Muscle',
    'Improve Cardio',
    'Increase Flexibility',
    'Reduce Stress',
    'Better Sleep',
    'Athletic Performance',
    'Overall Health'
  ];

  const handleGoalToggle = (goal: string) => {
    setUserData(prevState => {
      const currentGoals = [...prevState.goals];
      if (currentGoals.includes(goal)) {
        return { ...prevState, goals: currentGoals.filter(g => g !== goal) };
      } else {
        return { ...prevState, goals: [...currentGoals, goal] };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Update user profile with the collected data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.fullName,
          weight: parseFloat(userData.weight) || null,
          height: parseFloat(userData.height) || null,
          goals: userData.goals
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been setup successfully.",
        variant: "default",
      });
      
      // Navigate to home page after successful update
      navigate('/', { replace: true });
      
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelOnboarding = async () => {
    setLoading(true);
    try {
      // Sign out the user and redirect to auth page
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out. Please sign in again.",
      });
      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate required fields for each step
    if (step === 1) {
      if (!userData.fullName.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your name to continue",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 2) {
      if (!userData.height || !userData.weight) {
        toast({
          title: "Information required",
          description: "Please enter your height and weight to continue",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 3 && userData.goals.length === 0) {
      toast({
        title: "Goals required",
        description: "Please select at least one goal to continue",
        variant: "destructive",
      });
      return;
    }
    
    setStep(current => current + 1);
  };

  const prevStep = () => {
    setStep(current => current - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Welcome! Let's get to know you</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">What should we call you?</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Your name"
                  value={userData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Your age"
                  value={userData.age}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={userData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Your Body Stats</h2>
            <p className="text-center text-muted-foreground">This helps us personalize your experience</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  placeholder="Height in centimeters"
                  value={userData.height}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  placeholder="Weight in kilograms"
                  value={userData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Your Fitness Goals</h2>
            <p className="text-center text-muted-foreground">Select all that apply</p>
            
            <div className="grid grid-cols-2 gap-2">
              {commonGoals.map(goal => (
                <Button
                  key={goal}
                  type="button"
                  variant={userData.goals.includes(goal) ? "default" : "outline"}
                  className={`h-auto py-3 px-4 justify-start ${
                    userData.goals.includes(goal) 
                      ? "bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT text-white" 
                      : ""
                  }`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal}
                </Button>
              ))}
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Your Experience Level</h2>
            
            <div className="space-y-3">
              {experiences.map(exp => (
                <Card 
                  key={exp.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    userData.experienceLevel === exp.value 
                      ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20" 
                      : ""
                  }`}
                  onClick={() => setUserData({ ...userData, experienceLevel: exp.value })}
                >
                  <CardContent className="p-4 flex flex-col">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{exp.label}</h3>
                      <div className={`w-4 h-4 rounded-full ${
                        userData.experienceLevel === exp.value 
                          ? "bg-violet-500" 
                          : "border border-gray-300"
                      }`}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Workout Preference</h2>
            <p className="text-center text-muted-foreground">Where do you prefer to exercise?</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  userData.workoutPreference === 'home' 
                    ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20" 
                    : ""
                }`}
                onClick={() => setUserData({ ...userData, workoutPreference: 'home' })}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center py-8">
                  <Home className="h-12 w-12 text-violet-500 mb-2" />
                  <h3 className="font-medium text-lg">Home</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Workouts designed for limited equipment
                  </p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  userData.workoutPreference === 'gym' 
                    ? "border-violet-500 bg-violet-50/50 dark:bg-violet-950/20" 
                    : ""
                }`}
                onClick={() => setUserData({ ...userData, workoutPreference: 'gym' })}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center py-8">
                  <Dumbbell className="h-12 w-12 text-violet-500 mb-2" />
                  <h3 className="font-medium text-lg">Gym</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Full access to gym equipment
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );
        
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center"
          >
            <div className="inline-flex p-4 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
              <Trophy className="h-12 w-12 text-violet-500" />
            </div>
            
            <h2 className="text-2xl font-bold">You're all set!</h2>
            
            <p className="text-muted-foreground">
              Based on your profile, we've created a personalized plan for you. 
              Get ready to achieve your fitness goals!
            </p>
            
            <div className="pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-r-transparent rounded-full"></div>
                    Setting up...
                  </div>
                ) : (
                  <>
                    Finish Setup <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  // If still checking auth, show a loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500/5 via-background to-indigo-500/5 flex flex-col">
      <main className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {/* Progress indicator */}
            <div className="text-sm text-muted-foreground">Step {step} of 6</div>
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={prevStep} disabled={loading}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={cancelOnboarding} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT transition-all duration-300" 
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          {renderStep()}
          
          {step < 6 && (
            <div className="mt-8">
              <Button 
                onClick={nextStep} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
