import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const unreadOnly = url.searchParams.get("unread") === "true";

    const whereClause = {
      user_id: userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: {
        user_id: userId,
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}