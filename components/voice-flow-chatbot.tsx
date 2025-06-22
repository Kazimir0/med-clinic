"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

export const VoiceFlowChatbot = () => {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  
  useEffect(() => {
    // Verifică dacă utilizatorul este autentificat
    if (!isSignedIn || !userId) {
      return;
    }
    
    // Verifică dacă scriptul există deja
    if (document.getElementById("voiceflow-script")) {
      return;
    }
    
    const script = document.createElement("script");
    script.id = "voiceflow-script";
    script.type = "text/javascript";
    script.async = true;
    
    script.onload = function() {
      console.log("Script Voiceflow încărcat");
      
      try {
        // @ts-ignore
        window.voiceflow?.chat?.load({
          verify: { projectID: '6856bef558a0da2b7a093b37' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          authorization: 'VF.DM.6856c9cdf49c34937af1f76d.MmNbyR0Slt13GzxS',
          user: {
            userID: userId,
            name: user?.fullName || 'Pacient'
          },
          render: {
            mode: "overlay",
            position: "right",
            size: "standard", 
            title: "Asistent Medical",
            description: "Asistentul tău medical virtual"
          },
          // Configurare simplificată fără extensii personalizate
          allowDangerousHTML: true
        });
        
        console.log("Voiceflow chat inițializat cu succes");
      } catch (error) {
        console.error("Eroare la inițializarea chatbot-ului:", error);
      }
    };
    
    script.onerror = function() {
      console.error("Eroare la încărcarea scriptului Voiceflow");
    };
    
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    document.head.appendChild(script);
    
    // Curăță la demontare
    return () => {
      const voiceflowScript = document.getElementById("voiceflow-script");
      if (voiceflowScript) {
        voiceflowScript.remove();
      }
    };
  }, [userId, user, isSignedIn]);
  
  return null;
};