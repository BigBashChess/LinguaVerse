
import React, { useState, useEffect, useRef } from 'react';
import { generateRoleplayResponse, generateSpeech } from '../services/gemini';
import { MessageSquare, Mic, Send, Loader2, Volume2, User } from 'lucide-react';

interface Props {
  courseId: string;
}

const SCENARIOS = [
    { id: 'cafe', title: 'Cyber Cafe', description: 'Order a drink from a robot waiter.', icon: '☕' },
    { id: 'taxi', title: 'Hover Taxi', description: 'Give directions to the driver.', icon: '🚕' },
    { id: 'market', title: 'Black Market', description: 'Haggle for a rare data chip.', icon: '🛍️' },
    { id: 'meet', title: 'First Contact', description: 'Introduce yourself to a stranger.', icon: '👋' }
];

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
  isAudioPlaying?: boolean;
}

export const Roleplay: React.FC<Props> = ({ courseId }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startScenario = async (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setMessages([]);
    setIsTyping(true);
    
    // Initial greeting
    const greeting = await generateRoleplayResponse([], courseId, SCENARIOS.find(s => s.id === scenarioId)?.description || "");
    setMessages([{ id: Date.now(), role: 'model', text: greeting }]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build history for API
    const history = [...messages, userMsg].map(m => ({ role: m.role, text: m.text }));
    const response = await generateRoleplayResponse(history, courseId, SCENARIOS.find(s => s.id === activeScenario)?.description || "");
    
    setMessages(prev => [...prev, { id: Date.now(), role: 'model', text: response }]);
    setIsTyping(false);
  };

  const playAudio = async (text: string, msgId: number) => {
      // Don't generate audio for python/math
      if (courseId === 'python' || courseId.includes('calc')) return;

      const url = await generateSpeech(text, courseId);
      if (url) {
          if (audioRef.current) {
              audioRef.current.pause();
          }
          audioRef.current = new Audio(url);
          
          setMessages(prev => prev.map(m => ({...m, isAudioPlaying: m.id === msgId})));
          
          audioRef.current.play();
          audioRef.current.onended = () => {
              setMessages(prev => prev.map(m => ({...m, isAudioPlaying: false})));
          };
      }
  };

  if (!activeScenario) {
      return (
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-neon-green/20 rounded-xl flex items-center justify-center text-neon-green border border-neon-green">
                      <MessageSquare size={24} />
                  </div>
                  <div>
                      <h1 className="text-3xl font-display font-bold text-white">Roleplay Dojo</h1>
                      <p className="text-gray-400">Immersive simulations for practical fluency.</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SCENARIOS.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => startScenario(s.id)}
                        className="glass-panel p-6 rounded-2xl border-l-4 border-l-transparent hover:border-l-neon-green text-left group transition-all hover:bg-white/5"
                      >
                          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
                          <h3 className="font-bold text-xl text-white mb-2">{s.title}</h3>
                          <p className="text-gray-400 text-sm">{s.description}</p>
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 glass-panel rounded-t-2xl border-b border-gray-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center text-neon-green">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">AI Partner</h3>
                    <p className="text-xs text-neon-green">Online</p>
                </div>
            </div>
            <button onClick={() => setActiveScenario(null)} className="text-gray-400 hover:text-white">Exit</button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-panel border-y-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        max-w-[80%] p-4 rounded-2xl relative group
                        ${msg.role === 'user' 
                            ? 'bg-neon-purple/20 text-white rounded-tr-none border border-neon-purple/30' 
                            : 'bg-space-card text-gray-200 rounded-tl-none border border-gray-700'}
                    `}>
                        <p>{msg.text}</p>
                        {msg.role === 'model' && (
                             <button 
                                onClick={() => playAudio(msg.text, msg.id)}
                                className={`absolute -right-10 top-2 p-2 rounded-full hover:bg-white/10 ${msg.isAudioPlaying ? 'text-neon-cyan animate-pulse' : 'text-gray-500'}`}
                             >
                                 <Volume2 size={16} />
                             </button>
                        )}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-space-card p-4 rounded-2xl rounded-tl-none border border-gray-700 flex gap-2 items-center text-gray-500 text-sm">
                        <Loader2 size={14} className="animate-spin" /> Partner is typing...
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 glass-panel rounded-b-2xl border-t border-gray-800 flex gap-3">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response..."
                className="flex-1 bg-space-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-neon-green focus:outline-none"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-neon-green text-black rounded-xl hover:bg-white transition-colors disabled:opacity-50"
            >
                <Send size={20} />
            </button>
        </div>
    </div>
  );
};
