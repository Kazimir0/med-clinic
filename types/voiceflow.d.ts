interface VoiceflowChat {
  load: (config: any) => void;
  open: () => void;
  close: () => void;
  interact: (data: any) => void;
}

interface Voiceflow {
  chat: VoiceflowChat;
}

// Extend the Window interface
interface Window {
  voiceflow?: Voiceflow;
  FormExtension?: any;
}