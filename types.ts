
export enum ExerciseType {
  INSTRUCTION = 'INSTRUCTION', // New type for teaching before testing
  TRANSLATE_TO_TARGET = 'TRANSLATE_TO_TARGET',
  TRANSLATE_TO_SOURCE = 'TRANSLATE_TO_SOURCE',
  SELECT_CORRECT = 'SELECT_CORRECT',
  MATCH_PAIRS = 'MATCH_PAIRS',
  LISTENING = 'LISTENING',
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string | string[]; 
  pairs?: { item: string; match: string }[]; 
  options?: string[]; 
  translation?: string; 
  targetText?: string; 
  romaji?: string; 
}

export interface VocabularyItem {
  id: string;
  word: string;     
  meaning: string;  
  reading?: string; 
  nextReview: number; 
  interval: number;   
  repetition: number; 
  easeFactor: number; 
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  exercises: Exercise[];
  vocabularyList?: { word: string; meaning: string; reading: string }[]; 
  color: string;
  icon: string;
  completed?: boolean;
  locked?: boolean;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  level: string; 
  color: string;
  lessons: Lesson[];
}

export interface UserProgress {
  username: string | null;
  currentCourseId: string; 
  hearts: number;
  xp: number;
  streak: number;
  lastLessonDate: string | null; 
  completedLessons: string[]; 
  vocabulary: Record<string, VocabularyItem>; 
}

export enum AppView {
  ONBOARDING = 'ONBOARDING', 
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  RESULT = 'RESULT',
  CHARACTERS = 'CHARACTERS',
  VOCABULARY = 'VOCABULARY',
  WRITING = 'WRITING',
  ROLEPLAY = 'ROLEPLAY',
  LEADERBOARD = 'LEADERBOARD'
}
