import { Button } from "@/components/ui/button";
import { getRole } from "@/utils/roles";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-blue-100 p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white/90 rounded-2xl shadow-2xl px-10 py-12 flex flex-col items-center gap-6 max-w-xl w-full">
          <div className="flex flex-col items-center mb-4">
            <span className="text-5xl md:text-6xl font-extrabold text-blue-700 drop-shadow-sm tracking-tight mb-2">
              MedClinic
            </span>
            <span className="text-blue-400 text-lg font-medium">
              Welcome to your modern medical platform
            </span>
          </div>
          <p className="text-center text-gray-700 mb-6">
            A modern medical platform for quick schedules and consultations.<br />
            Manage your health simply and efficiently, with access to the best specialists.
          </p>
          <div className="flex gap-4">
            {userId ? (
              <>
                <Link href={`/${role}`}>
                  <Button>View Dashboard</Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button className="md:text-base font-light shadow-md">
                    New Patient
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="md:text-base underline hover:text-blue-600 shadow-md">
                    Login to account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <footer className="mt-8">
        <p className="text-center text-sm text-gray-500">
          &copy; 2025 MedClinic. All rights reserved.
        </p>
      </footer>
    </div>
  );
}