
import { useState, useEffect } from 'react';
import { Bot, X, MessageSquare, ChevronLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage as ChatMessageType, sendChatMessage } from '@/services/chatService';

const FloatingChatbot = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserSession(session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = document.getElementById('floating-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setErrorMessage(null);
    
    // Add user message immediately
    const messageId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: messageId,
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
    }]);
    
    try {
      // If user is logged in, send to API
      if (userSession?.user?.id) {
        const data = await sendChatMessage(userMessage, userSession.user.id);
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId
              ? { ...msg, response: data.response, intent: data.intent } 
              : msg
          )
        );
      } else {
        // For non-logged in users, provide a generic response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId
              ? { ...msg, response: "Please log in to get personalized assistance from FitVibe AI. I can help with workouts, nutrition advice, and more." } 
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setErrorMessage(error.message);
      toast("Failed to process your message");
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };
  
  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-80 sm:w-96"
          >
            <Card className="shadow-lg border-violet-light/20 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-dark to-indigo-dark p-3 flex justify-between items-center text-white">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  <h3 className="font-semibold">FitVibe Assistant</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div 
                id="floating-chat-messages"
                className="h-80 overflow-y-auto p-3 flex flex-col space-y-3"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Bot className="h-12 w-12 mb-3 opacity-50" />
                    <h3 className="font-medium">How can I help you today?</h3>
                    <p className="text-sm mt-2">Ask about workouts, fitness professionals, or how to use FitVibe!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-DEFAULT/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-3 w-3 text-violet-DEFAULT" />
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 flex-grow text-sm">
                          {msg.message}
                        </div>
                      </div>
                      
                      {(msg.response || loading) && (
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-DEFAULT/20 flex items-center justify-center shrink-0">
                            <Bot className="h-3 w-3 text-indigo-DEFAULT" />
                          </div>
                          <div className="bg-violet-DEFAULT/10 rounded-lg p-2 flex-grow text-sm">
                            {msg.response ? (
                              msg.response
                            ) : (
                              <div className="flex space-x-1">
                                <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse"></div>
                                <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse delay-100"></div>
                                <div className="h-2 w-2 rounded-full bg-indigo-DEFAULT animate-pulse delay-200"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="border-t p-3">
                <div className="flex">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-grow"
                    disabled={loading}
                    onKeyDown={handleKeyDown}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="ml-2 bg-gradient-to-r from-violet-DEFAULT to-indigo-DEFAULT"
                    disabled={!input.trim() || loading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg text-white"
            onClick={() => setIsOpen(true)}
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingChatbot;
