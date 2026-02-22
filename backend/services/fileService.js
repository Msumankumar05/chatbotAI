import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromFile = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('File extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
};

export const chunkContent = (content, maxChunkSize = 3000) => {
  const chunks = [];
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        // If a single sentence is too long, split it
        const words = sentence.split(' ');
        let tempChunk = '';
        for (const word of words) {
          if ((tempChunk + ' ' + word).length > maxChunkSize) {
            chunks.push(tempChunk.trim());
            tempChunk = word;
          } else {
            tempChunk += (tempChunk ? ' ' : '') + word;
          }
        }
        if (tempChunk) {
          currentChunk = tempChunk;
        }
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};