
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ChevronLeft, Plus, Utensils, Bot, Sparkles } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Meal = Tables<"meals">;

const Meals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    meal_type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [aiMealDescription, setAiMealDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getMeals = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      
      if (error) {
        toast({
          title: "Error fetching meals",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setMeals(data || []);
      }
      setLoading(false);
    };
    
    getMeals();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateNutritionWithAI = async () => {
    if (!aiMealDescription.trim()) {
      toast({
        title: "Please describe your meal",
        description: "Enter a meal description to analyze",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`https://rfhkokggjvuvvfhlzomb.functions.supabase.co/analyze-meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          mealDescription: aiMealDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze meal');
      }

      const nutritionData = await response.json();
      
      // Update form with AI-calculated values
      setFormData({
        name: aiMealDescription.split('.')[0] || aiMealDescription.substring(0, 30),
        meal_type: formData.meal_type,
        calories: String(nutritionData.calories || ''),
        protein: String(nutritionData.protein || ''),
        carbs: String(nutritionData.carbs || ''),
        fat: String(nutritionData.fat || '')
      });

      setShowAiDialog(false);
      toast({
        title: "Nutrition calculated!",
        description: "Your meal has been analyzed",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error analyzing meal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      navigate('/auth');
      return;
    }
    
    try {
      const newMeal = {
        user_id: session.session.user.id,
        name: formData.name,
        meal_type: formData.meal_type,
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null,
        fat: formData.fat ? parseFloat(formData.fat) : null,
      };
      
      const { data, error } = await supabase
        .from('meals')
        .insert([newMeal])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Meal added successfully!",
        variant: "default",
      });
      
      setMeals([data[0], ...meals]);
      setShowAddForm(false);
      setFormData({
        name: '',
        meal_type: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      });
      setAiMealDescription('');
    } catch (error: any) {
      toast({
        title: "Error adding meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getMealTypeColor = (mealType: string) => {
    const types = {
      breakfast: "bg-blue-500",
      lunch: "bg-green-500",
      dinner: "bg-orange-500",
      snack: "bg-purple-500"
    };
    return types[mealType as keyof typeof types] || "bg-gray-500";
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
        <h1 className="text-2xl font-bold">Meals</h1>
      </header>
      
      <main className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-dark to-indigo-DEFAULT bg-clip-text text-transparent">
            Your Nutrition Log
          </h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark transition-all duration-300"
          >
            {showAddForm ? 'Cancel' : <>Add Meal <Plus className="ml-2 h-4 w-4" /></>}
          </Button>
        </div>
        
        {showAddForm && (
          <Card className="mb-6 gradient-card border-violet-light/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-violet-DEFAULT" />
                  Log a New Meal
                </div>
                <Button 
                  variant="outline"
                  className="flex items-center border-dashed border-violet-DEFAULT/50 text-violet-DEFAULT hover:bg-violet-DEFAULT/10"
                  onClick={() => setShowAiDialog(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Assist
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Meal Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meal_type">Meal Type</Label>
                    <select
                      id="meal_type"
                      name="meal_type"
                      value={formData.meal_type}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories (kcal)</Label>
                      <Input 
                        id="calories" 
                        name="calories" 
                        type="number" 
                        value={formData.calories} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input 
                        id="protein" 
                        name="protein" 
                        type="number" 
                        step="0.1" 
                        value={formData.protein} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input 
                        id="carbs" 
                        name="carbs" 
                        type="number" 
                        step="0.1" 
                        value={formData.carbs} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input 
                        id="fat" 
                        name="fat" 
                        type="number" 
                        step="0.1" 
                        value={formData.fat} 
                        onChange={handleInputChange} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                  >
                    Save Meal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-violet-DEFAULT" />
                AI Meal Assistant
              </DialogTitle>
              <DialogDescription>
                Describe your meal in detail for accurate nutrition calculation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="E.g., Grilled chicken sandwich with cheese, lettuce, tomato, and mayo on whole wheat bread"
                className="min-h-32"
                value={aiMealDescription}
                onChange={(e) => setAiMealDescription(e.target.value)}
              />
              <Button 
                className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT"
                onClick={calculateNutritionWithAI}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  <>Calculate Nutrition <Sparkles className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
          </div>
        ) : meals.length > 0 ? (
          <div className="space-y-4">
            {meals.map((meal) => (
              <Card key={meal.id} className="overflow-hidden hover:shadow-md transition-all duration-300 gradient-card border-indigo-light/20">
                <div className={`h-2 ${getMealTypeColor(meal.meal_type || 'breakfast')}`}></div>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{meal.meal_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{meal.calories} kcal</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(meal.date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p>{meal.protein}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p>{meal.carbs}g</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p>{meal.fat}g</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Utensils className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">No meals logged yet</h3>
            <p className="text-muted-foreground">Add your first meal to start tracking your nutrition</p>
          </div>
        )}
      </main>
      
      <BottomNavbar currentPage="meals" />
    </div>
  );
};

export default Meals;
