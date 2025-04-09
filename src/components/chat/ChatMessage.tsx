
import { Bot, RefreshCcw, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type ChatMessageProps = {
  id: string;
  message: string;
  response: string;
  isLastMessage: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
};

const ChatMessage = ({ 
  id, 
  message, 
  response, 
  isLastMessage,
  isLoading,
  errorMessage,
  onRetry
}: ChatMessageProps) => {
  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-violet-DEFAULT/20 flex items-center justify-center">
          <User className="h-4 w-4 text-violet-DEFAULT" />
        </div>
        <div className="bg-muted/50 rounded-lg p-3 flex-grow">
          {message}
        </div>
      </div>
      
      {response && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-DEFAULT/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-indigo-DEFAULT" />
          </div>
          <div className="bg-violet-DEFAULT/10 rounded-lg p-3 flex-grow">
            {response}
          </div>
        </div>
      )}
      
      {isLastMessage && !response && !errorMessage && isLoading && (
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
      
      {isLastMessage && errorMessage && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
            <X className="h-4 w-4 text-destructive" />
          </div>
          <div className="bg-destructive/10 rounded-lg p-3 flex-grow">
            <p className="text-destructive">{errorMessage || 'Sorry, I encountered an error. Please try again.'}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={onRetry}
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
