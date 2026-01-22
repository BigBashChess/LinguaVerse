
import React from 'react';
import { Lesson, UserProgress, Unit } from '../types';
import { Star, Lock, Zap, Dumbbell, ChevronRight, PenTool } from 'lucide-react';

interface Props {
  units: Unit[];
  progress: UserProgress;
  onStartLesson: (lesson: Lesson) => void;
  onStartTraining: () => void;
  onStartWriting: () => void;
}

export const Dashboard: React.FC<Props> = ({ units, progress, onStartLesson, onStartTraining, onStartWriting }) => {
  const hasVocab = progress && Object.keys(progress.vocabulary).length > 0;
  
  // Flatten all lessons to create a linear progression path
  const allLessons = units.flatMap(u => u.lessons);

  return (
    <div className="max-w-2xl mx-auto pb-40 pt-8 space-y-12">
      
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-4 mx-4">
          {/* Training Section */}
          <div 
            onClick={hasVocab ? onStartTraining : undefined}
            className={`
                glass-panel p-4 rounded-2xl border border-neon-pink/30 flex flex-col items-center justify-center relative overflow-hidden group btn-push
                ${hasVocab ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
            `}
          >
              <div className="absolute inset-0 bg-neon-pink/5 group-hover:bg-neon-pink/10 transition-colors"></div>
              <div className="w-12 h-12 bg-neon-pink text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,153,0.5)] mb-3 group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} className="animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider text-center">Training</h3>
          </div>

          {/* Writing Lab Section */}
          <div 
            onClick={onStartWriting}
            className="glass-panel p-4 rounded-2xl border border-neon-purple/30 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer btn-push"
          >
              <div className="absolute inset-0 bg-neon-purple/5 group-hover:bg-neon-purple/10 transition-colors"></div>
              <div className="w-12 h-12 bg-neon-purple text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(112,0,255,0.5)] mb-3 group-hover:scale-110 transition-transform">
                  <PenTool size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider text-center">Writing Lab</h3>
          </div>
      </div>

      {units.map((unit) => {
         // Determine if unit is active (rough check for visual border)
         const isActiveUnit = unit.lessons.some(l => {
             const idx = allLessons.findIndex(al => al.id === l.id);
             if (idx === 0) return true;
             return progress.completedLessons.includes(allLessons[idx-1].id);
         });
         
         return (
            <div key={unit.id} className="relative">
              {/* Connection Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon-cyan/30 to-transparent -z-10"></div>

              {/* Unit Header */}
              <div className={`
                 glass-panel p-6 rounded-2xl mb-12 mx-4 flex justify-between items-center border-b-2
                 ${isActiveUnit ? 'border-neon-cyan shadow-[0_0_30px_-10px_rgba(0,240,255,0.3)]' : 'border-gray-800 opacity-70'}
              `}>
                 <div>
                    <h2 className="text-xs font-bold text-neon-cyan tracking-[0.2em] uppercase mb-1">{unit.level}</h2>
                    <h1 className="text-2xl font-display font-bold text-white">{unit.title}</h1>
                    <p className="text-gray-400 mt-1">{unit.description}</p>
                 </div>
              </div>

              {/* Lessons Path */}
              <div className="flex flex-col items-center space-y-8 relative py-4">
                {unit.lessons.map((lesson, index) => {
                   const offset = Math.sin(index * 0.8) * 60; // Gentler curve
                   const isCompleted = progress.completedLessons.includes(lesson.id);
                   
                   // Global locking logic
                   const globalIndex = allLessons.findIndex(l => l.id === lesson.id);
                   const prevLesson = globalIndex > 0 ? allLessons[globalIndex - 1] : null;
                   
                   // Unlocked if: it's the very first lesson globally OR the previous lesson is completed
                   const isLocked = prevLesson ? !progress.completedLessons.includes(prevLesson.id) : false;
                   
                   const isActive = !isLocked && !isCompleted;

                   return (
                     <div 
                       key={lesson.id} 
                       className="relative z-10"
                       style={{ transform: `translateX(${offset}px)` }}
                     >
                        <div className="group relative">
                           {/* Hover Info */}
                           <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 glass-panel p-3 rounded-xl text-center hidden group-hover:block z-20 transition-all">
                                <h3 className="font-bold text-neon-cyan font-display">{lesson.title}</h3>
                                <p className="text-xs text-gray-400">{lesson.description}</p>
                           </div>

                           <button
                             onClick={() => !isLocked && onStartLesson(lesson)}
                             disabled={isLocked}
                             className={`
                               w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300
                               ${isCompleted 
                                  ? 'bg-space-card border-neon-cyan text-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.4)]' 
                                  : ''}
                               ${isActive 
                                  ? 'bg-neon-purple border-white text-white animate-pulse shadow-[0_0_30px_rgba(112,0,255,0.6)]' 
                                  : ''}
                               ${isLocked 
                                  ? 'bg-space-card border-gray-800 text-gray-700' 
                                  : ''}
                             `}
                           >
                             {isCompleted ? <Star size={28} fill="currentColor" /> : 
                              isLocked ? <Lock size={24} /> :
                              <Zap size={32} fill="currentColor" />
                             }
                           </button>
                        </div>
                     </div>
                   );
                })}
              </div>
            </div>
         );
      })}
    </div>
  );
};
