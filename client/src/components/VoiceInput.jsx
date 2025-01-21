import React, { useState, useRef } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-popups/styles/material.css';

const VoiceInput = ({ onSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [debugText, setDebugText] = useState('');
  const recognition = useRef(null);

  const startListening = () => {
    recognition.current = new webkitSpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = false;
    recognition.current.lang = 'en-US';

    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setDebugText(`Recognized Text: ${transcript}\nConfidence: ${event.results[0][0].confidence}`);
      setShowDebug(true);
      setIsListening(false);
    };

    recognition.current.onerror = (event) => {
      setDebugText(`Error: ${event.error}`);
      setShowDebug(true);
      setIsListening(false);
    };

    recognition.current.start();
    setIsListening(true);
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="voice-input-container">
      <div className="input-group">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type or speak your command..."
          className="e-input"
        />
        <ButtonComponent 
          onClick={handleSubmit}
          iconCss="e-icons e-arrow-right"
          cssClass="e-primary"
        />
        <ButtonComponent
          onClick={startListening}
          iconCss={isListening ? "e-icons e-pause" : "e-icons e-mic"}
          cssClass={isListening ? "e-danger" : "e-primary"}
        />
      </div>

      <DialogComponent
        width="400px"
        target="#root"
        visible={showDebug}
        close={() => setShowDebug(false)}
        header="Voice Recognition Debug"
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {debugText}
        </pre>
      </DialogComponent>
    </div>
  );
};

export default VoiceInput;
