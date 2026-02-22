import express from 'express';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

router.post('/message', chatController.sendMessage);
router.get('/history/:chatId', chatController.getChatHistory);
router.get('/histories', chatController.getAllChats);
router.put('/mode/:chatId', chatController.updateMode);
router.delete('/:chatId', chatController.deleteChat);

export default router;