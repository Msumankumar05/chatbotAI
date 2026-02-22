import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip, Sparkles, Zap, Clock } from 'lucide-react';
import { cn } from '../utils/cn';
import SpeechRecognition from './SpeechRecognition';
import toast from 'react-hot-toast';

const ChatInput = ({ onSendMessage, isLoading, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      setShowQuickActions(false);

      // Show sending feedback
      toast.success('Message sent', { icon: '🚀', duration: 2000 });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = (transcript) => {
    setMessage(transcript);
    textareaRef.current?.focus();
    toast.success('Voice captured!', { icon: '🎤' });
  };

  const suggestedQuestions = [
    { text: "Explain recursion", icon: "🔄", color: "blue" },
    { text: "Time complexity", icon: "⏱️", color: "green" },
    { text: "Array methods", icon: "📚", color: "purple" },
    { text: "Quick sort", icon: "⚡", color: "yellow" }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card m-4 transition-all duration-300 relative"
    >
      {/* Quick actions bar */}
      <AnimatePresence>
        {showQuickActions && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 flex flex-wrap gap-2 border-b border-dark-border/30">
              <span className="text-xs text-dark-muted flex items-center gap-1">
                <Zap size={12} className="text-yellow-400" />
                Quick questions:
              </span>
              {suggestedQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMessage(q.text)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full transition-all",
                    `bg-${q.color}-500/10 hover:bg-${q.color}-500/20 text-${q.color}-400 border border-${q.color}-500/30`
                  )}
                >
                  <span className="mr-1">{q.icon}</span>
                  {q.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
        {/* <button
          type="button"
          onClick={onFileUpload}
          className="p-3 rounded-xl hover:bg-dark-border/50 transition-colors group relative"
          title="Upload file"
        >
          <Paperclip size={20} className="text-dark-muted group-hover:text-primary-400 transition-colors" />
        </button> */}

        <button
          type="button"
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="p-3 rounded-xl hover:bg-dark-border/50 transition-colors group relative"
          title="Quick questions"
        >
          <Zap size={20} className={cn(
            "transition-colors",
            showQuickActions ? "text-yellow-400" : "text-dark-muted group-hover:text-yellow-400"
          )} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask MentorAI anything... (Shift+Enter for new line)"
            className={cn(
              "w-full max-h-[200px] input-glass px-4 py-3 pr-12 resize-none transition-all",
              isFocused && "ring-2 ring-primary-500/50"
            )}
            rows={1}
            disabled={isLoading}
          />

          <SpeechRecognition
            onTranscript={handleVoiceInput}
            isListening={isListening}
            setIsListening={setIsListening}
          />

          {/* Character count for long messages */}
          {message.length > 100 && (
            <div className="absolute right-12 bottom-2 text-xs text-dark-muted">
              {message.length}/500
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={!message.trim() || isLoading}
          whileHover={{ scale: message.trim() && !isLoading ? 1.05 : 1 }}
          whileTap={{ scale: message.trim() && !isLoading ? 0.95 : 1 }}
          className={cn(
            "p-3 rounded-xl transition-all relative overflow-hidden group",
            message.trim() && !isLoading
              ? "bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-lg"
              : "bg-dark-border/30 text-dark-muted cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs hidden sm:inline">Sending</span>
            </div>
          ) : (
            <>
              <Send size={20} className="group-hover:scale-110 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </>
          )}
        </motion.button>
      </form>


    </motion.div>
  );
};

export default ChatInput;