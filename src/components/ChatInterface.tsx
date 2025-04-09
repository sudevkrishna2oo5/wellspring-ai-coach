
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bot, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import BottomNavbar from '@/components/BottomNavbar';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatHistory from '@/components/chat/ChatHistory';
import { fetchChatHistory, deleteChatHistoryItem, ChatMessage } from '@/services/chatService';

const ChatInterface = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
      
      if (!data.session) {
        navigate('/auth');
      } else {
        loadChatHistory(data.session.user.id);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserSession(session);
      if (!session) {
        navigate('/auth');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const loadChatHistory = async (userId: string) => {
    try {
      const history = await fetchChatHistory(userId);
      setChatHistory(history);
    } catch (error: any) {
      console.error('Error fetching chat history:', error.message);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteChatHistoryItem(id);
      setChatHistory(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Deleted",
        description: "Chat history item removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete chat history item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-dark/5 via-background to-indigo-dark/5 pb-16 overflow-hidden">
      <motion.header 
        className="py-4 px-6 flex items-center bg-gradient-to-r from-violet-dark to-indigo-dark text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          className="mr-2 text-white hover:bg-white/10" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <Bot className="mr-2 h-6 w-6" /> 
          FitVibe Assistant
        </h1>
      </motion.header>
      
      <main className="container mx-auto max-w-3xl px-4 pt-4 pb-24 flex flex-col h-[calc(100vh-120px)]">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 flex-grow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:col-span-2 flex flex-col h-full">
            {userSession && (
              <ChatContainer 
                userId={userSession.user.id} 
                onChatHistoryUpdated={() => loadChatHistory(userSession.user.id)} 
              />
            )}
          </div>
          
          <div className="hidden md:block">
            <ChatHistory 
              chatHistory={chatHistory} 
              onDeleteHistoryItem={handleDeleteHistoryItem} 
            />
          </div>
        </motion.div>
      </main>
      
      <BottomNavbar currentPage="chat" />
    </div>
  );
};

export default ChatInterface;
