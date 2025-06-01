import React from 'react'
import Image from 'next/image'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='w-full h-screen flex items-center justify-center'>
            <div className='w-1/2 h-full flex items-center justify-center'>{children}</div>
            <div className='hidden md:flex w-1/2 h-full relative'>
                <Image src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                width={1000} 
                height={1000} 
                alt="Doctor" 
                className='w-full h-full object-cover' 
                />
                <div className='absolute top-0 w-full h-full z-10 flex flex-col items-center justify-center'>
                    <h1 className='text-3xl 2xl:text-5xl font-bold text-white'>Med Clinic</h1>
                    <p className='text-blue-500 text-base'>You're welcome</p>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout