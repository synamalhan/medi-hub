// Tavus AI integration for demo video generation
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface VideoGenerationRequest {
  script: string;
  replica_id?: string;
  video_name?: string;
  callback_url?: string;
}

export interface VideoGenerationResponse {
  video_id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  download_url?: string;
  thumbnail_url?: string;
}

// Generate demo video script for MediHub
export const generateDemoScript = (): string => {
  return `
Welcome to MediHub - the revolutionary AI-enhanced learning platform designed specifically for medical students.

I'm excited to show you how MediHub consolidates all your essential study tools into one intelligent, user-friendly system.

Let me walk you through our core features:

First, our AI Patient Simulator. Practice with realistic virtual patients powered by advanced AI. Each case includes voice interactions, comprehensive medical histories, and challenging diagnostic scenarios that mirror real clinical situations.

Next, our Adaptive Flashcard System. Using spaced repetition algorithms, MediHub optimizes your study schedule based on your performance, ensuring you focus on areas that need the most attention while reinforcing your strengths.

Our Smart Deadline Tracker keeps you organized with countdown timers for exams, assignments, and rotations. Never miss another important date with our intelligent priority management system.

The AI Mnemonic Generator creates personalized memory aids for complex medical concepts. Whether you're memorizing cranial nerves or drug classifications, our AI helps you build memorable associations.

For our Pro users, Advanced Analytics provides detailed performance insights, study recommendations, and personalized learning paths based on your progress across all features.

MediHub evolves with you - from pre-clinical years through Step exams, clinical rotations, and beyond. Our platform adapts to your learning style and helps you build confidence in clinical reasoning.

Join thousands of medical students who are already using MediHub to study more effectively, retain more information, and feel more confident in their medical knowledge.

Ready to transform your medical education? Sign up for MediHub today and experience the future of medical learning.
  `.trim();
};

export const generateVideo = async (
  script: string,
  replicaId?: string,
  videoName?: string
): Promise<VideoGenerationResponse> => {
  if (!TAVUS_API_KEY) {
    throw new Error('Tavus API key not configured');
  }

  const response = await fetch(`${TAVUS_API_URL}/videos`, {
    method: 'POST',
    headers: {
      'x-api-key': TAVUS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script,
      replica_id: replicaId,
      video_name: videoName || 'MediHub Demo Video',
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavus API error: ${response.statusText}`);
  }

  return response.json();
};

export const getVideoStatus = async (videoId: string): Promise<VideoGenerationResponse> => {
  if (!TAVUS_API_KEY) {
    throw new Error('Tavus API key not configured');
  }

  const response = await fetch(`${TAVUS_API_URL}/videos/${videoId}`, {
    headers: {
      'x-api-key': TAVUS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Tavus API error: ${response.statusText}`);
  }

  return response.json();
};

// Generate and manage demo video for landing page
export const createDemoVideo = async (): Promise<string> => {
  try {
    const script = generateDemoScript();
    const response = await generateVideo(script, 'r9fa0878977a', 'MediHub Platform Demo');
    return response.video_id;
  } catch (error) {
    console.error('Error creating demo video:', error);
    throw error;
  }
};