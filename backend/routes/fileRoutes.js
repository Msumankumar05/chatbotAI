import express from 'express';
import multer from 'multer';
import { fileController } from '../controllers/fileController.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.post('/summarize/:chatId', fileController.generateSummary);
router.get('/summaries/:chatId', fileController.getSummaries);

export default router;