"use client";

import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Bell, Check, Calendar, CreditCard, Stethoscope, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "medical":
        return <Stethoscope className="h-5 w-5 text-rose-500" />;
      case "record":
        return <ClipboardList className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ro
  });

  const markAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        onMarkAsRead();
      } else {
        toast.error("Eroare la marcarea notificării ca citită");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const content = (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-colors hover:bg-slate-50",
        notification.read ? "bg-white border-gray-100" : "bg-blue-50 border-blue-100"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">{notification.title}</h4>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
        </div>
        
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              markAsRead();
            }}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Marchează ca citit</span>
          </Button>
        )}
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link}>
        {content}
      </Link>
    );
  }

  return content;
};