import React, { useState } from 'react';
import ArcMenu from './ArcMenu';
import VoiceDialog from './VoiceDialog';

const ActionBar = () => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const handleCommand = (text) => {
    console.log('Received command:', text);
    // Here you'll integrate with your  processing
  };

  return (
    <>
      {/* Voice button floats above the arc menu */}
      <div style={{ 
        position: 'fixed', 
        bottom: 60,  // Just above the ArcMenu
        left: 10,
        zIndex: 2000 
      }}>
        <button 
          className="action-item"
          onClick={() => setIsVoiceOpen(true)}
          style={{ 
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            fontSize: 24
          }}
        >
          🎤
        </button>
      </div>

      {/* Original ArcMenu stays untouched */}
      <ArcMenu />

      {/* Voice dialog */}
      <VoiceDialog 
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSubmit={handleCommand}
      />
    </>
  );
};

export default ActionBar;
