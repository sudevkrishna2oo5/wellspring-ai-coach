
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Home, Utensils, Brain, BarChart2, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavbarProps {
  currentPage: string;
}

const BottomNavbar = ({ currentPage }: BottomNavbarProps) => {
  const navigate = useNavigate();
  
  const navItems = [
    { label: 'Home', icon: <Home className="h-5 w-5" />, path: '/' },
    { label: 'Workout', icon: <Dumbbell className="h-5 w-5" />, path: '/workout' },
    { label: 'Meals', icon: <Utensils className="h-5 w-5" />, path: '/meals' },
    { label: 'Chat', icon: <MessageSquare className="h-5 w-5" />, path: '/chat' },
    { label: 'Mind', icon: <Brain className="h-5 w-5" />, path: '/mind' },
    { label: 'Progress', icon: <BarChart2 className="h-5 w-5" />, path: '/progress' },
    { label: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
  ];
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t py-2 px-4 flex justify-between overflow-x-auto"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {navItems.map((item) => (
        <motion.button
          key={item.label}
          className={`flex flex-col items-center p-1 min-w-[3rem] ${
            currentPage === item.label.toLowerCase() 
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`}
          onClick={() => navigate(item.path)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -2 }}
        >
          {currentPage === item.label.toLowerCase() ? (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.div>
              <motion.span 
                className="text-xs mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {item.label}
              </motion.span>
            </>
          ) : (
            <>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </>
          )}
          {currentPage === item.label.toLowerCase() && (
            <motion.div
              className="absolute bottom-0 h-1 w-5 rounded-t-full bg-primary"
              layoutId="underline"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default BottomNavbar;
