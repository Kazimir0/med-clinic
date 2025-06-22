import db from "@/lib/db";

export const createNotification = async ({
  title,
  message,
  type,
  userId = null,
  link = null,
  data = null
}: {
  title: string;
  message: string;
  type: string;
  userId?: string | null;
  link?: string | null;
  data?: any;
}) => {
  try {
    console.log("=== SERVER NOTIFICATION SYSTEM ===");
    console.log("Creating notification with userId:", userId);
    console.log("Title:", title);
    console.log("Message:", message);
    console.log("Server createNotification called with:", { title, type, userId });

    const jsonData = data !== null ? data : undefined;

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type,
        user_id: userId,
        link,
        data: jsonData,
        read: false
      }
    });

    console.log("Notification created in database with ID:", notification.id);
    return notification;
  } catch (error) {
    console.error("Error in server createNotification:", error);
    throw error;
  }
};