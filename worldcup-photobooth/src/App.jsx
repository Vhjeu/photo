import React, { useState } from 'react';
import Home from './components/Home';
import TeamSelection from './components/TeamSelection';
import CameraBooth from './components/CameraBooth';
import PhotoResult from './components/PhotoResult';

function App() {
  const [step, setStep] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const resetBooth = () => {
    setStep(0);
    setSelectedTeam(null);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen relative font-sans">
      {/* Background Sân vận động & Ánh sáng */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee7e53f06e9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-wc-blue via-wc-blue/80 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col justify-center items-center">
        {step === 0 && <Home onStart={() => setStep(1)} />}
        {step === 1 && (
          <TeamSelection
            onSelect={(team) => { setSelectedTeam(team); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <CameraBooth
            team={selectedTeam}
            onCapture={(img) => { setCapturedImage(img); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <PhotoResult
            image={capturedImage}
            team={selectedTeam}
            onRetake={() => setStep(2)}
            onHome={resetBooth}
          />
        )}
      </div>
    </div>
  );
}

export default App;