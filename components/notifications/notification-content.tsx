"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
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

export const NotificationsContent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else {
        toast.error("Eroare la încărcarea notificărilor");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Nu s-au putut încărca notificările");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            read: true
          }))
        );
        setUnreadCount(0);
        toast.success("Toate notificările au fost marcate ca citite");
      } else {
        toast.error("Eroare la marcarea notificărilor ca citite");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Nu s-au putut marca notificările ca citite");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Notificările tale</h2>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
          >
            Marchează toate ca citite
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nu ai notificări</p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
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
    </div>
  );
};