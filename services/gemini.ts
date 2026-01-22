
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { Exercise, ExerciseType } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const lessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    vocabularyList: {
      type: Type.ARRAY,
      description: "List of 5-7 key terms, functions, or vocabulary items.",
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: "The term/code/formula" },
          reading: { type: Type.STRING, description: "Pronunciation or syntax signature" },
          meaning: { type: Type.STRING, description: "Definition or explanation" }
        }
      }
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [
              "INSTRUCTION",
              "TRANSLATE_TO_TARGET",
              "TRANSLATE_TO_SOURCE",
              "SELECT_CORRECT",
              "MATCH_PAIRS",
              "LISTENING"
            ],
            description: "The type of exercise."
          },
          question: {
            type: Type.STRING,
            description: "Instruction. NO ANSWERS IN QUESTION."
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer string."
          },
          pairs: {
             type: Type.ARRAY,
             description: "ONLY for MATCH_PAIRS. Array of objects with item and match.",
             items: {
                type: Type.OBJECT,
                properties: {
                   item: { type: Type.STRING },
                   match: { type: Type.STRING }
                }
             }
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Options for multiple choice."
          },
          targetText: {
            type: Type.STRING,
            description: "Content in the target subject (Code, Math Problem, Target Language)."
          },
          romaji: {
            type: Type.STRING,
            description: "Helper text (Transliteration or Hint)."
          },
          translation: {
            type: Type.STRING,
            description: "English translation or explanation."
          }
        },
        required: ["type", "question", "correctAnswer"]
      }
    }
  }
};

export const generateLessonContent = async (topic: string, targetLanguage: string): Promise<{ exercises: Exercise[], vocabulary: any[] }> => {
  try {
    const model = "gemini-3-flash-preview";
    
    let subjectContext = `You are a language teacher teaching ${targetLanguage}.`;
    
    // Default directives
    let exerciseDirectives = `
    1. **FIRST ITEM MUST BE 'INSTRUCTION'**: Explain the new concept/grammar/vocabulary clearly. 'targetText' should contain the explanation. 'question' should be 'Read and Learn'. 'correctAnswer' can be 'OK'.
    2. Exercises 2-7: Test ONLY the material introduced in the INSTRUCTION.
    3. Types: Translate, Select Correct, Match Pairs, Listening.
    4. **TRANSLATION RULE**: For 'TRANSLATE_TO_TARGET' or 'TRANSLATE_TO_SOURCE', you **MUST** put the phrase to be translated in the 'targetText' field. The 'question' field is just the instruction (e.g., "Translate this phrase").
    `;

    if (targetLanguage === 'Python') {
        subjectContext = `You are a Python coding tutor. Teaching topic: ${topic}.`;
        exerciseDirectives = `
        1. **FIRST ITEM MUST BE 'INSTRUCTION'**: Explain the Python concept/syntax with a short example in 'targetText'.
        2. 'SELECT_CORRECT': Show code. Ask "Output?" or "Find bug".
        3. 'MATCH_PAIRS': Match function to description.
        4. Test ONLY what was just explained.
        `;
    } else if (targetLanguage.includes('Calculus') || targetLanguage.includes('Precalc')) {
        subjectContext = `You are a Math professor teaching ${targetLanguage}. Topic: ${topic}.`;
        exerciseDirectives = `
        1. **FIRST ITEM MUST BE 'INSTRUCTION'**: Explain the formula/concept in LaTeX ('$'). 'targetText' holds the lesson.
        2. 'SELECT_CORRECT': Solve problem based on the instruction.
        3. 'MATCH_PAIRS': Match term to definition.
        4. Test ONLY what was just explained.
        `;
    }

    const prompt = `${subjectContext}
    Generate a lesson about "${topic}".
    
    ALSO generate 5-7 key vocabulary items (terms, syntax, or words).

    Structure:
    ${exerciseDirectives}

    CRITICAL RULES:
    - **PEDAGOGY**: Do NOT ask questions about concepts you haven't explained in the first 'INSTRUCTION' card.
    - NO answers in 'question' field.
    - For 'MATCH_PAIRS', do NOT use 'correctAnswer'. Instead, fill the 'pairs' array.
    - If Math: ALWAYS use LaTeX formatting enclosed in '$' symbols.
    - JSON ONLY response.
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonSchema,
      }
    });

    const cleanText = (response.text || "{}").replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanText);
    
    return {
      exercises: data.exercises?.map((ex: any, index: number) => ({
        ...ex,
        id: `ex-${Date.now()}-${index}`,
        type: ex.type as ExerciseType
      })) || [],
      vocabulary: data.vocabularyList || []
    };

  } catch (error) {
    console.error("Gemini generation error:", error);
    return { 
        exercises: [{
            id: 'fallback-error',
            type: ExerciseType.INSTRUCTION,
            question: "System Error",
            targetText: "Neural link unstable. Please reload the module.",
            correctAnswer: "Reload"
        }], 
        vocabulary: [] 
    };
  }
};

export const gradeWritingSubmission = async (text: string, topic: string, language: string): Promise<string> => {
  try {
     const prompt = `
     Act as a strict but helpful tutor for ${language}.
     The student wrote a text about "${topic}".
     
     Student Text: "${text}"

     Task:
     1. Give a score out of 100.
     2. Correct any grammar or vocabulary mistakes.
     3. Provide 2-3 specific tips for improvement.
     
     Format the output as simple Markdown (bolding key parts). Keep it encouraging but precise.
     `;

     const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
     });
     return response.text || "Grading system offline.";
  } catch (e) {
     return "Error grading submission.";
  }
};

export const getGrammarTip = async (topic: string, language: string): Promise<string> => {
  try {
    const prompt = `Provide a concise, helpful tip about "${topic}" for a beginner learning ${language}. 
    If coding, explain the syntax. If math, show the formula in LaTeX enclosed in '$'. Keep under 100 words.`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Keep practicing!";
  } catch (e) {
    return "Tip unavailable offline.";
  }
};

// --- NEW FUNCTION: Explain Mistake ---
export const explainMistake = async (question: string, userAnswer: string, correctAnswer: string, language: string): Promise<string> => {
  try {
    const prompt = `
    The student is learning ${language}.
    Question/Exercise: "${question}"
    Correct Answer: "${correctAnswer}"
    Student's Wrong Answer: "${userAnswer}"

    Briefly explain (in 1-2 sentences) WHY the student's answer is wrong and why the correct answer is right. 
    Focus on grammar, vocabulary nuance, or syntax. Be encouraging.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Analysis complete: Incorrect syntax detected.";
  } catch (e) {
    return "Neural connection failed. Please try again.";
  }
};

// --- NEW FUNCTION: Roleplay ---
export const generateRoleplayResponse = async (history: {role: string, text: string}[], language: string, scenario: string): Promise<string> => {
  try {
    const prompt = `
    You are a roleplay partner helping a student learn ${language}.
    Scenario: ${scenario}.
    
    Rules:
    1. Respond naturally to the last message.
    2. Keep responses short (1-2 sentences).
    3. Correct major mistakes gently at the end of your response in (parentheses), but keep the conversation flowing.
    4. If the student speaks English, gently remind them to use ${language}.
    
    Conversation History:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "...";
  } catch (e) {
    return "Comms link disrupted.";
  }
};

export const runPythonSimulation = async (code: string): Promise<string> => {
  try {
     const prompt = `Act as a Python interpreter. Execute the following code. 
     Return ONLY the output. If there is an error, return the error message.
     Do not include markdown blocks.
     Code:
     ${code}`;

     const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
     });
     return response.text || "";
  } catch(e) {
     return "Error connecting to neural mainframe.";
  }
};

const audioCache = new Map<string, string>();

export const generateSpeech = async (text: string, language: string): Promise<string | null> => {
  if (language === 'python' || language.includes('calculus') || language.includes('precalc')) return null;

  const cacheKey = `${language}:${text}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: `Say in ${language}: "${text}"` }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wavBlob = pcmToWav(bytes, 24000); 
    const url = URL.createObjectURL(wavBlob);
    
    audioCache.set(cacheKey, url);
    return url;

  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
};

function pcmToWav(pcmData: Uint8Array, sampleRate: number) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);

    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
}
