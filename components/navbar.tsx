"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
// import { NotificationBell } from "./notifications/notification-bell";

export const Navbar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  const [path, setPath] = useState("Overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const splitRoute = pathname.split("/");
    const lastIndex = splitRoute.length - 1 > 2 ? 2 : splitRoute.length - 1;
    const pathName = splitRoute[lastIndex];
    const formattedPath = pathName.replace(/-/g, " ");
    setPath(formattedPath || "Overview");
  }, [pathname]);

  return (
    <div className="p-5 flex justify-between bg-white">
      <h1 className="text-xl font-medium text-gray-500 capitalize">
        {path}
      </h1>

      <div className="flex items-center gap-4">
        {/* <div className="relative">
          <Bell />
          <p className="absolute -top-3 right-1 size-4 bg-red-600 text-white rounded-full text-[10px] text-center">
            2
          </p>
        </div> */}
        {/* <NotificationBell /> */}

        {mounted && userId && <UserButton />}
      </div>
    </div>
  );
};
