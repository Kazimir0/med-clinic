"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { useRouter } from "next/navigation";
import { NotificationItem } from "./notification-item-props";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
  link?: string;
  created_at: string;
}

// NotificationBell displays a bell icon with unread count and a popover for recent notifications.
// Allows marking all as read and navigating to the notifications page.
export const NotificationBell = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch the latest notifications (limit 5, unread only)
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=5&unread=true");
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {/* Show unread count badge if there are unread notifications */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notificări</h4>
          {/* Button to mark all as read */}
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs p-0 hover:bg-transparent"
              onClick={() => {
                markAllAsRead();
                setIsOpen(false);
              }}
            >
              Marchează toate ca citite
            </Button>
          )}
        </div>
        {/* Show message if no notifications, else list notifications */}
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Nu ai notificări noi
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="p-2 space-y-2">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onMarkAsRead={fetchNotifications}
                />
              ))}
            </div>
          </ScrollArea>
        )}
        {/* Button to view all notifications */}
        <div className="p-2 border-t text-center">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => {
              setIsOpen(false);
              router.push("/notifications");
            }}
          >
            Vezi toate notificările
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};