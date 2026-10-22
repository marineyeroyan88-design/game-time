import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Shield, Heart, Radio, Sparkles, Home } from 'lucide-react';
import type { PageView } from '../../types/game';

export const Footer: React.FC = () => {
  const { currentPage, setCurrentPage, setActiveGameId } = useGame();

  const handleNav = (page: PageView) => {
    setActiveGameId(null);
    setCurrentPage(page);
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-16 py-12 px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src="./logo.png"
                alt="Gamers-Time Logo"
                className="w-10 h-10 object-contain rounded-xl border border-slate-700/50 shadow-md shadow-cyan-500/10 cursor-pointer"
                onClick={() => handleNav('home')}
              />
              <div>
                <span className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  GAMERS-<span className="text-neon-gradient">TIME</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </span>
                <p className="text-[11px] text-slate-400">PlayHop Cyber Hub • Instant 3D & Multiplayer Browser Gaming</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed mt-1">
              Dive into over 350+ free, instant-play games directly in your browser. From multiplayer tactical shooters and Roblox-style obbies to extreme vehicle physics simulators, enjoy zero downloads and pure entertainment.
            </p>
          </div>

          {/* Quick Portal Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-cyan-400" /> Essential Pages
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>Home Page</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('original-game')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 font-bold ${
                    currentPage === 'original-game' ? 'text-cyan-400' : 'text-cyan-400/90 hover:text-cyan-300'
                  }`}
                >
                  <span>🎮 Original Multiplayer Game</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about-us')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'about-us' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact-us')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'contact-us' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Legal Policies
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('privacy-policy')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'privacy-policy' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('terms-and-conditions')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'terms-and-conditions' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>Terms and Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('disclaimer')}
                  className={`hover:text-cyan-400 transition cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'disclaimer' ? 'text-cyan-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span>Disclaimer</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Network Status: <span className="text-emerald-400 font-semibold">ONLINE</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Encrypted Sandbox</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" /> for Online Gamers © {new Date().getFullYear()} Gamers-Time
          </div>
        </div>
      </div>
    </footer>
  );
};
