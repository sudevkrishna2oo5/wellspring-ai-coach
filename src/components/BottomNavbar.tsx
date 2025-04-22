
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Dumbbell,
  User,
  Utensils,
  Brain,
  BarChart3,
  MessageSquare,
  Map,
  AlarmClock,
  Trophy,
  Menu,
  Calendar,
  X
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/use-responsive";

const BottomNavbar: React.FC<{ currentPage?: string }> = ({ currentPage }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isMobile, isPhone } = useResponsive();
  
  const isActive = (path: string, altPaths: string[] = []) => {
    if (currentPath === path || currentPage === path) return true;
    if (altPaths.some(altPath => currentPath.startsWith(altPath))) return true;
    return false;
  };

  // Define all menu items
  const mainMenuItems = [
    { name: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    { name: "Workout", icon: <Dumbbell className="h-5 w-5" />, path: "/workout" },
    { name: "Activity", icon: <Map className="h-5 w-5" />, path: "/activity" },
    { name: "Meals", icon: <Utensils className="h-5 w-5" />, path: "/meals" },
    { name: "Mind", icon: <Brain className="h-5 w-5" />, path: "/mind" }
  ];
  
  const expandedMenuItems = [
    { name: "Progress", icon: <BarChart3 className="h-5 w-5" />, path: "/progress" },
    { name: "Timer", icon: <AlarmClock className="h-5 w-5" />, path: "/timer" },
    { name: "Chat", icon: <MessageSquare className="h-5 w-5" />, path: "/chat" },
    { name: "Streaks", icon: <Trophy className="h-5 w-5" />, path: "/streaks" },
    { name: "Planner", icon: <Calendar className="h-5 w-5" />, path: "/planner" },
    { name: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" }
  ];

  // For mobile, show main items + more menu
  if (isPhone) {
    return (
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50">
        <div className="grid grid-cols-5 h-full max-w-md mx-auto">
          {mainMenuItems.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center ${
                isActive(item.path, [item.path + "/"]) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-16 w-full flex flex-col items-center justify-center">
                <Menu className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] pb-safe">
              <SheetHeader className="flex justify-between items-center">
                <SheetTitle>Menu</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                {[...mainMenuItems.slice(4), ...expandedMenuItems].map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                        isActive(item.path, [item.path + "/"]) 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.icon}
                      <span className="text-xs mt-1">{item.name}</span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    );
  }

  // For tablet, show scrollable nav
  if (isMobile && !isPhone) {
    return (
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50 overflow-x-auto">
        <div className="flex h-full px-2">
          {[...mainMenuItems, ...expandedMenuItems].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center px-4 min-w-[72px] ${
                isActive(item.path, [item.path + "/"]) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-xs whitespace-nowrap">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  // For desktop, show all items in a row
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50">
      <div className="flex justify-center h-full max-w-5xl mx-auto">
        {[...mainMenuItems, ...expandedMenuItems].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center px-4 ${
              isActive(item.path, [item.path + "/"]) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;
