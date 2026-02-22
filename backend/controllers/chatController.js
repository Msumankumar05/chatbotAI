import Chat from '../models/Chat.js';
import { generateAIResponse } from '../services/aiService.js';
import { extractTextFromFile } from '../services/fileService.js';

export const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message, chatId, mode, fileContext } = req.body;
      
      let chat;
      if (chatId) {
        chat = await Chat.findById(chatId);
        if (!chat) {
          return res.status(404).json({ error: 'Chat not found' });
        }
      } else {
        chat = new Chat({
          messages: [],
          mode: mode || 'exam'
        });
      }

      // Add user message
      chat.messages.push({
        role: 'user',
        content: message
      });

      // Prepare context from files if any
      let contextMessage = '';
      if (fileContext && fileContext.length > 0) {
        contextMessage = 'Based on the uploaded files:\n';
        fileContext.forEach(file => {
          contextMessage += `File: ${file.fileName}\nContent: ${file.content}\n\n`;
        });
      }

      // Generate AI response
      const aiResponse = await generateAIResponse(
        message,
        mode,
        contextMessage
      );

      // Add AI response
      chat.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // Update title if this is the first message
      if (chat.messages.length === 2) {
        chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      }

      await chat.save();

      res.json({
        chatId: chat._id,
        response: aiResponse,
        messages: chat.messages
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  },

  getAllChats: async (req, res) => {
    try {
      const chats = await Chat.find({})
        .sort({ updatedAt: -1 })
        .select('_id title mode updatedAt');
      
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  },

  updateMode: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { mode } = req.body;

      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { mode },
        { new: true }
      );

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update mode' });
    }
  },

  deleteChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      await Chat.findByIdAndDelete(chatId);
      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  }
};