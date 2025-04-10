
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  created_at: string;
};

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50) as { data: Notification[] | null; error: any };
      
      if (error) throw error;
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId) as { error: any };
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false) as { error: any };
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [userId, notifications]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId) as { error: any };
      
      if (error) throw error;
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Send a notification
  const sendNotification = useCallback(async (
    notificationType: string, 
    data?: any
  ) => {
    if (!userId) return;

    try {
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('No active session found');
      }

      const response = await fetch(`https://rfhkokggjvuvvfhlzomb.supabase.co/functions/v1/send-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          userId,
          notificationType,
          data
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      const result = await response.json();
      
      // Show toast notification for immediate feedback
      sonnerToast(result.notification.title, {
        description: result.notification.body,
        duration: 5000
      });
      
      // Refresh notifications list
      fetchNotifications();
      
      return result;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive'
      });
    }
  }, [userId, fetchNotifications, toast]);

  // Load notifications on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification
  };
}

// Helper component to display a toast notification
export function showNotificationToast(title: string, body: string) {
  sonnerToast(title, {
    description: body,
    duration: 5000
  });
}
