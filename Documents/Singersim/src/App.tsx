import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { Navbar } from './components/ui/Navbar';
import { CharacterCreator } from './components/character/CharacterCreator';
import { HomeDashboard } from './components/home/HomeDashboard';
import { SongCreator } from './components/studio/SongCreator';
import { AlbumManager } from './components/studio/AlbumManager';
import { SpotifyCharts } from './components/charts/SpotifyCharts';
import { InboxModal } from './components/messages/InboxModal';
import { DecisionPopup } from './components/messages/DecisionPopup';
import { BzrpSessionModal } from './components/bzrp/BzrpSessionModal';
import { EurovisionModal } from './components/awards/EurovisionModal';
import { GrammysModal } from './components/awards/GrammysModal';
import { NewsFeed } from './components/news/NewsFeed';
import { AuthModal } from './components/auth/AuthModal';
import { OvySoundModal } from './components/studio/OvySoundModal';
import { BigOneCrossoverModal } from './components/studio/BigOneCrossoverModal';
import { PlatformMetrics } from './components/charts/PlatformMetrics';
import { CollabOfferPopup } from './components/messages/CollabOfferPopup';

export const App: React.FC = () => {
  const { 
    singer, 
    activeTab, 
    isOvyOpen, 
    setIsOvyOpen, 
    isBigOneOpen, 
    setIsBigOneOpen, 
    activeCollabOffer, 
    setActiveCollabOffer 
  } = useGame();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [studioSubTab, setStudioSubTab] = useState<'single' | 'albums'>('single');

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
      {/* If singer does not exist, show Character Creator */}
      {!singer ? (
        <div className="flex-1 flex flex-col justify-center">
          <CharacterCreator />
        </div>
      ) : (
        <>
          <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
            {activeTab === 'home' && <HomeDashboard />}

            {activeTab === 'studio' && (
              <div className="space-y-6">
                {/* Studio Subnavigation */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <button
                    onClick={() => setStudioSubTab('single')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      studioSubTab === 'single'
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    Grabar Nuevo Single
                  </button>

                  <button
                    onClick={() => setStudioSubTab('albums')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      studioSubTab === 'albums'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    Gestor de Álbumes (Track por Track)
                  </button>
                </div>

                {studioSubTab === 'single' ? <SongCreator /> : <AlbumManager />}
              </div>
            )}

            {activeTab === 'charts' && <SpotifyCharts />}
            {activeTab === 'metrics' && <PlatformMetrics />}

            {activeTab === 'messages' && <InboxModal />}

            {activeTab === 'news' && <NewsFeed />}

            {activeTab === 'awards' && <GrammysModal />}
          </main>
        </>
      )}

      {/* Global Modals & Decision Popups */}
      <DecisionPopup />
      <CollabOfferPopup proposal={activeCollabOffer} onClose={() => setActiveCollabOffer(null)} />
      <BzrpSessionModal />
      <OvySoundModal isOpen={isOvyOpen} onClose={() => setIsOvyOpen(false)} />
      <BigOneCrossoverModal 
        isOpen={isBigOneOpen} 
        onClose={() => setIsBigOneOpen(false)} 
        crossoverNumber={activeCollabOffer?.crossoverNumber || 8}
        suggestedPartner={activeCollabOffer?.crossoverPartner}
      />
      <EurovisionModal />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default App;
