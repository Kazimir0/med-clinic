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
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        message,
        type,
        user_id: userId,
        link,
        data
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};