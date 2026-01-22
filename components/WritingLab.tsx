
import React, { useState } from 'react';
import { PenTool, Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { gradeWritingSubmission } from '../services/gemini';
import confetti from 'canvas-confetti';

interface Props {
  courseId: string;
}

export const WritingLab: React.FC<Props> = ({ courseId }) => {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGrading, setIsGrading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || !topic.trim()) return;
    
    setIsGrading(true);
    const result = await gradeWritingSubmission(text, topic, courseId);
    setFeedback(result);
    setIsGrading(false);
    
    // Confetti if it looks like a passing grade (hacky check for high number)
    if (result.includes('9') || result.includes('100') || result.includes('8')) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
  };

  const handleReset = () => {
    setText('');
    setTopic('');
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-neon-purple/20 rounded-xl flex items-center justify-center text-neon-purple border border-neon-purple">
           <PenTool size={24} />
        </div>
        <div>
           <h1 className="text-3xl font-display font-bold text-white">Writing Lab</h1>
           <p className="text-gray-400">Compose texts for AI analysis and grading.</p>
        </div>
      </div>

      {!feedback ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-5">
           <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Topic / Prompt</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. My daily routine, Why I like cats, The function of mitochondria..."
                className="w-full bg-space-card border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-neon-purple transition-colors"
              />
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Your Response ({courseId})</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your response here..."
                className="w-full h-64 bg-space-card border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-neon-purple transition-colors resize-none font-mono"
              />
           </div>

           <button 
             onClick={handleSubmit}
             disabled={isGrading || !text || !topic}
             className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-xl font-display font-bold text-xl text-white tracking-widest shadow-[0_0_20px_rgba(112,0,255,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
           >
              {isGrading ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing Neural Patterns...
                  </>
              ) : (
                  <>
                    <Send size={20} /> SUBMIT FOR GRADING
                  </>
              )}
           </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95">
           <div className="glass-panel p-8 rounded-2xl border border-neon-cyan/30 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle className="text-neon-green" /> Analysis Complete
               </h2>
               
               <div className="prose prose-invert max-w-none">
                   <div dangerouslySetInnerHTML={{ 
                       __html: feedback
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-cyan">$1</strong>')
                        .replace(/\n/g, '<br/>') 
                   }} />
               </div>
           </div>

           <button 
             onClick={handleReset}
             className="w-full py-4 bg-gray-800 border border-gray-700 rounded-xl font-bold text-white hover:bg-gray-700 transition-colors"
           >
              Start New Submission
           </button>
        </div>
      )}
    </div>
  );
};
