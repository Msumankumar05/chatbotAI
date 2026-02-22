import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes conditionally
 * @param  {...any} inputs - Class names or conditional class objects
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} - Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return then.toLocaleDateString();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Extract code blocks from markdown text
 * @param {string} text - Markdown text
 * @returns {Array} - Array of code blocks with language and code
 */
export function extractCodeBlocks(text) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return blocks;
}