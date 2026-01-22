
import React, { useState, useEffect } from 'react';
import { Lesson as LessonType, ExerciseType, Exercise } from '../types';
import { ExerciseRenderer } from './ExerciseRenderer';
import { getGrammarTip, explainMistake } from '../services/gemini';
import { X, Heart, Check, Zap, Clock, Target, Book, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  lesson: LessonType;
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
  userHearts: number;
  reduceHeart: () => void;
  courseId: string;
}

export const Lesson: React.FC<Props> = ({ lesson, onComplete, onExit, userHearts, reduceHeart, courseId }) => {
  // Queue of exercises (allows re-adding mistakes)
  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Lesson Stats
  const [startTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Interaction State
  const [isCheckDisabled, setIsCheckDisabled] = useState(true);
  const [currentAnswerCorrect, setCurrentAnswerCorrect] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  // Guidebook State
  const [showGuidebook, setShowGuidebook] = useState(false);
  const [grammarTip, setGrammarTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  // Explanation State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Initialize queue
  useEffect(() => {
    setExerciseQueue(lesson.exercises);
  }, [lesson]);

  const currentExercise = exerciseQueue[currentIndex];
  const progressPercentage = ((currentIndex) / exerciseQueue.length) * 100;

  useEffect(() => {
    // Reset explanation when exercise changes
    setExplanation(null);
  }, [currentExercise]);

  const handleOpenGuidebook = async () => {
    setShowGuidebook(true);
    if (!grammarTip) {
      setLoadingTip(true);
      const tip = await getGrammarTip(lesson.topic, courseId);
      setGrammarTip(tip);
      setLoadingTip(false);
    }
  };

  const handleExplainMistake = async () => {
     if (!currentExercise) return;
     setLoadingExplanation(true);
     // We need to capture the user's implicit answer. 
     // Since ExerciseRenderer manages internal state for selection, we pass a generic "Wrong selection" string 
     // or improve ExerciseRenderer to bubble up the actual value.
     // For now, we will ask Gemini to explain the concept based on the question vs correct answer.
     const expl = await explainMistake(currentExercise.question, "Incorrect Selection", currentExercise.correctAnswer as string, courseId);
     setExplanation(expl);
     setLoadingExplanation(false);
  };

  const handleAnswerAttempt = (isCorrect: boolean) => {
    setCurrentAnswerCorrect(isCorrect);
    if (currentExercise.type === ExerciseType.MATCH_PAIRS) {
       if (isCorrect) {
         setStatus('CORRECT');
       }
    } else {
      setIsCheckDisabled(false);
    }
  };

  const handleCheck = () => {
    if (status === 'IDLE') {
      if (currentAnswerCorrect) {
        setStatus('CORRECT');
        const audio = new Audio('https://d35aaqx5ub95lt.cloudfront.net/sounds/37d8f0b39dcfe63872192c89653a93f6.mp3'); // Duo success sound (generic placeholder)
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } else {
        setStatus('WRONG');
        reduceHeart();
        setMistakes(prev => prev + 1);
        
        const audio = new Audio('https://d35aaqx5ub95lt.cloudfront.net/sounds/f52627237ad0230230f5b41223933c0e.mp3'); // Duo fail sound
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (userHearts <= 0 && status === 'WRONG') {
        onExit(); 
        return;
    }

    if (status === 'WRONG') {
       // Move current exercise to the end of the queue with a new ID to force re-render
       const retriedExercise = { ...currentExercise, id: `${currentExercise.id}-retry-${Date.now()}` };
       setExerciseQueue(prev => [...prev, retriedExercise]);
    }

    if (currentIndex < exerciseQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStatus('IDLE');
      setIsCheckDisabled(true);
      setCurrentAnswerCorrect(false);
    } else {
      // Finished
      setEndTime(Date.now());
      setIsFinished(true);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#7000FF', '#ffffff']
      });
    }
  };

  // --- SUMMARY VIEW ---
  if (isFinished) {
    const totalTimeSeconds = Math.floor((endTime! - startTime) / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    
    // Accuracy based on initial exercise count vs mistakes
    const initialCount = lesson.exercises.length;
    const accuracy = Math.max(0, Math.round(((initialCount) / (initialCount + mistakes)) * 100));
    const xpEarned = 10 + Math.floor(accuracy / 10);

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto bg-space-dark items-center justify-center p-8">
            <h1 className="text-4xl font-display font-black text-neon-cyan mb-12 tracking-widest uppercase">Mission Complete</h1>
            
            <div className="grid grid-cols-3 gap-4 w-full mb-12">
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center border border-neon-purple/50">
                    <span className="text-neon-purple font-bold uppercase text-sm mb-2">Total XP</span>
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-400 fill-current" size={32} />
                        <span className="text-4xl font-display font-bold text-white">{xpEarned}</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center border border-neon-cyan/50">
                    <span className="text-neon-cyan font-bold uppercase text-sm mb-2">Accuracy</span>
                    <div className="flex items-center gap-2">
                        <Target className="text-neon-cyan" size={32} />
                        <span className="text-4xl font-display font-bold text-white">{accuracy}%</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center border border-neon-green/50">
                    <span className="text-neon-green font-bold uppercase text-sm mb-2">Time</span>
                    <div className="flex items-center gap-2">
                        <Clock className="text-neon-green" size={32} />
                        <span className="text-4xl font-display font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onComplete(xpEarned)}
                className="w-full max-w-md py-4 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-xl font-display font-bold text-xl text-white tracking-widest shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 transition-transform"
            >
                CONTINUE
            </button>
        </div>
    );
  }

  // --- LOADING / EXERCISE VIEW ---
  if (!currentExercise) return <div className="h-screen flex items-center justify-center text-neon-cyan animate-pulse">Initializing...</div>;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-space-dark relative">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button onClick={onExit} className="text-gray-500 hover:text-white transition-colors">
          <X size={28} />
        </button>
        
        <div className="flex-1 mx-4 md:mx-6 h-3 bg-gray-800 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-500 ease-out shadow-[0_0_10px_#00F0FF]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
            <button onClick={handleOpenGuidebook} className="text-neon-cyan hover:text-white transition-colors">
                <Book size={24} />
            </button>
            <div className="flex items-center text-neon-pink font-bold font-display text-xl">
                <Heart className="fill-current mr-2 drop-shadow-[0_0_5px_rgba(255,0,153,0.5)]" size={24} />
                {userHearts}
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-40">
        <ExerciseRenderer 
          key={currentExercise.id} 
          exercise={currentExercise} 
          onAnswer={handleAnswerAttempt}
          disabled={status !== 'IDLE'}
          courseId={courseId}
        />
      </div>

      {/* Footer */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-6 md:p-8 border-t border-glass-border backdrop-blur-xl transition-colors duration-300
        ${status === 'CORRECT' ? 'bg-neon-green/10 border-t-neon-green' : ''}
        ${status === 'WRONG' ? 'bg-neon-pink/10 border-t-neon-pink' : ''}
        ${status === 'IDLE' ? 'bg-space-dark/80' : ''}
        flex flex-col items-center max-w-3xl mx-auto
      `}>
        
        {status === 'CORRECT' && (
          <div className="w-full flex items-center mb-4 animate-in slide-in-from-bottom-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-neon-green text-black font-bold shadow-[0_0_15px_#00FF94]">
              <Check size={28} />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl text-neon-green">Correct</h3>
              <p className="text-green-200 text-sm">System synchronized.</p>
            </div>
          </div>
        )}

        {status === 'WRONG' && (
          <div className="w-full mb-4 animate-in slide-in-from-bottom-5">
            <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-neon-pink text-white font-bold shadow-[0_0_15px_#FF0099]">
                        <X size={28} />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-neon-pink">Incorrect</h3>
                </div>
                
                {/* EXPLAIN MISTAKE BUTTON */}
                {!explanation && !loadingExplanation && (
                    <button 
                        onClick={handleExplainMistake}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-pink/20 border border-neon-pink text-neon-pink text-sm font-bold hover:bg-neon-pink/40 transition-colors"
                    >
                        <HelpCircle size={16} /> Explain Why
                    </button>
                )}
            </div>

            <div className="ml-16 text-lg text-white font-mono bg-black/30 p-3 rounded-lg border border-neon-pink/30">
               <span className="text-neon-pink font-bold text-xs block mb-1 uppercase tracking-wider">
                  {currentExercise.type === ExerciseType.SELECT_CORRECT ? 'Correct Answer' : 'Correct Solution'}
               </span>
               {currentExercise.type === ExerciseType.TRANSLATE_TO_TARGET 
                  ? currentExercise.correctAnswer 
                  : Array.isArray(currentExercise.correctAnswer) 
                      ? 'See matches above' 
                      : currentExercise.correctAnswer
               }
            </div>

            {/* AI EXPLANATION BOX */}
            {(explanation || loadingExplanation) && (
                <div className="mt-4 ml-16 bg-space-card/80 p-4 rounded-xl border border-neon-cyan/30 text-sm text-gray-200 leading-relaxed">
                   {loadingExplanation ? (
                       <div className="flex items-center gap-2 text-neon-cyan">
                           <Loader2 size={16} className="animate-spin" /> Analyzing neural discrepancy...
                       </div>
                   ) : (
                       <div className="flex gap-3">
                           <div className="shrink-0 pt-1 text-neon-cyan"><Book size={16} /></div>
                           <div>{explanation}</div>
                       </div>
                   )}
                </div>
            )}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={status === 'IDLE' && isCheckDisabled && currentExercise.type !== ExerciseType.MATCH_PAIRS}
          className={`
            w-full py-4 rounded-xl font-display font-bold text-xl tracking-widest btn-push shadow-lg transition-all
            ${status === 'IDLE' 
                ? (isCheckDisabled && currentExercise.type !== ExerciseType.MATCH_PAIRS 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-[0_0_20px_rgba(0,240,255,0.4)]')
                : ''
            }
            ${status === 'CORRECT' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(0,255,148,0.4)]' : ''}
            ${status === 'WRONG' ? 'bg-neon-pink text-white shadow-[0_0_20px_rgba(255,0,153,0.4)]' : ''}
          `}
        >
          {status === 'IDLE' ? 'CHECK' : 'CONTINUE'}
        </button>
      </div>

      {/* Guidebook Modal */}
      {showGuidebook && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel rounded-2xl p-6 border border-neon-cyan/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setShowGuidebook(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                <div className="mb-4">
                    <h2 className="text-2xl font-display font-bold text-white mb-1 uppercase tracking-widest">Guidebook</h2>
                    <p className="text-neon-cyan text-sm font-bold">{lesson.topic}</p>
                </div>
                
                <div className="bg-space-card/50 p-4 rounded-xl border border-gray-700 min-h-[150px] text-gray-200 leading-relaxed text-sm">
                    {loadingTip ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-gray-500">
                            <Loader2 className="animate-spin text-neon-cyan" size={32} />
                            <span>Downloading neural data...</span>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: grammarTip?.replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-cyan">$1</strong>') || '' }} />
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
