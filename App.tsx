import React from 'react';
import { ScannerDevice } from './components/ScannerDevice';
import { InternalOS } from './components/InternalOS';

export default function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-200">
      {/* 
        The ScannerDevice acts as the physical frame.
        The InternalOS is the software running inside the screen.
      */}
      <ScannerDevice>
        <InternalOS />
      </ScannerDevice>
      
      <div className="fixed bottom-4 right-4 text-gray-500 text-xs">
        Note: Physical buttons are visual (except for screen interaction).
      </div>
    </div>
  );
}