import React from 'react'
import Image from 'next/image'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-blue-100">
            {/* LEFT SIDE */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center relative overflow-hidden">
                {/* Decorative gradient blob */}
                <div className="absolute -top-16 -left-16 w-72 h-72 bg-gradient-to-br from-blue-400 via-blue-300 to-blue-100 rounded-full opacity-30 blur-2xl z-0" />
                <div className="relative z-10 flex flex-col items-center w-full">
                    {/* Title & Subtitle */}
                    <div className="flex flex-col items-center mb-8">
                        <span className="text-4xl font-extrabold text-blue-700 drop-shadow-sm tracking-tight">Med Clinic</span>
                        <span className="text-blue-400 text-lg mt-2 font-medium">You're welcome</span>
                    </div>
                    {/* Auth Card */}
                    <div className="bg-white/90 rounded-2xl shadow-2xl p-10 min-w-[350px] max-w-[400px] w-full flex flex-col items-center gap-6">
                        {children}
                    </div>
                </div>
            </div>
            {/* RIGHT SIDE */}
            <div className="hidden md:flex w-1/2 h-full relative">
                <Image
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={1000}
                    height={1000}
                    alt="Doctor"
                    className="w-full h-full object-cover rounded-l-2xl"
                />
                {/* Overlay gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/60 via-blue-600/30 to-transparent z-10 rounded-l-2xl" />
            </div>
        </div>
    )
}

export default AuthLayout