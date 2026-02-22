import express from 'express';
import { pdfController } from '../controllers/pdfController.js';

const router = express.Router();

router.post('/generate', pdfController.generatePDF);
router.post('/summary/:summaryId', pdfController.generateSummaryPDF);

export default router;