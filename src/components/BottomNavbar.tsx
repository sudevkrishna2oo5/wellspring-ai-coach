
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
  Bot,
  Map,
  Calendar,
  Trophy
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
      <div className="grid grid-cols-5 h-full max-w-md mx-auto">
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
          to="/activity"
          className={`flex flex-col items-center justify-center ${
            isActive("/activity", ["/activity/", "/routes", "/tracker"]) ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Activity</span>
        </Link>
        
        <Link
          to="/streaks"
          className={`flex flex-col items-center justify-center ${
            isActive("/streaks") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span className="text-xs">Streaks</span>
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
