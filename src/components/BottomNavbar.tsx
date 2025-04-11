
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Dumbbell,
  User,
  Utensils,
  Brain,
  BarChart3,
  Users,
  Bot
} from "lucide-react";

const BottomNavbar: React.FC<{ currentPage?: string }> = ({ currentPage }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string, altPaths: string[] = []) => {
    if (currentPath === path || currentPage === path) return true;
    if (altPaths.some(altPath => currentPath.startsWith(altPath))) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50">
      <div className="grid grid-cols-8 h-full max-w-md mx-auto">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link
          to="/workout"
          className={`flex flex-col items-center justify-center ${
            isActive("/workout", ["/workout/"]) ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs">Workout</span>
        </Link>
        
        <Link
          to="/meals"
          className={`flex flex-col items-center justify-center ${
            isActive("/meals") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Utensils className="h-5 w-5" />
          <span className="text-xs">Meals</span>
        </Link>
        
        <Link
          to="/community"
          className={`flex flex-col items-center justify-center ${
            isActive("/community") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Social</span>
        </Link>
        
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center ${
            isActive("/chat") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Bot className="h-5 w-5" />
          <span className="text-xs">Chat</span>
        </Link>
        
        <Link
          to="/mind"
          className={`flex flex-col items-center justify-center ${
            isActive("/mind") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs">Mind</span>
        </Link>
        
        <Link
          to="/progress"
          className={`flex flex-col items-center justify-center ${
            isActive("/progress", ["/steps"]) ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">Progress</span>
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center ${
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavbar;
