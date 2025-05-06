
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
import Activity from "./pages/Activity";
import Streaks from "./pages/Streaks";
import WorkoutPlanner from "./pages/WorkoutPlanner";
import PaymentDemo from "./pages/PaymentDemo";
import ExpertDashboard from "./pages/ExpertDashboard";
import LiveTrainer from "./pages/LiveTrainer";
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
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, goals')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching profile:", profileError);
          }
          
          setIsNewUser(!profileData?.goals?.length || !profileData?.full_name);
        }
        
        setIsLoading(false);
        setCheckingSession(false);
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        setIsAuthenticated(false);
        setIsLoading(false);
        setCheckingSession(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_IN' && session) {
        const checkNewUserStatus = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('full_name, goals')
              .eq('id', session.user.id)
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
        
        checkNewUserStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsNewUser(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
              <Route 
                path="/" 
                element={
                  isAuthenticated 
                    ? (isNewUser ? <Navigate to="/onboarding" replace /> : <Index />) 
                    : <Navigate to="/auth" replace />
                } 
              />
              <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />} />
              <Route path="/workout" element={isAuthenticated ? <Workout /> : <Navigate to="/auth" replace />} />
              <Route path="/workout/add" element={isAuthenticated ? <WorkoutAdd /> : <Navigate to="/auth" replace />} />
              <Route path="/meals" element={isAuthenticated ? <Meals /> : <Navigate to="/auth" replace />} />
              <Route path="/mind" element={isAuthenticated ? <Mind /> : <Navigate to="/auth" replace />} />
              <Route path="/progress" element={isAuthenticated ? <Progress /> : <Navigate to="/auth" replace />} />
              <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />} />
              <Route path="/chat" element={isAuthenticated ? <ChatInterface /> : <Navigate to="/auth" replace />} />
              <Route path="/timer" element={isAuthenticated ? <Timer /> : <Navigate to="/auth" replace />} />
              <Route path="/steps" element={isAuthenticated ? <StepProgress /> : <Navigate to="/auth" replace />} />
              <Route 
                path="/onboarding" 
                element={
                  isAuthenticated 
                    ? (isNewUser ? <Onboarding /> : <Navigate to="/" replace />) 
                    : <Navigate to="/auth" replace />
                } 
              />
              <Route path="/community" element={isAuthenticated ? <Community /> : <Navigate to="/auth" replace />} />
              <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/auth" replace />} />
              <Route path="/streaks" element={isAuthenticated ? <Streaks /> : <Navigate to="/auth" replace />} />
              <Route path="/planner" element={isAuthenticated ? <WorkoutPlanner /> : <Navigate to="/auth" replace />} />
              <Route 
                path="/payment" 
                element={isAuthenticated ? <PaymentDemo /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/expert" 
                element={isAuthenticated ? <ExpertDashboard /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/live-trainer" 
                element={isAuthenticated ? <LiveTrainer /> : <Navigate to="/auth" replace />} 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
