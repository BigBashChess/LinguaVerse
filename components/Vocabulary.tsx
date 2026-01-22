import React from 'react';
import { VocabularyItem } from '../types';
import { Clock, CheckCircle, Brain } from 'lucide-react';

interface Props {
  vocabList: VocabularyItem[];
}

export const Vocabulary: React.FC<Props> = ({ vocabList }) => {
  const sortedVocab = [...vocabList].sort((a, b) => a.nextReview - b.nextReview);
  const dueCount = sortedVocab.filter(v => v.nextReview < Date.now()).length;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Neural Database</h1>
            <p className="text-gray-400">Manage your learned vocabulary. <span className="text-neon-cyan">{vocabList.length}</span> words stored.</p>
          </div>
          
          <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple border border-neon-purple">
                <Brain size={24} />
             </div>
             <div>
                <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Review Due</p>
                <p className="text-2xl font-bold text-white">{dueCount} <span className="text-sm font-normal text-gray-500">items</span></p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVocab.map((item) => {
             const isDue = item.nextReview < Date.now();
             const timeUntil = Math.ceil((item.nextReview - Date.now()) / (1000 * 60 * 60 * 24));
             
             return (
               <div key={item.id} className={`relative glass-panel rounded-2xl p-6 border-l-4 transition-all hover:scale-[1.02] ${isDue ? 'border-l-neon-pink' : 'border-l-neon-cyan'}`}>
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-2xl font-bold text-white">{item.word}</h3>
                     {isDue && <span className="w-3 h-3 bg-neon-pink rounded-full animate-pulse shadow-[0_0_10px_#ff0099]"></span>}
                  </div>
                  
                  <p className="text-neon-cyan-dim font-display text-lg mb-2">{item.reading}</p>
                  <p className="text-gray-300 mb-6">{item.meaning}</p>
                  
                  <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase text-gray-500 border-t border-gray-800 pt-4">
                     <span className="flex items-center gap-1">
                        <CheckCircle size={14} className={item.repetition > 3 ? "text-neon-green" : "text-gray-600"} />
                        Lvl {item.repetition}
                     </span>
                     <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {isDue ? "NOW" : `${timeUntil} Days`}
                     </span>
                  </div>
               </div>
             );
          })}
          
          {vocabList.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-500">
                <Brain size={48} className="mx-auto mb-4 opacity-20" />
                <p>No data found in neural cortex.</p>
                <p className="text-sm mt-2">Complete lessons to populate database.</p>
             </div>
          )}
       </div>
    </div>
  );
};
