import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { VoiceFlowChatbot } from "@/components/voice-flow-chatbot";
import React from "react";

const ProtectedLayout = ({children}: {children: React.ReactNode}) => {
    return (
    <div className="w-full h-screen flex bg-gray-200">
        {/* Sidebar navigation */}
        <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] "><Sidebar/></div>

        {/* Main content area with navbar and page content */}
        <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] flex flex-col">
            <Navbar/>
            <div className="h-full w-full p-2 overflow-y-scroll">{children}</div>
        </div>
        {/* VoiceFlow chatbot floating on the page */}
        <VoiceFlowChatbot />
    </div>
    );
};

export default ProtectedLayout;