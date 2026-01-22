
import { UserProgress, VocabularyItem } from "../types";

const LOCAL_STORAGE_KEY = 'linguaverse_state_v1';

// Internal storage structure
interface CourseData {
  xp: number;
  completedLessons: string[];
  vocabulary: Record<string, VocabularyItem>;
}

interface AppState {
  global: {
    username: string; // Keeps "Traveler" or similar
    hearts: number;
    streak: number;
    lastLessonDate: string | null;
  };
  courses: Record<string, CourseData>; // courseId -> data
  activeCourseId: string | null;
}

const DEFAULT_GLOBAL = {
  username: "Operative",
  hearts: 5,
  streak: 0,
  lastLessonDate: null,
};

const DEFAULT_COURSE_DATA: CourseData = {
  xp: 0,
  completedLessons: [],
  vocabulary: {},
};

const getEmptyState = (): AppState => ({
  global: { ...DEFAULT_GLOBAL },
  courses: {},
  activeCourseId: null,
});

export const StorageService = {
  // Load full state from localStorage
  loadState: (): AppState => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return getEmptyState();
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to load state", e);
      return getEmptyState();
    }
  },

  saveState: (state: AppState) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  },

  // Get the 'UserProgress' object consumed by the frontend for the ACTIVE course
  getProgress: (): UserProgress | null => {
    const state = StorageService.loadState();
    if (!state.activeCourseId || !state.courses[state.activeCourseId]) {
      return null; // Signals we need onboarding
    }

    const activeData = state.courses[state.activeCourseId];

    return {
      username: state.global.username,
      currentCourseId: state.activeCourseId,
      hearts: state.global.hearts,
      streak: state.global.streak,
      lastLessonDate: state.global.lastLessonDate,
      // Course specific:
      xp: activeData.xp,
      completedLessons: activeData.completedLessons,
      vocabulary: activeData.vocabulary,
    };
  },

  // Save the 'UserProgress' object back into the DB
  saveProgress: (progress: UserProgress) => {
    const state = StorageService.loadState();
    
    // Update Global
    state.global.hearts = progress.hearts;
    state.global.streak = progress.streak;
    state.global.lastLessonDate = progress.lastLessonDate;
    
    // Update Course Specific
    if (progress.currentCourseId) {
      if (!state.courses[progress.currentCourseId]) {
         state.courses[progress.currentCourseId] = { ...DEFAULT_COURSE_DATA };
      }
      state.courses[progress.currentCourseId].xp = progress.xp;
      state.courses[progress.currentCourseId].completedLessons = progress.completedLessons;
      state.courses[progress.currentCourseId].vocabulary = progress.vocabulary;
      
      // Ensure active ID matches
      state.activeCourseId = progress.currentCourseId;
    }

    StorageService.saveState(state);
  },

  // Used when user clicks "Add Course" or selects one during onboarding
  initCourse: (courseId: string): UserProgress => {
    const state = StorageService.loadState();
    
    if (!state.courses[courseId]) {
      state.courses[courseId] = { ...DEFAULT_COURSE_DATA };
    }
    state.activeCourseId = courseId;
    StorageService.saveState(state);

    return StorageService.getProgress()!;
  },

  getAvailableUserCourses: (): string[] => {
     const state = StorageService.loadState();
     return Object.keys(state.courses);
  },
  
  getLeaderboard: (): { username: string; xp: number }[] => {
    // Mock leaderboard
    const bots = [
      { username: 'Neo_Tokyo', xp: 1250 },
      { username: 'CyberSamurai', xp: 980 },
      { username: 'GlitchHiker', xp: 850 },
      { username: 'VaporWave', xp: 420 },
      { username: 'SynthPop', xp: 2100 }
    ];
    // Add current user
    const state = StorageService.loadState();
    // Sum total XP across all courses for the leaderboard? Or just active? 
    // Let's sum total.
    let totalXp = 0;
    Object.values(state.courses).forEach(c => totalXp += c.xp);

    const userEntry = { username: state.global.username, xp: totalXp };
    return [...bots, userEntry].sort((a, b) => b.xp - a.xp);
  }
};
