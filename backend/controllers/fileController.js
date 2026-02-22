import Chat from '../models/Chat.js';
import Summary from '../models/Summary.js';
import { extractTextFromFile, chunkContent } from '../services/fileService.js';
import { generateSummary } from '../services/aiService.js';

export const fileController = {
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { chatId } = req.body;
      const extractedText = await extractTextFromFile(req.file.buffer, req.file.mimetype);

      // Store file context in chat
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.fileContext.push({
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          content: extractedText.substring(0, 10000) // Store first 10000 chars
        });
        await chat.save();
      }

      res.json({
        success: true,
        fileName: req.file.originalname,
        content: extractedText.substring(0, 500) + '...', // Preview
        fullContent: extractedText // For AI processing
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to process file' });
    }
  },

  generateSummary: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, fileName } = req.body;

      const summary = await generateSummary(content, 'syllabus');

      // Save summary to database
      const newSummary = new Summary({
        chatId,
        fileName,
        originalContent: content.substring(0, 1000), // Store preview
        summary
      });
      await newSummary.save();

      res.json({
        success: true,
        summaryId: newSummary._id,
        ...summary
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  },

  getSummaries: async (req, res) => {
    try {
      const { chatId } = req.params;
      const summaries = await Summary.find({ chatId })
        .sort({ createdAt: -1 });
      
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch summaries' });
    }
  }
};