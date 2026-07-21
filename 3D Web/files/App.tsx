import ScrollVideoExperience, { VIDEO_BG } from './components/ScrollVideoExperience';
import FeatureGrid, { SpecsShowcase } from './sections/FeatureGrid';
import Accessories from './sections/Accessories';
import PreOrder from './sections/PreOrder';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="relative min-h-screen text-white" style={{ background: VIDEO_BG }}>
      <ScrollVideoExperience />

      {/* Seamless transition from video bg into page sections */}
      <main className="relative">
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
