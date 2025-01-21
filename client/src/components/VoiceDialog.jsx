import React, { useState, useEffect } from 'react';

const VoiceDialog = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [debugText, setDebugText] = useState('');

  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setDebugText('Speech recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setDebugText(`Recognized Text: ${transcript}\nConfidence: ${event.results[0][0].confidence}`);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setDebugText(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } catch (error) {
      setDebugText(`Error initializing speech recognition: ${error.message}`);
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setDebugText('');
      setIsListening(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 8,
        width: '90%',
        maxWidth: 400,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20 
        }}>
          <h3 style={{ margin: 0 }}>Voice Command</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          display: 'flex',
          gap: 8,
          marginBottom: 16
        }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Speak or type your command..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 20,
              border: '1px solid #ddd',
              outline: 'none',
              fontSize: 16
            }}
          />
          <button 
            onClick={startListening}
            disabled={isListening}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: isListening ? '#ff4444' : '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🎤
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: text.trim() ? '#2196F3' : '#ddd',
              color: 'white',
              cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ➡️
          </button>
        </div>

        {debugText && (
          <pre style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0
          }}>
            {debugText}
          </pre>
        )}
      </div>
    </div>
  );
};

export default VoiceDialog;
