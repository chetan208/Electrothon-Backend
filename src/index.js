import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";

import collageRoutes from './routes/collages.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import postRoutes from './routes/post.js';
import chatRoute from "./routes/chat.route.js";


// database connection
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("mongoDB is connected"))
.catch((err)=>console.log(err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});



app.use('/api/collages', collageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/post', postRoutes);
app.use("/api", chatRoute);





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});