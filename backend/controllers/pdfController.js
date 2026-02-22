import PDFDocument from 'pdfkit';
import Summary from '../models/Summary.js';
import Chat from '../models/Chat.js';

export const pdfController = {
  generatePDF: async (req, res) => {
    try {
      let { content, title } = req.body;

      // Clean content and fix encoding issues (emojis)
      const cleanContent = (text) => {
        if (!text) return '';
        return text
          .trim()
          .replace(/[👤🤖📚🎯📝👤]/g, '') // Remove emojis that cause encoding issues
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Remove all other emojis
      };

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: title || 'MentorAI Notes',
          Author: 'MentorAI'
        }
      });

      // Apply dark theme to every page
      const applyBackground = () => {
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
      };

      doc.on('pageAdded', applyBackground);
      applyBackground(); // Apply to first page

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${(title || 'notes').replace(/[^a-z0-9]/gi, '_')}.pdf`);

      doc.pipe(res);

      // Header
      doc.fillColor('#818cf8')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(title || 'MentorAI Notes', 50, 50);

      doc.moveDown(1.5);

      const lines = cleanContent(content).split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine && index > 0 && !lines[index - 1].trim()) return; // Skip multiple empty lines

        if (trimmedLine.startsWith('#')) {
          doc.moveDown(0.5);
          doc.fillColor('#818cf8')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(trimmedLine.replace(/#/g, '').trim());
          doc.moveDown(0.2);
        } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
          doc.fillColor('#e5e5e5')
            .fontSize(12)
            .font('Helvetica')
            .text(`  • ${trimmedLine.substring(1).trim()}`);
        } else if (trimmedLine.includes('```')) {
          doc.fillColor('#10b981')
            .font('Courier')
            .fontSize(10)
            .text(trimmedLine.replace(/```/g, '').trim());
        } else if (trimmedLine) {
          doc.fillColor('#e5e5e5')
            .font('Helvetica')
            .fontSize(12)
            .text(trimmedLine);
        } else {
          doc.moveDown(0.5);
        }
      });

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF' });
      }
    }
  },

  generateSummaryPDF: async (req, res) => {
    try {
      const { summaryId } = req.params;
      const summary = await Summary.findById(summaryId);

      if (!summary) {
        return res.status(404).json({ error: 'Summary not found' });
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Apply dark theme to every page
      const applyBackground = () => {
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
      };

      doc.on('pageAdded', applyBackground);
      applyBackground();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=summary-${summary.fileName.replace(/[^a-z0-9]/gi, '_')}.pdf`);

      doc.pipe(res);

      // Title
      doc.fillColor('#818cf8')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('Study Summary', 50, 50);

      doc.moveDown(0.5);
      doc.fillColor('#e5e5e5')
        .fontSize(14)
        .text(`File: ${summary.fileName}`, 50, doc.y);

      doc.moveDown(1.5);

      // Unit-wise topics
      if (summary.summary.unitWiseTopics) {
        summary.summary.unitWiseTopics.forEach(unit => {
          doc.fillColor('#818cf8')
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(unit.unit);

          doc.fillColor('#e5e5e5')
            .fontSize(12)
            .font('Helvetica');

          unit.topics.forEach(topic => {
            doc.text(`  • ${topic}`);
          });

          doc.fillColor(unit.importance === 'High' ? '#ef4444' :
            unit.importance === 'Medium' ? '#f59e0b' : '#10b981')
            .fontSize(11)
            .text(`  Importance: ${unit.importance}`);

          doc.moveDown();
        });
      }

      // Key Points
      if (summary.summary.keyPoints) {
        doc.fillColor('#818cf8')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Key Points');

        summary.summary.keyPoints.forEach(point => {
          doc.fillColor('#e5e5e5')
            .fontSize(12)
            .font('Helvetica')
            .text(`  • ${point}`);
        });
        doc.moveDown();
      }

      // Exam Priority
      if (summary.summary.examPriority) {
        doc.fillColor('#818cf8')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Exam Priority');

        summary.summary.examPriority.forEach(item => {
          doc.fillColor('#e5e5e5')
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`  ${item.topic}`);
          doc.font('Helvetica')
            .fontSize(11)
            .text(`    ${item.reason}`);
          doc.fillColor(item.weightage === 'High' ? '#ef4444' :
            item.weightage === 'Medium' ? '#f59e0b' : '#10b981')
            .text(`    Weightage: ${item.weightage}`);
          doc.moveDown(0.5);
        });
      }

      doc.end();
    } catch (error) {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate PDF' });
      }
    }
  }
};
