import { NotificationsContent } from "@/components/notifications/notification-content";
import { PageTitle } from "@/components/page-title";

export default async function NotificationsPage() {
  return (
    <div className="p-6">
      <PageTitle title="Notificări" description="Gestionează notificările tale" />
      
      <div className="mt-6">
        <NotificationsContent />
      </div>
    </div>
  );
}