import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { MultiplayerProvider } from './context/MultiplayerContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { GameGrid } from './components/home/GameGrid';
import { RoomLobbyModal } from './components/home/RoomLobbyModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { LeaderboardModal } from './components/profile/LeaderboardModal';
import { GameContainer } from './components/gameplay/GameContainer';

const MainContent: React.FC = () => {
  const { activeGameId } = useGame();

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 flex flex-col gap-8 w-full">
      {activeGameId ? (
        <GameContainer />
      ) : (
        <>
          <HeroBanner />
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <Sidebar />
            <div className="flex-1 w-full">
              <GameGrid />
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <RoomLobbyModal />
      <ProfileModal />
      <LeaderboardModal />
    </main>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MultiplayerProvider>
        <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
          <Navbar />
          <MainContent />
          <Footer />
        </div>
      </MultiplayerProvider>
    </GameProvider>
  );
}
