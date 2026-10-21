import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { Navbar } from './components/ui/Navbar';
import { CharacterCreator } from './components/character/CharacterCreator';
import { HomeDashboard } from './components/home/HomeDashboard';
import { ArtistStudio } from './components/studio/ArtistStudio';
import { ProducerStudio } from './components/studio/ProducerStudio';
import { DJDashboard } from './components/studio/DJDashboard';
import { ProjectWorkspace } from './components/studio/ProjectWorkspace';
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

  // Renders the career-specific studio based on singer's career path
  const renderStudio = () => {
    if (!singer) return null;
    switch (singer.career.path) {
      case 'producer': return <ProducerStudio />;
      case 'dj':       return <DJDashboard />;
      case 'artist':
      default:         return <ArtistStudio />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex flex-col">
      {!singer ? (
        <div className="flex-1 flex flex-col justify-center">
          <CharacterCreator />
        </div>
      ) : (
        <>
          <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
            {activeTab === 'home'     && <HomeDashboard />}
            {activeTab === 'studio'   && renderStudio()}
            {activeTab === 'projects' && <ProjectWorkspace />}
            {activeTab === 'charts'   && <SpotifyCharts />}
            {activeTab === 'metrics'  && <PlatformMetrics />}
            {activeTab === 'messages' && <InboxModal />}
            {activeTab === 'news'     && <NewsFeed />}
            {activeTab === 'awards'   && <GrammysModal />}
          </main>
        </>
      )}

      {/* Global overlays */}
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
