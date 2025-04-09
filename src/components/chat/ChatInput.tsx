
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

type ChatInputProps = {
  input: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  loading: boolean;
};

const ChatInput = ({ input, onChange, onSend, loading }: ChatInputProps) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Cycle through different placeholder suggestions
  useEffect(() => {
    if (!showPlaceholder) return;
    
    const placeholders = [
      "Ask anything about fitness, nutrition, or wellness...",
      "Need a workout recommendation? Ask me...",
      "Curious about nutrition tips? I can help...",
      "Want to improve your sleep? Let's chat...",
      "Tracking your progress? Let me assist..."
    ];
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      const inputElement = document.querySelector('input[placeholder]') as HTMLInputElement;
      if (inputElement && !inputElement.value) {
        inputElement.placeholder = placeholders[currentIndex];
        currentIndex = (currentIndex + 1) % placeholders.length;
      }
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [showPlaceholder]);

  // Stop showing rotating placeholders when user starts typing
  const handleFocus = () => {
    setShowPlaceholder(false);
  };
  
  const handleBlur = () => {
    if (!input) {
      setShowPlaceholder(true);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) {
      e.preventDefault();
      onSend(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={onSend} className="border-t p-3">
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask anything about fitness, nutrition, or wellness..."
          disabled={loading}
          className="flex-grow"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
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
