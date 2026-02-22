import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  fileName: String,
  originalContent: String,
  summary: {
    unitWiseTopics: [{
      unit: String,
      topics: [String],
      importance: {
        type: String,
        enum: ['High', 'Medium', 'Low']
      }
    }],
    keyPoints: [String],
    examPriority: [{
      topic: String,
      reason: String,
      weightage: String
    }],
    quickRevision: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Summary = mongoose.model('Summary', summarySchema);
export default Summary;