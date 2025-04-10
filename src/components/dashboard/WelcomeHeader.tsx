
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

type WelcomeHeaderProps = {
  className?: string;
};

const WelcomeHeader = ({ className = '' }: WelcomeHeaderProps) => {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('Welcome');
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };
    
    setGreeting(getTimeBasedGreeting());
    
    // Get the current user
    const getUserData = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        
        // Get the user's profile data
        if (data.session.user.id) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (!error && profileData) {
            setProfileData(profileData);
            
            // Check if user is relatively new (registered within the last 3 days)
            const createdAt = new Date(data.session.user.created_at || Date.now());
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            
            setIsNewUser(createdAt > threeDaysAgo);
          }
        }
      }
    };
    
    getUserData();
  }, []);
  
  if (!user) {
    return null;
  }

  // Get the name to display (prioritize full_name from profile, fall back to email)
  const displayName = profileData?.full_name || user.email?.split('@')[0] || 'there';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${className}`}
    >
      <h1 className="text-2xl font-bold">
        {isNewUser ? (
          <span>Welcome to FitVibe, <span className="bg-gradient-to-r from-violet-dark to-indigo-DEFAULT bg-clip-text text-transparent">{displayName}</span>! 💪</span>
        ) : (
          <span>{greeting}, <span className="bg-gradient-to-r from-violet-dark to-indigo-DEFAULT bg-clip-text text-transparent">{displayName}</span> 👋</span>
        )}
      </h1>
      
      <p className="text-muted-foreground mt-1">
        {isNewUser ? 
          "Let's start your fitness journey today!" : 
          "Ready to continue your fitness journey?"}
      </p>
    </motion.div>
  );
};

export default WelcomeHeader;
