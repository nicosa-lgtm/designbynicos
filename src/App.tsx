import { useState, useCallback } from 'react';
import ScrollVideoExperience, { VIDEO_BG, type ScrollState } from './components/ScrollVideoExperience';
import MarketingSection from './sections/MarketingSection';
import FeatureGrid, { SpecsShowcase } from './sections/FeatureGrid';
import Accessories from './sections/Accessories';
import PreOrder from './sections/PreOrder';
import Footer from './sections/Footer';

function App() {
  const [, setScrollState] = useState<ScrollState>({ progress: 0, dockOpacity: 0, dragY: 0 });
  const handleScroll = useCallback((state: ScrollState) => setScrollState(state), []);

  return (
    <div className="relative min-h-screen text-white" style={{ background: VIDEO_BG }}>
      <ScrollVideoExperience onScroll={handleScroll} />

      {/* Section 2 — camera drags down here, marketing copy flanks it */}
      <MarketingSection />

      <main className="relative" style={{ background: '#050507' }}>
        <FeatureGrid />
        <SpecsShowcase />
        <Accessories />
        <PreOrder />
      </main>

      <Footer />
    </div>
  );
}

export default App;
