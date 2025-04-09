
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Send, Trash2, Bot, User, X, Clock, RefreshCcw } from 'lucide-react';
import BottomNavbar from '@/components/BottomNavbar';
import { Tables } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';

type ChatHistory = {
  id: string;
  message: string;
  response: string;
  created_at: string;
  intent?: string | null;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatHistory[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for existing session on component mount
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
      
      if (!data.session) {
        navigate('/auth');
      } else {
        // Fetch chat history
        fetchChatHistory(data.session.user.id);
      }
    };
    
    getSession();
    
    // Set up auth listener
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

  const fetchChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chatbot_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      setChatHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching chat history:', error.message);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !userSession) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setErrorMessage(null);
    
    // Add user message to chat
    const messageId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: messageId,
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
    }]);
    
    try {
      // Call the OpenAI Edge Function
      const response = await fetch(`https://rfhkokggjvuvvfhlzomb.functions.supabase.co/openai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userSession.user.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from AI');
      }
      
      // Update messages with bot response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { ...msg, response: data.response, intent: data.intent } 
            : msg
        )
      );
      
      // Refresh chat history
      fetchChatHistory(userSession.user.id);
      
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };
  
  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_history')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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

  const retryMessageHandler = () => {
    if (errorMessage && messages.length > 0) {
      // Get the last message and retry it
      const lastMessage = messages[messages.length - 1];
      setInput(lastMessage.message);
      // Remove the last message from the list
      setMessages(messages.slice(0, messages.length - 1));
      setErrorMessage(null);
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
          {/* Chat interface */}
          <div className="md:col-span-2 flex flex-col h-full">
            <Card className="flex-grow shadow-lg overflow-hidden gradient-card border-violet-light/20 flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-violet-DEFAULT" />
                  Chat with FitVibe AI
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={messages.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Bot className="h-12 w-12 mb-3 opacity-50" />
                    <h3 className="font-medium text-lg">How can I help you today?</h3>
                    <p className="max-w-sm mt-2">Ask me about workouts, nutrition, sleep, meditation, or track your progress!</p>
                  </motion.div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div 
                      key={msg.id} 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-DEFAULT/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-violet-DEFAULT" />
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 flex-grow">
                          {msg.message}
                        </div>
                      </div>
                      
                      {msg.response && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-DEFAULT/20 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-indigo-DEFAULT" />
                          </div>
                          <div className="bg-violet-DEFAULT/10 rounded-lg p-3 flex-grow">
                            {msg.response}
                          </div>
                        </div>
                      )}
                      
                      {index === messages.length - 1 && !msg.response && !errorMessage && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-DEFAULT/20 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-indigo-DEFAULT" />
                          </div>
                          <div className="bg-violet-DEFAULT/10 rounded-lg p-3 flex-grow">
                            <div className="flex space-x-2">
                              <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse"></div>
                              <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {index === messages.length - 1 && errorMessage && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                            <X className="h-4 w-4 text-destructive" />
                          </div>
                          <div className="bg-destructive/10 rounded-lg p-3 flex-grow">
                            <p className="text-destructive">Sorry, I encountered an error. Please try again.</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 text-xs" 
                              onClick={retryMessageHandler}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
                <div ref={endOfMessagesRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="border-t p-3">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about fitness, nutrition, or wellness..."
                    disabled={loading}
                    className="flex-grow"
                  />
                  <Button 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    className="bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT hover:from-violet-dark hover:to-indigo-dark"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
          
          {/* Chat history */}
          <div className="hidden md:block">
            <Card className="shadow-lg gradient-card border-indigo-light/20 h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-indigo-DEFAULT" />
                  Chat History
                </h2>
              </div>
              <div className="flex-grow overflow-y-auto p-2">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 px-4">
                    <p>No chat history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((item) => (
                      <motion.div 
                        key={item.id} 
                        className="p-3 rounded-md bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group flex justify-between"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div>
                          <p className="text-sm font-medium truncate">{item.message}</p>
                          <span className="text-xs text-muted-foreground capitalize">{item.intent || 'general'}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <BottomNavbar currentPage="home" />
    </div>
  );
};

export default ChatInterface;
