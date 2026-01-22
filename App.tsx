
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Lesson, UserProgress, Unit, VocabularyItem } from './types';
import { generateLessonContent } from './services/gemini';
import { StorageService } from './services/storage';
import { generateCurriculum, AVAILABLE_COURSES } from './services/curriculum';
import { calculateSRS, createNewVocabItem } from './services/srs';
import { Dashboard } from './components/Dashboard';
import { Lesson as LessonView } from './components/Lesson';
import { Login as Onboarding } from './components/Login'; // Repurposed component
import { Characters } from './components/Characters';
import { Vocabulary } from './components/Vocabulary';
import { WritingLab } from './components/WritingLab';
import { Roleplay } from './components/Roleplay';
import { Leaderboard } from './components/Leaderboard';
import { Zap, Heart, BookOpen, User, ChevronDown, Plus, PenTool, MessageSquare, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Header State
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const savedProgress = StorageService.getProgress();
    if (savedProgress) {
        handleLoadCourse(savedProgress);
    } else {
        setView(AppView.ONBOARDING);
    }
    setIsInitializing(false);
  }, []);

  // Save Progress on Change
  useEffect(() => {
    if (progress) {
      StorageService.saveProgress(progress);
    }
  }, [progress]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoadCourse = (userProgress: UserProgress) => {
    // Generate/Load curriculum for this course
    const newUnits = generateCurriculum(userProgress.currentCourseId);
    setUnits(newUnits);
    
    // Calculate Streak
    const updatedStreak = calculateStreak(userProgress);
    const finalProgress = { ...userProgress, streak: updatedStreak };
    
    setProgress(finalProgress);
    setView(AppView.DASHBOARD);
  };

  const calculateStreak = (p: UserProgress): number => {
    if (!p.lastLessonDate) return 0;
    const last = new Date(p.lastLessonDate);
    const today = new Date();
    
    const lastDate = last.toDateString();
    const todayDate = today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toDateString();

    if (todayDate === lastDate) return p.streak;
    if (lastDate === yesterdayDate) return p.streak;
    return 0; 
  };

  const handleStartLesson = async (lessonStub: Lesson) => {
    setIsLoading(true);
    const activeCourseMeta = AVAILABLE_COURSES.find(c => c.id === progress?.currentCourseId) || AVAILABLE_COURSES[0];
    const { exercises, vocabulary } = await generateLessonContent(lessonStub.topic, activeCourseMeta.title);
    
    setActiveLesson({
        ...lessonStub,
        exercises: exercises,
        vocabularyList: vocabulary
    });
    setIsLoading(false);
    setView(AppView.LESSON);
  };

  const handleStartTraining = async () => {
    if (!progress || Object.keys(progress.vocabulary).length === 0) return;
    setIsLoading(true);

    // Get Vocabulary Items
    const vocabItems = Object.values(progress.vocabulary) as VocabularyItem[];
    
    // Sort by Due Date (Most overdue first) and then by ease factor (hardest first)
    // Actually, just sorting by nextReview covers due items.
    const sortedItems = vocabItems.sort((a, b) => a.nextReview - b.nextReview);
    
    // Pick top 10 words to review
    const reviewSet = sortedItems.slice(0, 10);
    const wordsString = reviewSet.map(v => v.word).join(', ');

    const activeCourseMeta = AVAILABLE_COURSES.find(c => c.id === progress.currentCourseId) || AVAILABLE_COURSES[0];
    
    // Generate Review Content
    const { exercises } = await generateLessonContent(`Review: ${wordsString}`, activeCourseMeta.title);

    const trainingLesson: Lesson = {
        id: `training-${Date.now()}`,
        title: 'Neural Refresh',
        topic: 'Review',
        description: 'Targeted practice for your active neural pathways.',
        exercises: exercises,
        vocabularyList: [], // We don't add "new" vocabulary during review
        color: 'neon-pink',
        icon: 'dumbbell'
    };

    setActiveLesson(trainingLesson);
    setIsLoading(false);
    setView(AppView.LESSON);
  };

  const handleLessonComplete = (xpEarned: number) => {
    if (!progress) return;
    const now = new Date();
    
    // Streak Logic
    let newStreak = progress.streak;
    if (progress.lastLessonDate) {
        const last = new Date(progress.lastLessonDate).toDateString();
        const today = now.toDateString();
        if (last !== today) {
           const yesterday = new Date(); 
           yesterday.setDate(yesterday.getDate() - 1);
           if (last === yesterday.toDateString()) {
             newStreak += 1;
           } else {
             newStreak = 1;
           }
        }
    } else {
        newStreak = 1;
    }

    // SRS Update Logic
    const newVocabMap = { ...progress.vocabulary };
    
    // 1. Update items from current lesson (if new)
    activeLesson?.vocabularyList?.forEach(v => {
      const id = btoa(unescape(encodeURIComponent(v.word)));
      if (!newVocabMap[id]) {
        newVocabMap[id] = createNewVocabItem(v.word, v.meaning, v.reading || '');
      } else {
        newVocabMap[id] = calculateSRS(newVocabMap[id], 4); 
      }
    });

    // 2. If this was a Review/Training lesson, update the reviewed items
    // (In a real app, we'd track per-exercise success, here we assume a 'pass' on the lesson bumps them)
    if (activeLesson?.id.startsWith('training')) {
        const sorted = (Object.values(newVocabMap) as VocabularyItem[]).sort((a, b) => a.nextReview - b.nextReview).slice(0, 10);
        sorted.forEach(item => {
             newVocabMap[item.id] = calculateSRS(item, 4);
        });
    }

    setProgress(prev => prev ? ({
        ...prev,
        xp: prev.xp + xpEarned,
        hearts: 5, // Reset hearts to full
        streak: newStreak,
        lastLessonDate: now.toISOString(),
        completedLessons: activeLesson?.id.startsWith('training') 
            ? prev.completedLessons 
            : Array.from(new Set([...prev.completedLessons, activeLesson!.id])),
        vocabulary: newVocabMap
    }) : null);
    
    setView(AppView.DASHBOARD);
    setActiveLesson(null);
  };

  const handleExitLesson = () => {
    setView(AppView.DASHBOARD);
    setActiveLesson(null);
  };

  const reduceHeart = () => {
      setProgress(prev => prev ? ({ ...prev, hearts: prev.hearts - 1 }) : null);
  };

  const handleCourseSelection = (courseId: string) => {
     const newProgress = StorageService.initCourse(courseId);
     handleLoadCourse(newProgress);
  };

  const handleAddCourseClick = () => {
      setShowLangDropdown(false);
      setView(AppView.ONBOARDING);
  };

  if (isInitializing) {
     return (
        <div className="min-h-screen bg-space-dark flex items-center justify-center">
             <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
     );
  }

  const activeCourseMeta = AVAILABLE_COURSES.find(c => c.id === progress?.currentCourseId);
  const userCourses = StorageService.getAvailableUserCourses();

  const getCharacterIcon = (id: string | undefined) => {
     switch(id) {
        case 'hebrew': return 'א';
        case 'russian': return 'Ж';
        case 'korean': return '가';
        case 'greek': return 'Ω';
        case 'farsi': return 'ا';
        case 'arabic': return 'ع';
        case 'khmer': return 'ក';
        case 'thai': return 'ก';
        case 'hindi': return 'अ';
        case 'yiddish': return 'א';
        case 'chinese': return '中';
        case 'spanish': return 'Ñ';
        case 'french': return 'Ç';
        case 'german': return 'Ü';
        case 'portuguese': return 'Ã';
        case 'georgian': return 'ა';
        case 'kurdish': return 'K';
        case 'latin': return 'V';
        default: return 'あ';
     }
  };

  return (
    <div className="min-h-screen font-sans text-gray-200">
      
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mb-6"></div>
             <h2 className="text-2xl font-display font-bold text-white tracking-widest">GENERATING NEURAL LINK...</h2>
        </div>
      )}

      {view === AppView.ONBOARDING && (
        <Onboarding onSelectCourse={handleCourseSelection} />
      )}

      {(view !== AppView.ONBOARDING && view !== AppView.LESSON && progress) && (
        <>
            <header className="sticky top-0 bg-space-dark/90 backdrop-blur-md z-30 border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="cursor-pointer flex items-center gap-3" onClick={() => setView(AppView.DASHBOARD)}>
                           <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg"></div>
                           <h1 className="hidden md:block text-2xl font-display font-black text-white tracking-tighter">LINGUA<span className="text-neon-cyan">VERSE</span></h1>
                        </div>
                        
                        {/* Course Selector */}
                        <div className="relative" ref={dropdownRef}>
                           <button 
                             onClick={() => setShowLangDropdown(!showLangDropdown)}
                             className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-gray-700"
                           >
                              <img src={activeCourseMeta?.flag} className="w-6 h-6 rounded-md shadow-sm object-cover bg-gray-700" alt="Flag" />
                              <span className="hidden md:block font-bold text-gray-300 uppercase text-sm tracking-wide">{activeCourseMeta?.title}</span>
                              <ChevronDown size={16} className="text-gray-500" />
                           </button>

                           {showLangDropdown && (
                              <div className="absolute top-full left-0 mt-2 w-56 glass-panel rounded-xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2 space-y-1">
                                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">My Courses</div>
                                  {userCourses.map(id => {
                                      const meta = AVAILABLE_COURSES.find(c => c.id === id);
                                      if (!meta) return null;
                                      return (
                                        <button 
                                          key={id}
                                          onClick={() => {
                                              handleCourseSelection(id);
                                              setShowLangDropdown(false);
                                          }}
                                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                             ${id === progress.currentCourseId ? 'bg-neon-cyan/20 border border-neon-cyan/50' : 'hover:bg-white/10 border border-transparent'}
                                          `}
                                        >
                                            <img src={meta.flag} className="w-5 h-5 rounded-sm object-cover bg-gray-700" />
                                            <span className={`font-bold ${id === progress.currentCourseId ? 'text-neon-cyan' : 'text-gray-300'}`}>{meta.title}</span>
                                        </button>
                                      );
                                  })}
                                  <div className="h-px bg-gray-700 my-1 mx-2"></div>
                                  <button 
                                    onClick={handleAddCourseClick}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                  >
                                      <Plus size={18} />
                                      <span className="font-bold">Add New Course</span>
                                  </button>
                              </div>
                           )}
                        </div>
                    </div>
                    
                    <div className="flex gap-4 md:gap-8 items-center">
                       <div className="flex items-center gap-2 text-neon-purple font-bold">
                          <Zap className="fill-current" size={20} />
                          <span className="font-mono">{progress.streak}</span>
                       </div>
                       <div className="flex items-center gap-2 text-neon-pink font-bold">
                          <Heart className="fill-current" size={20} />
                          <span className="font-mono">{progress.hearts}</span>
                       </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto flex pt-6 px-4">
               {/* Desktop Sidebar */}
               <nav className="hidden md:flex flex-col w-64 p-2 gap-2 sticky top-24 h-[calc(100vh-120px)]">
                  {[
                    { id: AppView.DASHBOARD, label: 'Learn', icon: 'https://d35aaqx5ub95lt.cloudfront.net/images/icons/learn-active.svg' },
                    { id: AppView.ROLEPLAY, label: 'Roleplay', icon: null, iconComp: <MessageSquare size={24} /> },
                    { id: AppView.WRITING, label: 'Writing Lab', icon: null, iconComp: <PenTool size={24} /> },
                    { id: AppView.CHARACTERS, label: 'Matrix', icon: null, textIcon: getCharacterIcon(activeCourseMeta?.id) },
                    { id: AppView.VOCABULARY, label: 'Database', icon: null, iconComp: <BookOpen size={24} /> },
                    { id: AppView.LEADERBOARD, label: 'Leaderboard', icon: null, iconComp: <Trophy size={24} /> },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl font-bold uppercase text-sm tracking-widest transition-all border
                         ${view === item.id 
                            ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                            : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                      `}
                    >
                       {item.icon && <img src={item.icon} className={`w-6 h-6 ${view !== item.id && 'grayscale opacity-50'}`} />}
                       {item.textIcon && <span className="w-6 text-xl text-center font-display">{item.textIcon}</span>}
                       {item.iconComp && <span className={view !== item.id ? 'opacity-50' : ''}>{item.iconComp}</span>}
                       <span>{item.label}</span>
                    </button>
                  ))}
               </nav>

               {/* Main Content */}
               <div className="flex-1 md:px-8 min-h-screen pb-24">
                  {view === AppView.DASHBOARD && (
                    <Dashboard 
                       units={units} 
                       progress={progress} 
                       onStartLesson={handleStartLesson} 
                       onStartTraining={handleStartTraining}
                       onStartWriting={() => setView(AppView.WRITING)}
                    />
                  )}
                  {view === AppView.ROLEPLAY && <Roleplay courseId={progress.currentCourseId} />}
                  {view === AppView.WRITING && <WritingLab courseId={progress.currentCourseId} />}
                  {view === AppView.CHARACTERS && <Characters courseId={progress.currentCourseId} />}
                  {view === AppView.VOCABULARY && <Vocabulary vocabList={Object.values(progress.vocabulary)} />}
                  {view === AppView.LEADERBOARD && <Leaderboard currentUsername={progress.username || 'Operative'} />}
               </div>
               
               {/* Right Sidebar (Stats) */}
               <div className="hidden lg:block w-80 py-2 space-y-6 sticky top-24 h-fit">
                  <div className="glass-panel rounded-2xl p-5 border border-gray-800">
                      <h3 className="font-bold font-display text-lg mb-4 text-white uppercase tracking-widest">Daily Protocol</h3>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Zap size={18} className="text-neon-purple" />
                                <span className="font-bold text-gray-400 text-sm">Gain 50 XP</span>
                             </div>
                             <span className="font-mono text-neon-purple">{progress.xp} / 50</span>
                          </div>
                          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-neon-purple h-full shadow-[0_0_10px_#7000FF]" style={{ width: `${Math.min((progress.xp/50)*100, 100)}%` }}></div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-5 border border-gray-800 rounded-2xl bg-space-card/30">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center border border-gray-600">
                           <User className="text-gray-400" />
                        </div>
                        <div>
                           <h3 className="font-bold text-white font-display text-lg">{progress.username}</h3>
                           <p className="text-xs text-neon-cyan uppercase tracking-widest">Online</p>
                        </div>
                     </div>
                  </div>
               </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-space-dark/90 backdrop-blur-xl border-t border-gray-800 flex justify-around p-4 pb-6 z-40">
                 <button onClick={() => setView(AppView.DASHBOARD)} className={view === AppView.DASHBOARD ? "text-neon-cyan" : "text-gray-600"}>
                    <img src="https://d35aaqx5ub95lt.cloudfront.net/images/icons/learn-active.svg" className={`w-7 h-7 ${view !== AppView.DASHBOARD && 'grayscale opacity-30'}`} />
                 </button>
                 <button onClick={() => setView(AppView.ROLEPLAY)} className={view === AppView.ROLEPLAY ? "text-neon-cyan" : "text-gray-600"}>
                    <MessageSquare size={28} className={view !== AppView.ROLEPLAY ? "opacity-30" : ""} />
                 </button>
                 <button onClick={() => setView(AppView.WRITING)} className={view === AppView.WRITING ? "text-neon-cyan" : "text-gray-600"}>
                    <PenTool size={28} className={view !== AppView.WRITING ? "opacity-30" : ""} />
                 </button>
                 <button onClick={() => setView(AppView.VOCABULARY)} className={view === AppView.VOCABULARY ? "text-neon-cyan" : "text-gray-600"}>
                    <BookOpen size={28} className={view !== AppView.VOCABULARY ? "opacity-30" : ""} />
                 </button>
                 <button onClick={() => setView(AppView.CHARACTERS)} className={view === AppView.CHARACTERS ? "text-neon-cyan" : "text-gray-600"}>
                     <span className={`text-2xl font-display font-bold ${view !== AppView.CHARACTERS && 'opacity-30'}`}>
                         {getCharacterIcon(activeCourseMeta?.id)}
                     </span>
                 </button>
            </nav>
        </>
      )}

      {view === AppView.LESSON && activeLesson && progress && (
        <LessonView 
           lesson={activeLesson} 
           onComplete={handleLessonComplete} 
           onExit={handleExitLesson}
           userHearts={progress.hearts}
           reduceHeart={reduceHeart}
           courseId={progress.currentCourseId}
        />
      )}
    </div>
  );
};

export default App;
