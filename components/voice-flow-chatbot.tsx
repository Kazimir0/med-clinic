// VoiceFlowChatbot component integrates the Voiceflow chatbot widget for authenticated users, but only for patients
"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export const VoiceFlowChatbot = () => {
  // Get authentication and user info from Clerk
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();

  // Extract user role from Clerk publicMetadata (adjust if your role is stored elsewhere)
  const userRole = user?.publicMetadata?.role as string | undefined;

  // Only render the chatbot for users with role 'patient'
  const shouldShowChatbot = isSignedIn && userId && typeof userRole === 'string' && userRole.toLowerCase() === "patient";

  useEffect(() => {
    // Only run effect if chatbot should be shown
    if (!shouldShowChatbot) {
      return;
    }
    // Prevent loading the script multiple times
    if (document.getElementById("voiceflow-script")) {
      return;
    }
    // Dynamically create and append the Voiceflow widget script
    const script = document.createElement("script");
    script.id = "voiceflow-script";
    script.type = "text/javascript";
    script.async = true;
    script.onload = function() {
      // Script loaded successfully
      console.log("Voiceflow script loaded");
      try {
        // Initialize the Voiceflow chat widget with user and project info
        // @ts-ignore
        window.voiceflow?.chat?.load({
          verify: { projectID: '6856bef558a0da2b7a093b37' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          authorization: 'VF.DM.6856c9cdf49c34937af1f76d.MmNbyR0Slt13GzxS',
          user: {
            userID: userId,
            name: user?.fullName || 'Pacient' // Use user's full name or fallback
          },
          render: {
            mode: "overlay",
            position: "right",
            size: "standard", 
            title: "Asistent Medical",
            description: "Asistentul tău medical virtual"
          },
          // Allow HTML in chat (use with caution)
          allowDangerousHTML: true
        });
        console.log("Voiceflow chat initialized successfully");
      } catch (error) {
        // Handle initialization errors
        console.error("Error initializing Voiceflow chatbot:", error);
      }
    };
    script.onerror = function() {
      // Handle script loading errors
      console.error("Error loading Voiceflow script");
    };
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    document.head.appendChild(script);
    // Cleanup: remove the script when the component unmounts
    return () => {
      const voiceflowScript = document.getElementById("voiceflow-script");
      if (voiceflowScript) {
        voiceflowScript.remove();
      }
    };
  }, [shouldShowChatbot, userId, user]);

  // Only render null if chatbot should not be shown
  if (!shouldShowChatbot) {
    return null;
  }

  // This component does not render any visible UI
  return null;
};