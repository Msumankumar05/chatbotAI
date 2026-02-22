import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import FileUpload from '../components/FileUpload';
import PDFExport from '../components/PDFExport';
import SpeechButton from '../components/SpeechButton';
import { cn } from '../utils/cn';
import { Bot, User, FileText, Plus } from 'lucide-react';


const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('exam');
  const [fileContext, setFileContext] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    setMessages([]);
    setFileContext([]);
    navigate('/');
    toast.success('New chat created');
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat/history/${chatId}`);
      setMessages(response.data.messages);
      setMode(response.data.mode);
      if (response.data.fileContext) {
        setFileContext(response.data.fileContext);
      }
    } catch (error) {
      toast.error('Failed to load chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      if (!chatId && response.data.chatId) {
        window.history.pushState({}, '', `/chat/${response.data.chatId}`);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (chatId) formData.append('chatId', chatId);

      const response = await axios.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFileContext(prev => [...prev, {
        fileName: response.data.fileName,
        content: response.data.content
      }]);

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleGenerateSummary = async () => {
    if (fileContext.length === 0) {
      toast.error('No files uploaded');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`/api/files/summarize/${chatId}`, {
        content: fileContext[0].content,
        fileName: fileContext[0].fileName
      });

      const summaryMessage = {
        role: 'assistant',
        content: `📚 **Study Summary Generated**\n\n${formatSummary(response.data)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const formatSummary = (summary) => {
    let formatted = '';

    if (summary.unitWiseTopics) {
      formatted += '### 📖 Unit-wise Topics\n\n';
      summary.unitWiseTopics.forEach(unit => {
        formatted += `**${unit.unit}**\n`;
        unit.topics.forEach(topic => {
          formatted += `• ${topic}\n`;
        });
        formatted += `*Importance: ${unit.importance}*\n\n`;
      });
    }

    if (summary.keyPoints) {
      formatted += '### 🎯 Key Points\n\n';
      summary.keyPoints.forEach(point => {
        formatted += `• ${point}\n`;
      });
      formatted += '\n';
    }

    if (summary.examPriority) {
      formatted += '### 📝 Exam Priority\n\n';
      summary.examPriority.forEach(item => {
        formatted += `**${item.topic}**\n`;
        formatted += `  ${item.reason}\n`;
        formatted += `  *Weightage: ${item.weightage}*\n\n`;
      });
    }

    return formatted;
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Header */}
      <div className="glass-card m-4 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="text-primary-400" size={24} />
          <h2 className="text-lg font-semibold">MentorAI Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={createNewChat}
            className="p-2 rounded-lg hover:bg-dark-border/50 transition-colors flex items-center gap-2"
            title="New Chat"
          >
            <Plus size={20} className="text-primary-400" />
            <span className="text-sm hidden sm:inline">New Chat</span>
          </button>

          {fileContext.length > 0 && (
            <button
              onClick={handleGenerateSummary}
              className="p-2 rounded-lg hover:bg-dark-border/50 transition-colors"
              title="Generate Summary"
            >
              <FileText size={20} className="text-primary-400" />
            </button>
          )}
          <PDFExport messages={messages} />
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="p-2 rounded-lg hover:bg-dark-border/50 transition-colors"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* File Upload Panel */}
      <AnimatePresence>
        {showFileUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-4 overflow-hidden"
          >
            <FileUpload onFileUpload={handleFileUpload} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Context Chips */}
      {fileContext.length > 0 && (
        <div className="mx-4 mb-2 flex flex-wrap gap-2">
          {fileContext.map((file, index) => (
            <div
              key={index}
              className="glass-card px-3 py-1 text-sm flex items-center gap-2"
            >
              <FileText size={14} className="text-primary-400" />
              <span>{file.fileName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
                  <Bot size={18} className="text-primary-400" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4",
                  message.role === 'user'
                    ? 'chat-bubble-user'
                    : 'chat-bubble-ai'
                )}
              >
                <ReactMarkdown
                  className="prose prose-invert"
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Footer with timestamp and speech button */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-dark-muted">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  {/* ✅ Speech button only for AI messages */}
                  {message.role === 'assistant' && <SpeechButton text={message.content} />}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
              <Bot size={18} className="text-primary-400" />
            </div>
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onFileUpload={() => setShowFileUpload(true)}
      />
    </div>
  );
};

export default Chat;