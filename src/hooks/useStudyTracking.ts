import { useEffect } from 'react';
import { useStudySessionStore } from '../stores/studySessionStore';

export const useStudyTracking = (activityType: string) => {
  const { startStudySession, endStudySession } = useStudySessionStore();

  useEffect(() => {
    // Start study session when component mounts
    startStudySession(activityType);

    // End study session when component unmounts
    return () => {
      endStudySession(activityType);
    };
  }, [activityType, startStudySession, endStudySession]);

  return {
    startSession: () => startStudySession(activityType),
    endSession: () => endStudySession(activityType)
  };
}; 