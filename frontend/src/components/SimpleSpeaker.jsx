import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SimpleSpeaker = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    // Check if browser supports speech
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech!');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);
    
    // Try to find a good English voice
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en-US') || voice.lang.includes('en')
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
      console.log('Using voice:', englishVoice.name);
    }

    // Set voice properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Events
    utterance.onstart = () => {
      console.log('▶️ Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('⏹️ Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event);
      setIsSpeaking(false);
      alert('Speech failed: ' + event.error);
    };

    // Speak
    console.log('🔊 Attempting to speak...');
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    console.log('⏹️ Speech stopped');
  };

  return (
    <div className="flex items-center gap-1">
      {!isSpeaking ? (
        <button
          onClick={speak}
          className="p-2 rounded-full hover:bg-primary-600/20 text-primary-400 transition-colors"
          title="Read aloud"
        >
          <Volume2 size={18} />
        </button>
      ) : (
        <button
          onClick={stop}
          className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
          title="Stop"
        >
          <VolumeX size={18} />
        </button>
      )}
    </div>
  );
};

export default SimpleSpeaker;