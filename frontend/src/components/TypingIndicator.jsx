import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 p-4"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      
      {/* Typing animation */}
      <div className="flex items-center space-x-2 bg-dark-card/50 rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-primary-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
                y: [0, -3, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        <span className="text-sm text-dark-muted ml-2">
          MentorAI is thinking
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >...</motion.span>
        </span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;