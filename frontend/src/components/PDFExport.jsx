import React, { useState } from 'react';
import { Download, FileText, ChevronDown, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const PDFExport = ({ messages, summary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState('chat');
  const [isExporting, setIsExporting] = useState(false);

  const formatChatForPDF = () => {
    console.log('Formatting chat for PDF. Messages:', messages);
    
    if (!messages || messages.length === 0) {
      console.log('No messages to format');
      return '# No messages to export';
    }

    let content = '# MentorAI Chat Export\n\n';
    content += `Exported: ${new Date().toLocaleString()}\n`;
    content += `Total Messages: ${messages.length}\n\n`;
    
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? '👤 You' : '🤖 MentorAI';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      
      content += `## ${role} [${time}]\n`;
      content += `${msg.content}\n\n`;
      
      if (index < messages.length - 1) {
        content += '---\n\n';
      }
    });
    
    console.log('Formatted content length:', content.length);
    console.log('First 100 chars:', content.substring(0, 100));
    
    return content;
  };

  const formatSummaryForPDF = () => {
    if (!summary) return '';
    
    let content = '# 📚 Study Summary\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    if (summary.unitWiseTopics) {
      content += '## Unit-wise Topics\n\n';
      summary.unitWiseTopics.forEach(unit => {
        content += `### ${unit.unit}\n`;
        unit.topics.forEach(topic => {
          content += `• ${topic}\n`;
        });
        content += `\n*Importance: ${unit.importance}*\n\n`;
      });
    }

    if (summary.keyPoints) {
      content += '## Key Points\n\n';
      summary.keyPoints.forEach(point => {
        content += `• ${point}\n`;
      });
      content += '\n';
    }

    if (summary.examPriority) {
      content += '## Exam Priority\n\n';
      summary.examPriority.forEach(item => {
        content += `### ${item.topic}\n`;
        content += `${item.reason}\n`;
        content += `*Weightage: ${item.weightage}*\n\n`;
      });
    }

    return content;
  };

  const handleExport = async () => {
    if (exportType === 'chat' && messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading('Generating PDF...');

    try {
      let content = '';
      let title = '';

      if (exportType === 'chat') {
        content = formatChatForPDF();
        title = `MentorAI-Chat-${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      } else if (exportType === 'summary' && summary) {
        content = formatSummaryForPDF();
        title = `Summary-${summary.fileName || 'Notes'}-${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      }

      console.log('Sending to backend:', { title, contentLength: content.length });

      const response = await axios.post('/api/pdf/generate', {
        content,
        title
      }, {
        responseType: 'blob',
        timeout: 30000
      });

      console.log('Response received:', response);

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('PDF downloaded successfully!', { id: toastId });
      setIsOpen(false);

    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to download PDF', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-dark-border/50 transition-colors flex items-center gap-1"
        title="Export as PDF"
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Download size={20} />
        )}
        <ChevronDown size={16} className={cn(
          "transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && !isExporting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 z-50"
          >
            <div className="glass-card p-4 border border-dark-border shadow-2xl">
              <h3 className="text-sm font-semibold mb-3 text-dark-text">Export as PDF</h3>
              
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setExportType('chat')}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    exportType === 'chat' 
                      ? "bg-primary-600/20 text-primary-400 border border-primary-500/30" 
                      : "hover:bg-dark-border/50 text-dark-muted hover:text-dark-text"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className={exportType === 'chat' ? 'text-primary-400' : 'text-dark-muted'} />
                    <div>
                      <p className="text-sm font-medium">Current Chat</p>
                      <p className="text-xs text-dark-muted">
                        {messages.length} messages
                      </p>
                    </div>
                  </div>
                </button>
                
                {summary && (
                  <button
                    onClick={() => setExportType('summary')}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-all",
                      exportType === 'summary' 
                        ? "bg-primary-600/20 text-primary-400 border border-primary-500/30" 
                        : "hover:bg-dark-border/50 text-dark-muted hover:text-dark-text"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className={exportType === 'summary' ? 'text-primary-400' : 'text-dark-muted'} />
                      <div>
                        <p className="text-sm font-medium">Study Summary</p>
                        <p className="text-xs text-dark-muted">
                          {summary?.fileName || 'Generated summary'}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 p-2 rounded-lg hover:bg-dark-border/50 transition-colors text-sm text-dark-muted hover:text-dark-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 p-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors text-sm text-white"
                >
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFExport;