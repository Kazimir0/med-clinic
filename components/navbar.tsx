"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { NotificationBell } from "./notifications/notification-bell";

// Navbar component displays the top navigation bar with the current page name, notifications, and user menu
export const Navbar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  // State for the current path label and mount status
  const [path, setPath] = useState("Overview");
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update the path label based on the current route
  useEffect(() => {
    if (!pathname) return;
    // Split the route and get the relevant segment for the page name
    const splitRoute = pathname.split("/");
    const lastIndex = splitRoute.length - 1 > 2 ? 2 : splitRoute.length - 1;
    const pathName = splitRoute[lastIndex];
    const formattedPath = pathName.replace(/-/g, " ");
    setPath(formattedPath || "Overview");
  }, [pathname]);

  return (
    <div className="p-5 flex justify-between bg-white">
      {/* Page title based on current route */}
      <h1 className="text-xl font-medium text-gray-500 capitalize">
        {path}
      </h1>

      {/* Notification bell and user menu, only shown after mount */}
      <div className="flex items-center gap-4">
        {mounted && (
          <>
            <div className="relative">
              <NotificationBell />
            </div>
            {userId && <UserButton />}
          </>
        )}
      </div>
    </div>
  );
};