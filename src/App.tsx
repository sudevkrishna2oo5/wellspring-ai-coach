
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/workout/add" element={<WorkoutAdd />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/mind" element={<Mind />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/timer" element={<Timer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
