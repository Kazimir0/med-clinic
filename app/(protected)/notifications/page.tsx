import { NotificationsContent } from "@/components/notifications/notification-content";

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Notifies</h1>
      <NotificationsContent />
    </div>
  );
}