import React from 'react';
import { Shield, Heart, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-16 py-8 px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="./logo.png" alt="Gamers-Time Logo" className="w-9 h-9 object-contain rounded-lg border border-slate-700/50" />
          <div>
            <span className="font-bold text-slate-200">GAMERS-TIME ONLINE PLATFORM</span>
            <p className="text-[11px] text-slate-400">Play instant multiplayer web games with players around the globe.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Network Status: <span className="text-emerald-400 font-semibold">ONLINE</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Secure WebRTC Rooms</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" /> for Online Gamers
        </div>
      </div>
    </footer>
  );
};
