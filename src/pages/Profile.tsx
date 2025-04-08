
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { User, LogOut, Settings, ChevronLeft, Camera } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type Profile = Tables<"profiles">;

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    height: '',
    weight: '',
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        setFormData({
          username: data?.username || '',
          full_name: data?.full_name || '',
          height: data?.height?.toString() || '',
          weight: data?.weight?.toString() || '',
        });
      } catch (error: any) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
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
      const updates = {
        username: formData.username,
        full_name: formData.full_name,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.session.user.id)
        .select();
      
      if (error) throw error;
      
      setProfile(data[0]);
      setEditing(false);
      
      toast({
        title: "Profile updated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Failed to log out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16">
      <header className="py-4 px-6 flex items-center justify-between bg-gradient-to-r from-violet-dark to-indigo-dark text-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 text-white hover:bg-white/10" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </header>
      
      <main className="container max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center my-10">
            <div className="animate-pulse h-6 w-6 rounded-full bg-violet-DEFAULT"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-DEFAULT to-indigo-DEFAULT text-white text-xl">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background border-2"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{profile?.full_name || 'User'}</h2>
                <p className="text-muted-foreground">{profile?.username || ''}</p>
              </div>
            </div>
            
            <Card className="gradient-card border-violet-light/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-violet-DEFAULT" />
                    Personal Information
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditing(!editing)}
                    className={editing ? "bg-violet-DEFAULT/10 border-violet-DEFAULT/50 text-violet-DEFAULT" : ""}
                  >
                    {editing ? 'Cancel' : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  Manage your personal profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input 
                        id="full_name" 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input 
                          id="height" 
                          name="height" 
                          type="number" 
                          step="0.1" 
                          value={formData.height} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input 
                          id="weight" 
                          name="weight" 
                          type="number" 
                          step="0.1" 
                          value={formData.weight} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                    >
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{profile?.username || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Height</p>
                          <p className="font-medium">{profile?.height ? `${profile.height} cm` : 'Not set'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-medium">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="gradient-card border-indigo-light/20">
              <CardHeader>
                <CardTitle className="text-lg">
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates and reminders</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">App Preferences</p>
                      <p className="text-sm text-muted-foreground">Customize your experience</p>
                    </div>
                    <Button variant="outline">Customize</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="font-medium">Account Security</p>
                      <p className="text-sm text-muted-foreground">Update password and security options</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              onClick={handleLogout}
              variant="destructive"
              className="w-full mb-10"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        )}
      </main>
      
      <BottomNavbar currentPage="profile" />
    </div>
  );
};

export default Profile;
