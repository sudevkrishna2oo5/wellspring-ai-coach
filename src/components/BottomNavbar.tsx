
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Activity, Utensils, Brain, User, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

type BottomNavbarProps = {
  currentPage: string;
};

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentPage }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { id: 'home', icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { id: 'workout', icon: <Activity className="h-5 w-5" />, label: 'Workout', path: '/workout' },
    { id: 'meals', icon: <Utensils className="h-5 w-5" />, label: 'Nutrition', path: '/meals' },
    { id: 'mind', icon: <Brain className="h-5 w-5" />, label: 'Mind', path: '/mind' },
    { id: 'experts', icon: <Headphones className="h-5 w-5" />, label: 'Experts', path: '/professional-advice' },
    { id: 'profile', icon: <User className="h-5 w-5" />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-violet-dark to-indigo-dark text-white z-40">
      <div className="flex justify-between items-center px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex flex-col items-center justify-center py-3 px-3 relative ${
              currentPage === item.id ? 'text-white' : 'text-white/60'
            }`}
            onClick={() => navigate(item.path)}
          >
            {currentPage === item.id && (
              <motion.div
                className="absolute inset-x-0 -top-1 h-0.5 bg-white rounded-full"
                layoutId="navbar-indicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
