import React, { useState, useEffect } from 'react';
import { GAMES_LIST } from '../../data/gamesList';
import { useGame } from '../../context/GameContext';
import { soundFx } from '../../utils/audio';
import { Play, Star, Users, Film } from 'lucide-react';
import type { GameInfo } from '../../types/game';

interface GameCardProps {
  game: GameInfo;
  onSelect: (id: GameInfo['id']) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  const screenshots = game.screenshots && game.screenshots.length > 0 
    ? game.screenshots 
    : [game.thumbnail, game.coverImage];

  useEffect(() => {
    let interval: any = null;
    if (isHovered && screenshots.length > 1) {
      interval = setInterval(() => {
        setScreenshotIndex((prev) => (prev + 1) % screenshots.length);
      }, 750); // cycle preview images every 750ms for gif-like animation effect
    } else {
      setScreenshotIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, screenshots.length]);

  return (
    <div
      onClick={() => onSelect(game.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col"
    >
      {/* Thumbnail / Screen Animation Preview Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
        <img
          src={isHovered ? screenshots[screenshotIndex] : game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur border border-slate-700 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-lg z-10">
          <Star className="w-3.5 h-3.5 fill-yellow-400" /> {game.rating}
        </div>

        {/* Live Player Count Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-slate-700 text-cyan-400 text-xs font-semibold px-2.5 py-1 rounded-lg z-10">
          <Users className="w-3.5 h-3.5" /> {game.playersOnline.toLocaleString()}
        </div>

        {/* Live Animated Preview Indicator Tag */}
        {isHovered && screenshots.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-cyan-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow z-10 animate-pulse">
            <Film className="w-3 h-3" /> GAMEPLAY PREVIEW
          </div>
        )}

        {/* Quick Play Hover Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/30 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 transform scale-75 group-hover:scale-100 transition duration-300">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Details */}
      <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {game.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GameGrid: React.FC = () => {
  const { selectedCategory, searchQuery, setActiveGameId } = useGame();
  const [visibleCount, setVisibleCount] = React.useState(36);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

  // Reset pagination when category or search changes
  React.useEffect(() => {
    setVisibleCount(36);
  }, [selectedCategory, searchQuery]);

  const filteredGames = GAMES_LIST.filter((game) => {
    const matchesCat = selectedCategory === 'All' || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const displayedGames = filteredGames.slice(0, visibleCount);

  // Automatic load on scroll using IntersectionObserver
  React.useEffect(() => {
    if (visibleCount >= filteredGames.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredGames.length));
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleCount, filteredGames.length]);

  const handleGameSelect = (id: typeof GAMES_LIST[0]['id']) => {
    setActiveGameId(id);
    soundFx.playVictory();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>{selectedCategory === 'All' ? 'Popular Online Games' : `${selectedCategory} Games`}</span>
          <span className="text-xs bg-slate-800 text-slate-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
            {filteredGames.length} Available
          </span>
        </h2>
      </div>

      {filteredGames.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p>No games found matching "{searchQuery}". Try searching for Puzzle, Shooter, or Arcade.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={handleGameSelect} />
            ))}
          </div>

          {visibleCount < filteredGames.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="w-7 h-7 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
