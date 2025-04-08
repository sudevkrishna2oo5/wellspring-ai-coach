
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Home, Utensils, Brain, BarChart2, User } from 'lucide-react';

interface BottomNavbarProps {
  currentPage: string;
}

const BottomNavbar = ({ currentPage }: BottomNavbarProps) => {
  const navigate = useNavigate();
  
  const navItems = [
    { label: 'Home', icon: <Home className="h-5 w-5" />, path: '/' },
    { label: 'Workout', icon: <Dumbbell className="h-5 w-5" />, path: '/workout' },
    { label: 'Meals', icon: <Utensils className="h-5 w-5" />, path: '/meals' },
    { label: 'Mind', icon: <Brain className="h-5 w-5" />, path: '/mind' },
    { label: 'Progress', icon: <BarChart2 className="h-5 w-5" />, path: '/progress' },
    { label: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-4 flex justify-between overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.label}
          className={`flex flex-col items-center p-1 min-w-[3rem] ${
            currentPage === item.label.toLowerCase() 
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavbar;
