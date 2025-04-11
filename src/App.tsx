
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Workout from "./pages/Workout";
import WorkoutAdd from "./pages/WorkoutAdd";
import Profile from "./pages/Profile";
import Meals from "./pages/Meals";
import Mind from "./pages/Mind";
import Progress from "./pages/Progress";
import ChatInterface from "./components/ChatInterface";
import Timer from "./pages/Timer";
import StepProgress from "./pages/StepProgress";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Community from "./pages/Community";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          setCheckingSession(false);
          return;
        }
        
        setIsAuthenticated(!!data.session);
        
        if (data.session) {
          // Check if user has completed onboarding by looking for profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, goals')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') { // Code for "no rows returned"
            console.error("Error fetching profile:", profileError);
          }
          
          // If goals are empty or full_name is empty, consider the user as new
          setIsNewUser(!profileData?.goals?.length || !profileData?.full_name);
        }
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setCheckingSession(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        // Check if the user needs onboarding
        if (session?.user) {
          setTimeout(() => {
            checkNewUserStatus(session.user.id);
          }, 0);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsNewUser(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkNewUserStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, goals')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking new user status:", error);
        return;
      }
      
      setIsNewUser(!data?.goals?.length || !data?.full_name);
    } catch (error) {
      console.error("Error in checkNewUserStatus:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-violet-500 border-l-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={isAuthenticated ? (isNewUser ? <Navigate to="/onboarding" /> : <Index />) : <Navigate to="/auth" />} />
              <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />
              <Route path="/workout" element={isAuthenticated ? <Workout /> : <Navigate to="/auth" />} />
              <Route path="/workout/add" element={isAuthenticated ? <WorkoutAdd /> : <Navigate to="/auth" />} />
              <Route path="/meals" element={isAuthenticated ? <Meals /> : <Navigate to="/auth" />} />
              <Route path="/mind" element={isAuthenticated ? <Mind /> : <Navigate to="/auth" />} />
              <Route path="/progress" element={isAuthenticated ? <Progress /> : <Navigate to="/auth" />} />
              <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />} />
              <Route path="/chat" element={isAuthenticated ? <ChatInterface /> : <Navigate to="/auth" />} />
              <Route path="/timer" element={isAuthenticated ? <Timer /> : <Navigate to="/auth" />} />
              <Route path="/steps" element={isAuthenticated ? <StepProgress /> : <Navigate to="/auth" />} />
              <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/auth" />} />
              <Route path="/community" element={isAuthenticated ? <Community /> : <Navigate to="/auth" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
