interface VoiceflowChat {
  load: (config: any) => void;
  open: () => void;
  close: () => void;
  interact: (data: any) => void;
}

interface Voiceflow {
  chat: VoiceflowChat;
}

// Adaugă FormExtension la window
interface Window {
  voiceflow?: Voiceflow;
  FormExtension?: any;
}