import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      toast.error('Failed to start speech recognition');
    }
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript
  };
};