// ElevenLabs API integration for voice synthesis
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export const defaultVoiceSettings: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

export const generateSpeech = async (
  text: string,
  voiceId: string,
  settings: VoiceSettings = defaultVoiceSettings
): Promise<ArrayBuffer> => {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: settings,
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return response.arrayBuffer();
};

export const playGeneratedSpeech = async (
  text: string,
  voiceId: string,
  settings?: VoiceSettings
): Promise<HTMLAudioElement> => {
  try {
    const audioBuffer = await generateSpeech(text, voiceId, settings);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    audio.play();
    
    // Clean up the URL when audio ends
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });
    
    return audio;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
};

// Available voice IDs for different demographics
export const VOICE_IDS = {
  YOUNG_FEMALE: 'EXAVITQu4vr4xnSDxMaL',
  OLDER_FEMALE: 'pNInz6obpgDQGcFmaJgB',
  YOUNG_MALE: 'ErXwobaYiN019PkySvjV',
  OLDER_MALE: '2EiwWnXFnvU5JabPnv8n',
  NARRATOR: 'onwK4e9ZLuTAKqWW03F9', // Professional narrator voice
};