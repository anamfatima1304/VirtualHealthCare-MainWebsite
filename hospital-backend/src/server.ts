import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import departmentRoutes from './routes/department.routes';
import healthTestRoutes from './routes/healthTest.routes';
import doctorRoutes from './routes/doctor.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/health-tests', healthTestRoutes);
app.use('/api/doctors', doctorRoutes); 

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Server is running' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Departments API: http://localhost:${PORT}/api/departments`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();