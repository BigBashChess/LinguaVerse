import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Shield, Trophy, ChevronUp } from 'lucide-react';

interface Props {
  currentUsername: string;
}

export const Leaderboard: React.FC<Props> = ({ currentUsername }) => {
  const [users, setUsers] = useState<{username: string, xp: number}[]>([]);

  useEffect(() => {
    setUsers(StorageService.getLeaderboard());
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8 pb-32">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan uppercase">Galactic League</h1>
        <p className="text-gray-500 mt-2 font-mono text-sm">Top operatives this cycle</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
        {users.map((user, index) => {
          const isCurrentUser = user.username === currentUsername;
          const rank = index + 1;
          
          let rankColor = 'text-gray-500';
          if (rank === 1) rankColor = 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]';
          if (rank === 2) rankColor = 'text-gray-300';
          if (rank === 3) rankColor = 'text-orange-500';

          return (
            <div 
              key={user.username} 
              className={`flex items-center p-5 border-b border-gray-800 last:border-b-0 transition-colors
                ${isCurrentUser ? 'bg-neon-purple/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-8 font-display font-bold text-xl mr-4 ${rankColor}`}>
                #{rank}
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-black font-display text-xl mr-4 shadow-lg
                 ${rank === 1 ? 'bg-yellow-400' : 'bg-gray-700 text-white'}
                 ${isCurrentUser && rank > 1 ? 'bg-neon-cyan' : ''}
              `}>
                 {user.username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className={`font-bold ${isCurrentUser ? 'text-neon-cyan' : 'text-gray-300'}`}>
                  {user.username}
                </h3>
                {isCurrentUser && <span className="text-[10px] text-neon-purple font-bold uppercase tracking-widest border border-neon-purple/50 px-2 py-0.5 rounded-full">You</span>}
              </div>

              <div className="font-mono font-bold text-gray-400">
                {user.xp} <span className="text-xs text-gray-600">XP</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 rounded-r-xl flex items-center gap-6">
         <div className="p-3 bg-orange-500/20 rounded-full text-orange-500">
            <ChevronUp size={32} />
         </div>
         <div>
            <h3 className="font-bold text-orange-500 uppercase tracking-widest text-sm">Promotion Zone</h3>
            <p className="text-sm text-gray-400 mt-1">Top 10 operatives advance to the <span className="text-white font-bold">Obsidian Tier</span>.</p>
         </div>
      </div>
    </div>
  );
};
