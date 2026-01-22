
import React, { useState, useEffect, useRef } from 'react';
import { Exercise, ExerciseType } from '../types';
import { AlertTriangle, Volume2, Loader2, BookOpen } from 'lucide-react';
import { generateSpeech } from '../services/gemini';
import katex from 'katex';

interface Props {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled: boolean;
  courseId: string;
}

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const MathText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  if (!text) return null;
  const parts = text.split('$');
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
           try {
             const html = katex.renderToString(part, { 
                throwOnError: false, 
                displayMode: false 
             });
             return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-1" />;
           } catch(e) {
             console.warn("KaTeX render error", e);
             return <span key={i} className="text-red-400">{part}</span>;
           }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export const ExerciseRenderer: React.FC<Props> = ({ exercise, onAnswer, disabled, courseId }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{id: string, word: string}[]>([]);
  
  // Matching State
  const [matchPairs, setMatchPairs] = useState<{id: string, text: string, pairId: number, state: 'default'|'selected'|'matched'|'wrong'}[]>([]);
  const [firstSelection, setFirstSelection] = useState<string | null>(null);
  const [matchError, setMatchError] = useState(false);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setSelectedWords([]);
    setFirstSelection(null);
    setMatchError(false);
    setAudioLoading(false);
    setIsPlaying(false);
    
    if (exercise.type === ExerciseType.TRANSLATE_TO_TARGET || exercise.type === ExerciseType.TRANSLATE_TO_SOURCE || exercise.type === ExerciseType.LISTENING) {
      const words = exercise.options?.map((w, i) => ({ id: `word-${i}`, word: w })) || [];
      setAvailableWords(shuffle(words));
    }

    if (exercise.type === ExerciseType.LISTENING && exercise.targetText) {
       playAudio(exercise.targetText, false);
    }

    if (exercise.type === ExerciseType.MATCH_PAIRS) {
      try {
        const pairs = exercise.pairs || [];
          
        if (pairs.length === 0) {
           if (typeof exercise.correctAnswer === 'string' && exercise.correctAnswer.startsWith('[')) {
               const parsed = JSON.parse(exercise.correctAnswer);
               pairs.push(...parsed.map((p: any) => ({ item: p[0], match: p[1] })));
           } else {
               throw new Error("No pairs found");
           }
        }

        const items: {id: string, text: string, pairId: number}[] = [];
        pairs.forEach((pair, idx) => {
          items.push({ id: `left-${idx}`, text: pair.item, pairId: idx });
          items.push({ id: `right-${idx}`, text: pair.match, pairId: idx });
        });
        
        setMatchPairs(shuffle(items).map(i => ({ ...i, state: 'default' as const })));
      } catch (e) {
        console.error("Failed to parse match pairs", e);
        setMatchError(true);
      }
    }
  }, [exercise]);

  const playAudio = async (text: string, isEnglish: boolean = false) => {
    if (isPlaying || audioLoading) return;

    if (isEnglish) {
       const u = new SpeechSynthesisUtterance(text);
       u.lang = 'en-US';
       window.speechSynthesis.speak(u);
       return;
    }

    setAudioLoading(true);
    const audioUrl = await generateSpeech(text, courseId);
    setAudioLoading(false);

    if (audioUrl) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current = new Audio(audioUrl);
        setIsPlaying(true);
        audioRef.current.play();
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
            setIsPlaying(false);
            console.error("Audio playback error");
        };
    }
  };

  // --- RENDERERS ---

  if (exercise.type === ExerciseType.INSTRUCTION) {
    useEffect(() => {
        if (!disabled) onAnswer(true);
    }, [disabled, onAnswer]);

    return (
        <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
             <div className="w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center text-neon-cyan shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                <BookOpen size={40} />
             </div>
             <h2 className="text-3xl font-display font-bold text-white text-center tracking-wide">New Concept</h2>
             
             <div className="bg-space-card border border-gray-700 p-8 rounded-2xl w-full text-lg leading-relaxed text-gray-200">
                 <MathText text={exercise.targetText || ""} />
             </div>
             
             <p className="text-gray-500 text-sm">Read the card above to unlock the next mission.</p>
        </div>
    );
  }

  const handleMatchClick = (id: string) => {
    if (disabled) return;
    
    const clickedItem = matchPairs.find(p => p.id === id);
    if (!clickedItem || clickedItem.state === 'matched' || clickedItem.state === 'wrong') return;

    if (firstSelection === id) {
        setFirstSelection(null);
        setMatchPairs(prev => prev.map(p => p.id === id ? { ...p, state: 'default' } : p));
        return;
    }

    if (!firstSelection) {
      setFirstSelection(id);
      setMatchPairs(prev => prev.map(p => p.id === id ? { ...p, state: 'selected' } : p));
    } else {
      const firstItem = matchPairs.find(p => p.id === firstSelection);
      if (!firstItem) return;

      const isMatch = firstItem.pairId === clickedItem.pairId;

      if (isMatch) {
        setMatchPairs(prev => prev.map(p => (p.id === firstSelection || p.id === id) ? { ...p, state: 'matched' } : p));
        setFirstSelection(null);
        
        const currentMatches = matchPairs.filter(p => p.state === 'matched').length + 2; 
        if (currentMatches === matchPairs.length) {
          onAnswer(true);
        }
      } else {
        setMatchPairs(prev => prev.map(p => (p.id === firstSelection || p.id === id) ? { ...p, state: 'wrong' } : p));
        setTimeout(() => {
            setMatchPairs(prev => prev.map(p => (p.id === firstSelection || p.id === id) ? { ...p, state: 'default' } : p));
            setFirstSelection(null);
        }, 800);
      }
    }
  };

  const TooltipText = ({ text, translation }: { text: string, translation?: string }) => (
    <div className="relative inline-block group cursor-help">
      <span className="border-b-2 border-dashed border-neon-cyan/50 hover:bg-neon-cyan/10 rounded px-1 transition-colors">
        <MathText text={text} />
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-space-dark text-sm font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
         {translation || "Click for hints"}
         <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
      </div>
    </div>
  );

  if (exercise.type === ExerciseType.SELECT_CORRECT) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-display font-bold text-white mb-8">
             <MathText text={exercise.question} />
        </h2>
        
        {exercise.targetText && (
           <div className="p-8 border border-neon-cyan/30 bg-neon-cyan/5 rounded-2xl mb-6 flex flex-col items-center shadow-[0_0_15px_rgba(0,240,255,0.1)] relative">
             <div className="flex items-center gap-4">
                 {!courseId.includes('math') && !courseId.includes('calc') && !courseId.includes('python') && (
                     <button 
                        onClick={() => playAudio(exercise.targetText!)}
                        disabled={audioLoading}
                        className="p-3 bg-neon-cyan/20 rounded-full hover:bg-neon-cyan/40 transition-colors text-neon-cyan disabled:opacity-50"
                     >
                        {audioLoading ? <Loader2 size={32} className="animate-spin" /> : <Volume2 size={32} className={isPlaying ? 'animate-pulse' : ''} />}
                     </button>
                 )}
                 <div className="text-4xl text-white font-bold" dir="auto">
                   <TooltipText text={exercise.targetText} translation={exercise.translation || "Translation unavailable"} />
                 </div>
             </div>
             {exercise.romaji && <span className="text-neon-cyan-dim text-lg tracking-widest font-mono mt-4">{exercise.romaji}</span>}
           </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {exercise.options?.map((option) => (
            <button
              key={option}
              disabled={disabled}
              onClick={() => {
                setSelectedOption(option);
                onAnswer(option === exercise.correctAnswer);
              }}
              className={`
                p-5 rounded-xl text-lg font-bold text-left transition-all btn-push border-2 flex items-center
                ${selectedOption === option 
                  ? 'bg-neon-purple/20 border-neon-purple text-white shadow-[0_0_15px_rgba(112,0,255,0.3)]' 
                  : 'bg-space-card border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
              dir="auto"
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                  ${selectedOption === option ? 'border-neon-purple bg-neon-purple' : 'border-gray-600'}
              `}>
                  {selectedOption === option && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <MathText text={option} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (exercise.type === ExerciseType.TRANSLATE_TO_TARGET || exercise.type === ExerciseType.TRANSLATE_TO_SOURCE || exercise.type === ExerciseType.LISTENING) {
    const isEnglish = exercise.type === ExerciseType.TRANSLATE_TO_TARGET;

    const handleWordClick = (wordObj: {id: string, word: string}) => {
      if (disabled) return;
      setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));
      setSelectedWords(prev => [...prev, wordObj.word]);
      
      const currentSentence = [...selectedWords, wordObj.word].join(' '); 
      const isEnglishTarget = exercise.type === ExerciseType.TRANSLATE_TO_SOURCE;
      
      if (exercise.type === ExerciseType.LISTENING) {
         const noSpaceLangs = ['japanese', 'thai', 'khmer', 'chinese'];
         const joinChar = noSpaceLangs.includes(courseId) ? '' : ' ';
         const attempt = [...selectedWords, wordObj.word].join(joinChar);
         const target = (exercise.correctAnswer as string).replace(/\s+/g, joinChar).trim();
         onAnswer(attempt === target);
      } else if (isEnglishTarget) {
         onAnswer(currentSentence === exercise.correctAnswer);
      } else {
         const attempt = [...selectedWords, wordObj.word].join('');
         const target = (exercise.correctAnswer as string).replace(/\s/g, '');
         onAnswer(attempt === target);
      }
    };

    const handleSelectedWordClick = (word: string, index: number) => {
       if (disabled) return;
       const newWordObj = { id: `returned-${Date.now()}`, word: word };
       setSelectedWords(prev => prev.filter((_, i) => i !== index));
       setAvailableWords(prev => [...prev, newWordObj]);
       
       const remainingWords = selectedWords.filter((_, i) => i !== index);
       
       if (exercise.type === ExerciseType.LISTENING) {
          const noSpaceLangs = ['japanese', 'thai', 'khmer', 'chinese'];
          const joinChar = noSpaceLangs.includes(courseId) ? '' : ' ';
          const attempt = remainingWords.join(joinChar);
          const target = (exercise.correctAnswer as string).replace(/\s+/g, joinChar).trim();
          onAnswer(attempt === target);
       } else if (exercise.type === ExerciseType.TRANSLATE_TO_SOURCE) {
          onAnswer(remainingWords.join(' ') === exercise.correctAnswer);
       } else {
          onAnswer(remainingWords.join('') === (exercise.correctAnswer as string).replace(/\s/g, ''));
       }
    };

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-display font-bold text-gray-300 mb-4">
             <MathText text={exercise.question} />
        </h2>
        
        <div className="flex items-center gap-6 mb-10">
          {exercise.type === ExerciseType.LISTENING ? (
             <button 
               onClick={() => playAudio(exercise.targetText!)}
               disabled={audioLoading}
               className="w-32 h-32 bg-neon-purple rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(112,0,255,0.4)] hover:scale-105 transition-transform mx-auto disabled:opacity-70 disabled:scale-100"
             >
                {audioLoading ? <Loader2 size={48} className="animate-spin" /> : <Volume2 size={48} className={isPlaying ? 'animate-pulse' : ''} />}
             </button>
          ) : (
             // FIX: Only render the avatar and bubble if targetText exists to prevent empty floating icons
             exercise.targetText ? (
                <>
                    <div className="w-20 h-20 hidden md:flex items-center justify-center bg-gradient-to-br from-neon-purple to-blue-600 rounded-2xl text-white font-bold text-xl shadow-lg border border-white/10">
                        AI
                    </div>
                    <div className="p-5 border border-neon-purple/50 bg-neon-purple/10 rounded-r-2xl rounded-bl-2xl relative flex items-center gap-3 pr-8">
                        {!courseId.includes('math') && !courseId.includes('calc') && !courseId.includes('python') && (
                            <button 
                                onClick={() => playAudio(exercise.targetText!, isEnglish)}
                                disabled={audioLoading}
                                className="p-2 bg-neon-purple/20 rounded-full hover:bg-neon-purple/40 text-neon-purple transition-colors disabled:opacity-50"
                            >
                                {audioLoading ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} />}
                            </button>
                        )}
                        <div>
                            <div className="text-xl text-white font-bold mb-1" dir="auto">
                                <TooltipText text={exercise.targetText} translation={exercise.translation || "Translation unavailable"} />
                            </div>
                            {exercise.romaji && !isEnglish && <p className="text-neon-purple text-sm font-mono">{exercise.romaji}</p>}
                        </div>
                    </div>
                </>
             ) : null
          )}
        </div>

        <div className="min-h-[70px] border-b-2 border-gray-700 flex flex-wrap gap-2 pb-4 mb-4" dir="auto">
          {selectedWords.map((word, idx) => (
             <button
               key={idx}
               onClick={() => handleSelectedWordClick(word, idx)}
               className="px-4 py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded-xl font-bold shadow-sm hover:bg-neon-cyan/30 animate-in zoom-in-50 duration-200"
             >
               <MathText text={word} />
             </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center" dir="auto">
           {availableWords.map((w) => (
             <button
               key={w.id}
               onClick={() => handleWordClick(w)}
               className="px-5 py-3 bg-space-card border-b-4 border-gray-700 rounded-xl font-bold text-gray-200 hover:bg-gray-700 hover:border-gray-600 active:border-b-0 active:translate-y-1 transition-all"
             >
               <MathText text={w.word} />
             </button>
           ))}
        </div>
      </div>
    );
  }

  if (exercise.type === ExerciseType.MATCH_PAIRS) {
    if (matchError || matchPairs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-neon-pink/10 border border-neon-pink rounded-2xl text-center space-y-4">
                <AlertTriangle size={48} className="text-neon-pink" />
                <h3 className="text-xl font-bold text-white">Neural Data Corrupted</h3>
                <p className="text-gray-400">The module failed to load the matching pairs correctly.</p>
                <button 
                  onClick={() => onAnswer(true)}
                  className="px-6 py-2 bg-neon-pink text-white font-bold rounded-lg hover:bg-neon-pink/80 transition-colors"
                >
                    Bypass Module
                </button>
            </div>
        );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-gray-300 mb-6">Link Neural Pairs</h2>
        <div className="grid grid-cols-2 gap-4">
          {matchPairs.map((item) => (
            <button
              key={item.id}
              disabled={item.state === 'matched' || disabled}
              onClick={() => handleMatchClick(item.id)}
              className={`
                h-20 rounded-xl border-b-4 flex items-center justify-center font-bold text-lg transition-all active:border-b-0 active:translate-y-1
                ${item.state === 'matched' ? 'opacity-0 cursor-default' : ''}
                ${item.state === 'selected' 
                   ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                   : ''}
                ${item.state === 'wrong' 
                   ? 'bg-neon-pink/20 border-neon-pink text-neon-pink animate-shake' 
                   : ''}
                ${item.state === 'default'
                   ? 'bg-space-card border-gray-700 text-gray-300 hover:border-gray-500' 
                   : ''}
              `}
              dir="auto"
            >
              <MathText text={item.text} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <div>Unknown exercise type</div>;
};
