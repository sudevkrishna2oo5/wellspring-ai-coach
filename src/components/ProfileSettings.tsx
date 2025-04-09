import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Bell, Globe, Shield, ArrowRight } from 'lucide-react';

// Define types for our custom tables that aren't in the generated types yet
interface EmailSettings {
  id: string;
  daily_motivation: boolean;
  weekly_summary: boolean;
  goal_reminders: boolean;
  special_offers: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AppPreferences {
  id: string;
  theme: string;
  notifications_enabled: boolean;
  language: string;
  display_units: string;
  created_at?: string;
  updated_at?: string;
}

interface SecuritySettings {
  id: string;
  two_factor_enabled: boolean;
  login_history?: any;
  last_password_change?: string;
  created_at?: string;
  updated_at?: string;
}

export function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    id: '',
    daily_motivation: true,
    weekly_summary: true,
    goal_reminders: true,
    special_offers: false
  });
  const [appSettings, setAppSettings] = useState<AppPreferences>({
    id: '',
    theme: 'system',
    notifications_enabled: true,
    language: 'en',
    display_units: 'metric'
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    id: '',
    two_factor_enabled: false
  });
  
  const { toast } = useToast();

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const { error } = await (supabase
        .from('email_settings' as any)
        .update({
          daily_motivation: emailSettings.daily_motivation,
          weekly_summary: emailSettings.weekly_summary,
          goal_reminders: emailSettings.goal_reminders,
          special_offers: emailSettings.special_offers
        } as any)
        .eq('id', session.session.user.id));
        
      if (error) throw error;
      
      toast({
        title: "Settings updated",
        description: "Your email notification settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
      console.error('Error updating email settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAppPreferences = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const { error } = await (supabase
        .from('app_preferences' as any)
        .update({
          theme: appSettings.theme,
          notifications_enabled: appSettings.notifications_enabled,
          language: appSettings.language,
          display_units: appSettings.display_units
        } as any)
        .eq('id', session.session.user.id));
        
      if (error) throw error;
      
      toast({
        title: "Preferences updated",
        description: "Your app preferences have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update app preferences",
        variant: "destructive",
      });
      console.error('Error updating app preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecuritySettings = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const { error } = await (supabase
        .from('security_settings' as any)
        .update({
          two_factor_enabled: securitySettings.two_factor_enabled
        } as any)
        .eq('id', session.session.user.id));
        
      if (error) throw error;
      
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
      console.error('Error updating security settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSettings = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const emailResponse = await (supabase
        .from('email_settings' as any)
        .select('*')
        .eq('id', session.session.user.id)
        .single());
        
      if (emailResponse.error) {
        console.error('Error fetching email settings:', emailResponse.error);
      } else if (emailResponse.data) {
        const emailData = emailResponse.data as EmailSettings;
        setEmailSettings({
          id: emailData.id || '',
          daily_motivation: emailData.daily_motivation !== null ? emailData.daily_motivation : true,
          weekly_summary: emailData.weekly_summary !== null ? emailData.weekly_summary : true,
          goal_reminders: emailData.goal_reminders !== null ? emailData.goal_reminders : true,
          special_offers: emailData.special_offers !== null ? emailData.special_offers : false
        });
      }
      
      const appResponse = await (supabase
        .from('app_preferences' as any)
        .select('*')
        .eq('id', session.session.user.id)
        .single());
        
      if (appResponse.error) {
        console.error('Error fetching app preferences:', appResponse.error);
      } else if (appResponse.data) {
        const appData = appResponse.data as AppPreferences;
        setAppSettings({
          id: appData.id || '',
          theme: appData.theme || 'system',
          notifications_enabled: appData.notifications_enabled !== null ? appData.notifications_enabled : true,
          language: appData.language || 'en',
          display_units: appData.display_units || 'metric'
        });
      }
      
      const securityResponse = await (supabase
        .from('security_settings' as any)
        .select('*')
        .eq('id', session.session.user.id)
        .single());
        
      if (securityResponse.error) {
        console.error('Error fetching security settings:', securityResponse.error);
      } else if (securityResponse.data) {
        const securityData = securityResponse.data as SecuritySettings;
        setSecuritySettings({
          id: securityData.id || '',
          two_factor_enabled: securityData.two_factor_enabled !== null ? securityData.two_factor_enabled : false,
          login_history: securityData.login_history,
          last_password_change: securityData.last_password_change
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="email" className="flex items-center justify-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center justify-center">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">App</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center">
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Bell className="mr-2 h-5 w-5 text-violet-DEFAULT" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which email notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-motivation">Daily Motivation</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily motivational quotes and tips
                  </p>
                </div>
                <Switch
                  id="daily-motivation"
                  checked={emailSettings.daily_motivation}
                  onCheckedChange={(checked) => 
                    setEmailSettings({...emailSettings, daily_motivation: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your progress
                  </p>
                </div>
                <Switch
                  id="weekly-summary"
                  checked={emailSettings.weekly_summary}
                  onCheckedChange={(checked) => 
                    setEmailSettings({...emailSettings, weekly_summary: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-reminders">Goal Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders about your fitness goals
                  </p>
                </div>
                <Switch
                  id="goal-reminders"
                  checked={emailSettings.goal_reminders}
                  onCheckedChange={(checked) => 
                    setEmailSettings({...emailSettings, goal_reminders: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="special-offers">Special Offers</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive special offers and promotions
                  </p>
                </div>
                <Switch
                  id="special-offers"
                  checked={emailSettings.special_offers}
                  onCheckedChange={(checked) => 
                    setEmailSettings({...emailSettings, special_offers: checked})
                  }
                />
              </div>
              
              <Button 
                onClick={saveEmailSettings}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark group"
              >
                Save Email Settings
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="mr-2 h-5 w-5 text-indigo-DEFAULT" />
                App Preferences
              </CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={appSettings.theme}
                  onValueChange={(value) => 
                    setAppSettings({...appSettings, theme: value})
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={appSettings.language}
                  onValueChange={(value) => 
                    setAppSettings({...appSettings, language: value})
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="units">Display Units</Label>
                <Select
                  value={appSettings.display_units}
                  onValueChange={(value) => 
                    setAppSettings({...appSettings, display_units: value})
                  }
                >
                  <SelectTrigger id="units">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    <SelectItem value="imperial">Imperial (lb, ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">In-app Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable in-app notifications
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={appSettings.notifications_enabled}
                  onCheckedChange={(checked) => 
                    setAppSettings({...appSettings, notifications_enabled: checked})
                  }
                />
              </div>
              
              <Button 
                onClick={saveAppPreferences}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-DEFAULT to-blue-500 hover:from-indigo-dark hover:to-blue-600 group"
              >
                Save App Preferences
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-500" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Additional security for your account
                  </p>
                </div>
                <Switch
                  id="two-factor"
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({...securitySettings, two_factor_enabled: checked})
                  }
                />
              </div>
              
              <Button 
                onClick={saveSecuritySettings}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 group"
              >
                Save Security Settings
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Account Actions</h3>
                
                <Button 
                  variant="outline"
                  className="w-full mb-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                >
                  Change Password
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
