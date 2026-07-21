import ScrollVideoExperience, { VIDEO_BG } from './components/ScrollVideoExperience';
import MarketingSection from './sections/MarketingSection';
import FeatureGrid, { SpecsShowcase } from './sections/FeatureGrid';
import Accessories from './sections/Accessories';
import PreOrder from './sections/PreOrder';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="relative min-h-screen text-white" style={{ background: VIDEO_BG }}>
      <ScrollVideoExperience />
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
