import React, { useState } from 'react';
import { ArrowLeft, Calendar, Timer, Clock, Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import BottomNavbar from '@/components/BottomNavbar';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

const WorkoutPlanner = () => {
  const navigate = useNavigate();
  const { toast: hookToast } = useToast();
  
  // BMI State
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  
  // Workout Plan State
  const [plans, setPlans] = useState<any[]>([]);

  const workoutPlanSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    type: z.string().min(1, { message: "Please select a workout type" }),
    duration: z.string().min(1, { message: "Duration is required" }),
    date: z.string().min(1, { message: "Date is required" }),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof workoutPlanSchema>>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      title: "",
      type: "",
      duration: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const calculateBMI = () => {
    if (!height || !weight) {
      toast.error('Please enter both height and weight');
      return;
    }
    
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    
    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters <= 0 || weightInKg <= 0) {
      toast.error('Please enter valid height and weight values');
      return;
    }
    
    const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
    setBmi(parseFloat(calculatedBMI.toFixed(1)));
    
    // Determine BMI category
    let category = '';
    
    if (calculatedBMI < 18.5) {
      category = 'Underweight';
    } else if (calculatedBMI >= 18.5 && calculatedBMI < 25) {
      category = 'Normal weight';
    } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
      category = 'Overweight';
    } else {
      category = 'Obesity';
    }
    
    setBmiCategory(category);
    
    toast.success(`Your BMI is ${calculatedBMI.toFixed(1)} - ${category}`);
  };

  const onSubmit = (data: z.infer<typeof workoutPlanSchema>) => {
    // In a real app, this would be saved to the database
    const newPlan = {
      id: Date.now().toString(),
      ...data,
    };
    
    setPlans([newPlan, ...plans]);
    toast.success('Workout plan added successfully');
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="fixed top-0 inset-x-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Fitness Planner</h1>
        </div>
      </header>

      <main className="pt-16 pb-16 px-4">
        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="bmi">BMI Calculator</TabsTrigger>
            <TabsTrigger value="planner">Workout Planner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">BMI Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input 
                        id="height" 
                        placeholder="e.g. 175" 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input 
                        id="weight" 
                        placeholder="e.g. 70" 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateBMI} className="w-full">Calculate BMI</Button>
                  
                  {bmi !== null && (
                    <div className="mt-6 text-center">
                      <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm">
                        Your BMI: <span className="font-bold">{bmi}</span>
                      </div>
                      <p className="mt-2 text-sm">
                        Category: <span className="font-medium">{bmiCategory}</span>
                      </p>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">BMI Categories</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Underweight</span>
                            <span>&lt; 18.5</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Normal weight</span>
                            <span>18.5 - 24.9</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Overweight</span>
                            <span>25 - 29.9</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Obesity</span>
                            <span>&gt;= 30</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="planner">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Workout Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workout Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Morning Run" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workout Type</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Select type</option>
                                <option value="cardio">Cardio</option>
                                <option value="strength">Strength</option>
                                <option value="flexibility">Flexibility</option>
                                <option value="sports">Sports</option>
                                <option value="other">Other</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (mins)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Any additional notes for your workout"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" /> Save Workout Plan
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Your Workout Plans</h3>
              
              {plans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No workout plans yet. Create one to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <Card key={plan.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{plan.title}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{plan.type}</p>
                          </div>
                          <div className="bg-primary/10 px-2 py-1 rounded text-xs">
                            {plan.duration} mins
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" /> {plan.date}
                        </div>
                        {plan.notes && (
                          <p className="mt-2 text-sm border-t pt-2">{plan.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavbar currentPage="workout" />
    </div>
  );
};

export default WorkoutPlanner;
