
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogOut, User, Settings, Mail } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Failed to load profile",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Failed to log out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b py-4 px-6 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Profile</h1>
        </header>
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-4">Profile</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <Card className="border border-violet-light/20 shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-violet-dark to-indigo-dark"></div>
          <CardContent className="pt-0 relative">
            <div className="w-20 h-20 rounded-full bg-background border-4 border-card absolute -top-10 left-6 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="pt-12 space-y-2">
              <h2 className="text-2xl font-bold">
                {profile?.full_name || 'User'}
              </h2>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" /> 
                {profile?.username || 'user@example.com'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="gradient-card border border-violet-light/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-violet-DEFAULT" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p>{new Date(profile?.created_at || '').toLocaleDateString()}</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-violet-DEFAULT/50 text-violet-DEFAULT hover:bg-violet-DEFAULT/10"
                onClick={() => navigate('/profile/edit')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-card border border-indigo-light/20">
            <CardHeader>
              <CardTitle>Wellness Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.goals && profile.goals.length > 0 ? (
                <ul className="list-disc list-inside">
                  {profile.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No goals set yet</p>
              )}
              <Button 
                variant="outline" 
                className="w-full border-indigo-DEFAULT/50 text-indigo-DEFAULT hover:bg-indigo-DEFAULT/10"
                onClick={() => navigate('/profile/goals')}
              >
                Set Goals
              </Button>
            </CardContent>
          </Card>
        </div>

        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> 
          Log Out
        </Button>
      </main>

      <BottomNavbar currentPage="profile" />
    </div>
  );
};

export default Profile;
