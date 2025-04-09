
import { useState, useEffect, useRef } from 'react';
import { Bot, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType, sendChatMessage } from '@/services/chatService';

type ChatContainerProps = {
  userId: string;
  onChatHistoryUpdated: () => void;
};

const ChatContainer = ({ userId, onChatHistoryUpdated }: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !userId) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setErrorMessage(null);
    
    const messageId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: messageId,
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
    }]);
    
    try {
      const data = await sendChatMessage(userMessage, userId);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { ...msg, response: data.response, intent: data.intent } 
            : msg
        )
      );
      
      onChatHistoryUpdated();
      
    } catch (error: any) {
      console.error('Chat error:', error);
      setErrorMessage(error.message);
      toast({
        title: "Error",
        description: `Failed to process your message: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const retryMessageHandler = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setInput(lastMessage.message);
      setMessages(messages.slice(0, messages.length - 1));
      setErrorMessage(null);
    }
  };

  return (
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
            <ChatMessage
              key={msg.id}
              id={msg.id}
              message={msg.message}
              response={msg.response}
              isLastMessage={index === messages.length - 1}
              isLoading={loading}
              errorMessage={index === messages.length - 1 ? errorMessage : null}
              onRetry={retryMessageHandler}
            />
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <ChatInput 
        input={input}
        onChange={setInput}
        onSend={handleSendMessage}
        loading={loading}
      />
    </Card>
  );
};

export default ChatContainer;
