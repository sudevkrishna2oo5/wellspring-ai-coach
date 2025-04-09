
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

type ChatHistoryItem = {
  id: string;
  message: string;
  response: string;
  created_at: string;
  intent?: string | null;
};

type ChatHistoryProps = {
  chatHistory: ChatHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
};

const ChatHistory = ({ chatHistory, onDeleteHistoryItem }: ChatHistoryProps) => {
  return (
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
                    onDeleteHistoryItem(item.id);
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
  );
};

export default ChatHistory;
