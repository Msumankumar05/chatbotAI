import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous'
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema],
  mode: {
    type: String,
    enum: ['exam', 'coding', 'syllabus'],
    default: 'exam'
  },
  fileContext: [{
    fileName: String,
    fileType: String,
    content: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;