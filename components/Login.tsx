
import React from 'react';
import { AVAILABLE_COURSES } from '../services/curriculum';
import { Atom, ChevronRight, Lock, Flag, Terminal, Calculator, Book, Globe } from 'lucide-react';

interface Props {
  onSelectCourse: (courseId: string) => void;
}

export const Login: React.FC<Props> = ({ onSelectCourse }) => {
  const languages = AVAILABLE_COURSES.filter(c => c.category === 'LANGUAGE');
  const specialized = AVAILABLE_COURSES.filter(c => c.category === 'SPECIALIZED');

  const renderCourseBtn = (course: any) => (
       <button 
         key={course.id}
         onClick={() => !course.locked && onSelectCourse(course.id)}
         disabled={course.locked}
         className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group
            ${course.locked 
               ? 'border-gray-800 bg-space-dark/50 opacity-50 cursor-not-allowed' 
               : 'border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 cursor-pointer'}
         `}
       >
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded overflow-hidden shadow-sm flex items-center justify-center bg-gray-800 relative">
                <img 
                    src={course.flag} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    alt={course.title}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }} 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    {course.id === 'python' ? <Terminal size={16} className="text-neon-green" /> :
                     course.id.includes('calc') ? <Calculator size={16} className="text-neon-purple" /> :
                     course.id.includes('english') ? <Book size={16} className="text-orange-400" /> :
                     <Globe size={16} className="text-neon-cyan" />
                    }
                </div>
             </div>
             <span className={`font-bold text-lg ${course.locked ? 'text-gray-500' : 'text-white'}`}>{course.title}</span>
         </div>
         
         {course.locked ? (
            <div className="flex items-center gap-1 text-gray-600 text-xs font-mono uppercase border border-gray-600 px-2 py-1 rounded">
               <Lock size={12} /> Locked
            </div>
         ) : (
            <ChevronRight className="text-neon-cyan/50 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
         )}
       </button>
  );

  return (
    <div className="min-h-screen bg-space-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-cyber-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10 my-10">
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-tr from-neon-cyan to-neon-purple rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.3)]">
             <Atom size={48} className="text-white animate-spin-slow" />
          </div>
          <h1 className="text-5xl font-display font-black text-white mb-2 tracking-tighter">LINGUA<span className="text-neon-cyan">VERSE</span></h1>
          <p className="text-gray-400 text-lg">Universal Knowledge Interface</p>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-white mb-6 tracking-widest uppercase border-b border-gray-700 pb-4 flex items-center gap-2">
                <Globe size={20} className="text-neon-cyan" /> Language Protocols
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                {languages.map(renderCourseBtn)}
            </div>

            <h2 className="text-xl font-bold text-white mb-6 tracking-widest uppercase border-b border-gray-700 pb-4 flex items-center gap-2">
                <Terminal size={20} className="text-neon-green" /> Specialized Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialized.map(renderCourseBtn)}
            </div>
            
            <p className="mt-8 text-center text-xs text-gray-500">
               Session data saves automatically to local neural storage.
            </p>
        </div>
      </div>
    </div>
  );
};
