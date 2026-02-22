import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection...');
console.log('URI (hidden password):', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('CONNECTION SUCCESSFUL!');
    process.exit(0);
  })
  .catch(err => {
    console.error('CONNECTION FAILED:', err.message);
    process.exit(1);
  });