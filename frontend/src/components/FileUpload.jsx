import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const FileUpload = ({ onFileUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Max size 10MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} has invalid type. Only PDF, DOCX, TXT allowed`);
          } else {
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Handle accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-upload each file
    newFiles.forEach(f => uploadFile(f.file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
  });

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => 
            f.file === file && f.status === 'pending'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      await onFileUpload(file);
      
      clearInterval(interval);
      
      setFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );
      
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      setFiles(prev => 
        prev.map(f => 
          f.file === file 
            ? { ...f, status: 'error', progress: 0 }
            : f
        )
      );
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const retryUpload = (file) => {
    setFiles(prev => 
      prev.map(f => 
        f.file === file 
          ? { ...f, status: 'pending', progress: 0 }
          : f
      )
    );
    uploadFile(file.file);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragActive 
            ? "border-primary-500 bg-primary-500/10" 
            : "border-dark-border hover:border-primary-500/50 hover:bg-dark-card/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload 
          size={40} 
          className={cn(
            "mx-auto mb-4",
            isDragActive ? "text-primary-400" : "text-dark-muted"
          )} 
        />
        <p className="text-dark-text mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-dark-muted">
          or <span className="text-primary-400">browse</span>
        </p>
        <p className="text-xs text-dark-muted mt-2">
          Supports PDF, DOCX, TXT (Max 10MB)
        </p>
      </div>

      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-3 flex items-center gap-3"
          >
            <div className="relative">
              <File size={24} className="text-primary-400" />
              {file.status === 'error' && (
                <AlertCircle size={12} className="absolute -top-1 -right-1 text-red-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.file.name}</p>
              <p className="text-xs text-dark-muted">
                {(file.file.size / 1024).toFixed(2)} KB
              </p>
              
              {/* Progress bar */}
              {file.status === 'pending' && (
                <div className="w-full h-1 bg-dark-border rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {file.status === 'pending' && (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              )}
              
              {file.status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check size={20} className="text-green-400" />
                </motion.div>
              )}
              
              {file.status === 'error' && (
                <button
                  onClick={() => retryUpload(file)}
                  className="p-1 hover:bg-dark-border/50 rounded"
                  title="Retry upload"
                >
                  <AlertCircle size={16} className="text-yellow-400" />
                </button>
              )}
              
              <button
                onClick={() => removeFile(file)}
                className="p-1 hover:bg-dark-border/50 rounded"
                title="Remove file"
              >
                <X size={16} className="text-dark-muted hover:text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;