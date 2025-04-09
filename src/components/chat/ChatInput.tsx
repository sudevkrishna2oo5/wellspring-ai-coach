
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ChatInputProps = {
  input: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  loading: boolean;
};

const ChatInput = ({ input, onChange, onSend, loading }: ChatInputProps) => {
  return (
    <form onSubmit={onSend} className="border-t p-3">
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => onChange(e.target.value)}
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
  );
};

export default ChatInput;
