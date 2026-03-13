import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// database connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("mongoDB is connected"))
.catch((err)=>console.log(err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

import collageRoutes from './routes/collages.js';
import authRoutes from './routes/auth.js';

app.use('/api/collages', collageRoutes);
app.use('/api/auth', authRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});