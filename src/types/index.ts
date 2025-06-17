export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPro: boolean;
  createdAt: Date;
  lastLogin: Date;
  stats: {
    simulatorAccuracy: number;
    flashcardsReviewed: number;
    streakDays: number;
    totalStudyHours: number;
    researchSummariesCreated: number;
  };
}

export interface Demographics {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  race: string;
  occupation: string;
}

export interface MedicalProfile {
  allergies: string[];
  medications: string[];
  pastHistory: string[];
  familyHistory: string[];
}

export interface Symptoms {
  primary: string[];
  secondary: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Diagnosis {
  condition: string;
  description: string;
  differentials: string[];
  treatment: string;
  prognosis: string;
}

export interface PatientCase {
  id: string;
  demographics: Demographics;
  medicalProfile: MedicalProfile;
  symptoms: Symptoms;
  chiefComplaint: string;
  narrative: string[];
  narrativeDuration: number;
  emotionalState: 'Anxious' | 'Calm' | 'Irritable' | 'Confused' | 'Distressed';
  diagnosis: Diagnosis;
  name?: string;
  age?: number;
  gender?: string;
  ethnicity?: string;
  vitalSigns?: {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
    oxygenSaturation: string;
  };
  physicalExam?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  imageUrl?: string;
  explanation?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: number;
  lastReviewed: Date;
  nextReview: Date;
  correctCount: number;
  incorrectCount: number;
  createdAt: Date;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  category: 'exam' | 'assignment' | 'rotation' | 'application' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
}

export interface Mnemonic {
  id: string;
  term: string;
  mnemonic: string;
  explanation: string;
  category: string;
  tags: string[];
  isCustom: boolean;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  type: 'simulator' | 'flashcards' | 'mnemonics';
  startTime: Date;
  endTime: Date;
  correct: number;
  incorrect: number;
  totalQuestions: number;
}