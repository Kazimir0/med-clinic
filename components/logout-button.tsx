"use client";
import React from 'react'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs';

// LogoutButton renders a button that signs the user out and redirects to the sign-in page
// Uses Clerk authentication for sign-out functionality
export const LogoutButton = () => {
    const { signOut } = useClerk();
  return (
    <Button 
    variant={'outline'}
    className='w-fit bottom-0 gap-2 px-0 md:px-4'
    // On click, sign out and redirect to /sign-in
    onClick={() => signOut({redirectUrl: '/sign-in' })}
    >
        <LogOut />
        {/* Show 'Disconnect' label on large screens */}
        <span className='hidden lg:block'>Disconnect</span>
    </Button>
  )
}
