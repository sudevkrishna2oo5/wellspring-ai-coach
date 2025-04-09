
import { supabase } from '@/integrations/supabase/client';

export type ChatMessage = {
  id: string;
  message: string;
  response: string;
  created_at: string;
  intent?: string | null;
};

export const sendChatMessage = async (message: string, userId: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }
  
  const response = await fetch(`https://rfhkokggjvuvvfhlzomb.functions.supabase.co/openai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      userId
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get response from AI');
  }
  
  return await response.json();
};

export const fetchChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chatbot_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const deleteChatHistoryItem = async (id: string) => {
  const { error } = await supabase
    .from('chatbot_history')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};
