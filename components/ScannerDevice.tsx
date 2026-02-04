import React from 'react';
import { Home, Undo2, Camera } from 'lucide-react';

interface ScannerDeviceProps {
  children: React.ReactNode;
}

export const ScannerDevice: React.FC<ScannerDeviceProps> = ({ children }) => {
  
  const handleScanTrigger = () => {
    // Dispatch a custom event that the internal OS can listen to
    const event = new CustomEvent('hardware-scan-trigger');
    window.dispatchEvent(event);
    
    // Add a visual vibration effect or console log
    console.log("Hardware Scan Triggered");
  };

  return (
    <div className="relative">
      {/* Outer Shell Layer 1 (The main body shadow/outline) */}
      <div className="relative w-[360px] h-[860px] bg-gray-900 rounded-[3rem] shadow-2xl p-4 flex flex-col select-none ring-8 ring-gray-800/50">
        
        {/* Yellow Side Buttons (Triggers) - Absolute Positioned */}
        <div className="absolute top-72 -left-1.5 w-2 h-24 bg-yellow-400 rounded-l-md border-r border-yellow-600 z-0 shadow-md"></div>
        {/* Right Button - Interactive */}
        <div 
          className="absolute top-72 -right-1.5 w-2 h-24 bg-yellow-400 rounded-r-md border-l border-yellow-600 z-0 shadow-md cursor-pointer active:brightness-110 active:scale-95 transition-all"
          onClick={handleScanTrigger}
          title="Right Scan Trigger"
        ></div>

        {/* Top Branding Area (Speaker) */}
        <div className="h-8 flex flex-col items-center justify-center shrink-0 mb-2">
          <div className="w-16 h-1.5 bg-gray-700 rounded-full mb-1"></div>
          <span className="text-gray-500 font-bold text-sm tracking-widest italic font-sans opacity-50">Seuic</span>
        </div>

        {/* Screen Bezel - Height increased significantly */}
        <div className="mx-2 p-1 bg-black rounded-lg border-2 border-gray-800 relative z-10 shrink-0">
          {/* The Actual LCD Screen - Increased from 320px to 480px */}
          <div className="w-full h-[480px] bg-white rounded overflow-hidden relative">
             {children}
          </div>
        </div>

        {/* Middle Section (Scan Button & Numpad) */}
        <div className="mt-6 flex flex-col items-center justify-start flex-1 px-6 pb-6">
          
          {/* Navigation & Action Buttons Row */}
          <div className="relative w-full h-20 mb-4 flex items-center justify-between px-3 shrink-0">
             
             {/* Left: Home/Desktop Button (Blue) */}
             <div className="w-16 h-12 bg-blue-600 rounded-xl border-b-4 border-blue-800 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center cursor-pointer z-20 hover:bg-blue-500">
                <Home className="text-white opacity-90" size={22} />
             </div>

             {/* Center: Photo/Confirm Button (Yellow) */}
             <div 
                className="w-32 h-14 bg-yellow-400 rounded-2xl border-b-4 border-yellow-600 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center cursor-pointer z-20"
                onClick={handleScanTrigger}
             >
                <Camera className="text-yellow-900 opacity-80" size={30} />
             </div>

             {/* Right: Back Button (Blue) */}
             <div className="w-16 h-12 bg-blue-600 rounded-xl border-b-4 border-blue-800 shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center cursor-pointer z-20 hover:bg-blue-500">
                <Undo2 className="text-white opacity-90" size={22} />
             </div>
          </div>

          {/* Number Pad Grid */}
          <div className="w-full grid grid-cols-3 gap-x-6 gap-y-4 px-2">
            <NumKey num="1" sub=".,?" />
            <NumKey num="2" sub="ABC" />
            <NumKey num="3" sub="DEF" />
            <NumKey num="4" sub="GHI" />
            <NumKey num="5" sub="JKL" />
            <NumKey num="6" sub="MNO" />
            <NumKey num="7" sub="PQRS" />
            <NumKey num="8" sub="TUV" />
            <NumKey num="9" sub="WXYZ" />
            
            {/* Bottom Row - Centered 0 */}
            <div></div>
            <NumKey num="0" sub="_" />
            <div></div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper Components for Keys

const NumKey: React.FC<{ num: string; sub?: string }> = ({ num, sub }) => (
  <button className="bg-gray-800 rounded-xl h-12 flex flex-col items-center justify-center border-b-4 border-gray-950 shadow-md active:border-b-0 active:translate-y-[2px] transition-all hover:bg-gray-700 group">
    <span className="text-gray-200 font-bold text-lg leading-none group-hover:text-white">{num}</span>
    {sub && <span className="text-[9px] text-orange-400 leading-none mt-1 group-hover:text-orange-300">{sub}</span>}
  </button>
);