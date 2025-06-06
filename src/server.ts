import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './infrastructure/database/mongoose/connection';
import studentRoutes from './infrastructure/routes/student.routes';
import reportRoutes from './infrastructure/routes/report.routes';

const app = express();

const morganFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
  : 'dev';

app.use(morgan(morganFormat, {
  skip: (req, res) => process.env.NODE_ENV === 'production' && res.statusCode < 400
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://g-scores.com'] 
    : ['http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400, 
  preflightContinue: false,
  exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});