import db from "@/lib/db";

interface CreateNotificationOptions {
  title: string;
  message: string;
  type: string;
  userId: string;
  link?: string;
  data?: Record<string, any>;
}

export async function createNotification(options: CreateNotificationOptions) {
  try {
    const notification = await db.notification.create({
      data: {
        user_id: options.userId,
        title: options.title,
        message: options.message,
        type: options.type,
        link: options.link,
        data: options.data ? options.data : {},
      },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}