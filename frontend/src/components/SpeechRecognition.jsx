import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SpeechRecognition = ({ onTranscript, isListening, setIsListening }) => {
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        onTranscript(transcript);
        
        // Update volume based on confidence for visual effect
        if (event.results[event.results.length - 1][0].confidence) {
          setVolume(event.results[event.results.length - 1][0].confidence * 100);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Speech recognition failed: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setVolume(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVolume(0);
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now');
        
        // Start volume animation
        startVolumeAnimation();
      } catch (error) {
        toast.error('Microphone access denied');
        console.error('Microphone error:', error);
      }
    }
  };

  const startVolumeAnimation = () => {
    // Simple volume animation since we can't easily get real volume from Web Speech API
    const animate = () => {
      setVolume(prev => {
        const newVolume = prev + (Math.random() - 0.5) * 20;
        return Math.max(20, Math.min(80, newVolume));
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className="absolute right-2 bottom-2 p-2 rounded-lg hover:bg-dark-border/50 transition-colors group"
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative"
          >
            <Mic size={20} className="text-red-400" />
            
            {/* Volume visualization */}
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400/20"
              animate={{
                scale: [1, 1 + volume / 100, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-card text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Click to stop
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="not-listening"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <MicOff size={20} className="text-dark-muted group-hover:text-primary-400 transition-colors" />
            
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-dark-card text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Start voice input
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default SpeechRecognition;