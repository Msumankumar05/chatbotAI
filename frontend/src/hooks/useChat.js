import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('exam');
  const [fileContext, setFileContext] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat/history/${chatId}`);
      setMessages(response.data.messages);
      setMode(response.data.mode);
      setFileContext(response.data.fileContext || []);
    } catch (err) {
      setError('Failed to load chat history');
      toast.error('Failed to load chat history');
    }
  };

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/chat/message', {
        message: content,
        chatId,
        mode,
        fileContext: fileContext.map(f => ({
          fileName: f.fileName,
          content: f.content
        }))
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update chatId if this is a new chat
      if (!chatId && response.data.chatId) {
        window.history.pushState({}, '', `/chat/${response.data.chatId}`);
        return response.data.chatId;
      }
    } catch (err) {
      setError('Failed to send message');
      toast.error('Failed to send message');
      console.error('Chat error:', err);
      
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [chatId, mode, fileContext]);

  const updateMode = useCallback(async (newMode) => {
    if (chatId) {
      try {
        await axios.put(`/api/chat/mode/${chatId}`, { mode: newMode });
      } catch (err) {
        toast.error('Failed to update mode');
        console.error('Mode update error:', err);
      }
    }
    setMode(newMode);
  }, [chatId]);

  const addFileContext = useCallback((file) => {
    setFileContext(prev => [...prev, file]);
  }, []);

  const removeFileContext = useCallback((fileName) => {
    setFileContext(prev => prev.filter(f => f.fileName !== fileName));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setFileContext([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    mode,
    fileContext,
    error,
    sendMessage,
    updateMode,
    addFileContext,
    removeFileContext,
    clearChat
  };
};