import { VocabularyItem } from "../types";

// SM-2 Algorithm Implementation
// q: 0-5 rating (we will simplify to: 0=Wrong, 3=Hard, 5=Easy/Correct)
export const calculateSRS = (item: VocabularyItem, grade: number): VocabularyItem => {
  let { interval, repetition, easeFactor } = item;

  if (grade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

  return {
    ...item,
    interval,
    repetition,
    easeFactor,
    nextReview
  };
};

export const createNewVocabItem = (word: string, meaning: string, reading: string): VocabularyItem => {
  return {
    id: btoa(unescape(encodeURIComponent(word))), // simple base64 id
    word,
    meaning,
    reading,
    nextReview: Date.now(), // Due immediately
    interval: 0,
    repetition: 0,
    easeFactor: 2.5
  };
};
