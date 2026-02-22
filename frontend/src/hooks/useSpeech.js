import { useState, useCallback, useEffect, useRef } from 'react';

export const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [supported, setSupported] = useState(false);
    const utteranceRef = useRef(null);

    // Load voices and check support
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setSupported(false);
            return;
        }

        setSupported(true);

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            console.log('🎤 useSpeech: availableVoices count:', availableVoices.length);
            setVoices(availableVoices);

            if (availableVoices.length > 0) {
                const defaultVoice = availableVoices.find(v =>
                    v.lang.includes('en-US') || v.lang.includes('en')
                ) || availableVoices[0];
                console.log('🎤 useSpeech: default voice selected:', defaultVoice.name);
                setSelectedVoice(prev => prev || defaultVoice);
            }
        };

        loadVoices();

        // Use addEventListener for wider compatibility
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            }
        };
    }, []);

    const speak = useCallback((text, options = {}) => {
        if (!supported || !text) {
            console.warn('⚠️ useSpeech: speak called but not supported or no text');
            return;
        }

        console.log('🔊 useSpeech: Attempting to speak:', text.substring(0, 50) + '...');

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Small delay to ensure cancel completes
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance; // Keep reference to prevent GC

            const voice = options.voice || selectedVoice;
            if (voice) {
                utterance.voice = voice;
                console.log('🎤 useSpeech: Using voice:', voice.name);
            }

            // Set properties
            utterance.rate = options.rate || 1.0;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            utterance.lang = options.lang || 'en-US';

            // Events
            utterance.onstart = () => {
                console.log('▶️ useSpeech: Speech started');
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                console.log('⏹️ useSpeech: Speech ended successfully after finishing all text');
                setIsSpeaking(false);
                setIsPaused(false);
                utteranceRef.current = null;
            };

            utterance.onboundary = (event) => {
                console.log(`🗣️ useSpeech: Boundary reached at char ${event.charIndex} (${event.name})`);
            };

            utterance.onerror = (event) => {
                console.error('❌ useSpeech: Speech error event:', event);
                setIsSpeaking(false);
                setIsPaused(false);
                utteranceRef.current = null;
            };

            utterance.onpause = () => setIsPaused(true);
            utterance.onresume = () => setIsPaused(false);

            // Sometimes the engine gets stuck, resume can help
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        }, 50);
    }, [supported, selectedVoice]);

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
            utteranceRef.current = null;
        }
    }, [supported]);

    const pause = useCallback(() => {
        if (supported && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }, [supported]);

    const resume = useCallback(() => {
        if (supported && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, [supported]);

    const changeVoice = useCallback((voice) => {
        setSelectedVoice(voice);
    }, []);

    return {
        speak,
        cancel,
        pause,
        resume,
        changeVoice,
        isSpeaking,
        isPaused,
        supported,
        voices,
        selectedVoice
    };
};
