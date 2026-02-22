import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chatRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorai', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('✅ MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔍 Check your username and password in .env file');
  });

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pdf', pdfRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});