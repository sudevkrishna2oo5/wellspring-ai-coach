
import { useState } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  userId?: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications(userId);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'daily_goal':
        return '🎯';
      case 'achievement':
        return '🏆';
      case 'workout_reminder':
        return '💪';
      case 'meal_reminder':
        return '🍎';
      case 'motivation':
        return '✨';
      default:
        return '📣';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle specific notification types
    switch (notification.type) {
      case 'workout_reminder':
        // Navigate to workout page
        break;
      case 'meal_reminder':
        // Navigate to meals page
        break;
      case 'daily_goal':
        // Navigate to progress page
        break;
      default:
        // Default behavior
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 md:w-96 p-0" 
        align="end"
        alignOffset={-5}
        sideOffset={8}
      >
        <Card className="border-0">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => markAllAsRead()}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
            <CardDescription>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'No new notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-0">
              {notifications.length > 0 ? (
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div 
                        className={`relative p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-muted/30' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.body}
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2 flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="sr-only">Mark as read</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete notification</span>
                          </Button>
                        </div>
                      </div>
                      <Separator />
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground p-4">
                  <Bell className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs">Stay tuned for updates about your fitness journey</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-2">
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => setOpen(false)}>
              <X className="mr-1 h-3.5 w-3.5" />
              Close
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
