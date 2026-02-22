import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../hooks/useSpeech';
import { cn } from '../utils/cn';

const SpeechControls = ({ text }) => {
  const {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    supported,
    voices,
    selectedVoice,
    changeVoice,
    debug
  } = useSpeech();

  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);

  // Log when component mounts
  useEffect(() => {
    console.log('🎵 SpeechControls mounted, supported:', supported);
    console.log('📝 Text to speak:', text?.substring(0, 50) + '...');
  }, []);

  const handlePlayPause = () => {
    console.log('👆 Play/Pause clicked, isSpeaking:', isSpeaking);
    
    if (isSpeaking) {
      if (isPaused) {
        console.log('▶️ Resuming...');
        resume();
      } else {
        console.log('⏸️ Pausing...');
        pause();
      }
    } else {
      console.log('🎤 Starting speech...');
      speak(text, { rate, pitch });
    }
  };

  const handleStop = () => {
    console.log('⏹️ Stop clicked');
    cancel();
  };

  if (!supported) {
    return (
      <div className="relative group">
        <button
          className="p-1.5 rounded-full bg-red-500/20 text-red-400"
          title="Speech not supported in this browser"
          onClick={() => setShowDebug(!showDebug)}
        >
          <AlertCircle size={14} />
        </button>
        {showDebug && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-red-500/90 text-white text-xs rounded whitespace-nowrap">
            Browser doesn't support speech
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayPause}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            isSpeaking 
              ? "bg-primary-600 text-white" 
              : "hover:bg-dark-border/50 text-dark-muted hover:text-primary-400"
          )}
          title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Read aloud'}
        >
          {isSpeaking ? (
            isPaused ? <Play size={14} /> : <Pause size={14} />
          ) : (
            <Volume2 size={14} />
          )}
        </motion.button>

        {isSpeaking && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStop}
            className="p-1.5 rounded-full hover:bg-red-500/20 text-dark-muted hover:text-red-400"
            title="Stop"
          >
            <VolumeX size={14} />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-full hover:bg-dark-border/50 text-dark-muted hover:text-primary-400"
          title="Voice settings"
        >
          <Settings size={14} />
        </motion.button>

        {/* Debug button - shows current status */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowDebug(!showDebug)}
          className="p-1.5 rounded-full hover:bg-dark-border/50 text-dark-muted hover:text-yellow-400"
          title="Debug info"
        >
          <AlertCircle size={14} />
        </motion.button>
      </div>

      {/* Debug info */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 glass-card p-3 z-50 border border-dark-border"
          >
            <h4 className="text-xs font-semibold mb-2">Debug Info</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-dark-muted">Status:</span> {debug}</p>
              <p><span className="text-dark-muted">Supported:</span> {supported ? '✅' : '❌'}</p>
              <p><span className="text-dark-muted">Voices:</span> {voices.length}</p>
              <p><span className="text-dark-muted">Selected voice:</span> {selectedVoice?.name || 'None'}</p>
              <p><span className="text-dark-muted">isSpeaking:</span> {isSpeaking ? '✅' : '❌'}</p>
              <p><span className="text-dark-muted">Text length:</span> {text?.length || 0}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 glass-card p-4 z-50 border border-dark-border"
          >
            <h4 className="text-sm font-semibold mb-3">Voice Settings</h4>
            
            {/* Voice selection */}
            <div className="mb-3">
              <label className="text-xs text-dark-muted block mb-1">Voice</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find(v => v.name === e.target.value);
                  if (voice) changeVoice(voice);
                }}
                className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-sm"
              >
                {voices.length === 0 && <option>Loading voices...</option>}
                {voices
                  .filter(v => v.lang.includes('en'))
                  .map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
              </select>
            </div>

            {/* Speed control */}
            <div className="mb-3">
              <div className="flex justify-between text-xs">
                <label className="text-dark-muted">Speed</label>
                <span className="text-primary-400">{rate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Pitch control */}
            <div className="mb-3">
              <div className="flex justify-between text-xs">
                <label className="text-dark-muted">Pitch</label>
                <span className="text-primary-400">{pitch}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-2 p-2 bg-primary-600 rounded-lg text-sm hover:bg-primary-700 transition-colors"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeechControls;