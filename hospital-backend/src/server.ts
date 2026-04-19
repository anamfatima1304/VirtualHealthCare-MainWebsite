import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import departmentRoutes from './routes/department.routes';
import healthTestRoutes from './routes/healthTest.routes';
import doctorRoutes from './routes/doctor.routes';
import credentialsRoutes from './routes/credentials.routes';
import feedbackRoutes from './routes/Feedback.routes';
import adminRoutes from './routes/Admin.routes';

// NEW: Import doctor model so health route can return doctor data
import Doctor from './models/Doctor.model';
// NEW: Import the appointment routes
import appointmentRoutes from './routes/appointment.routes';

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
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/credentials', credentialsRoutes);

// NEW: Register the appointment routes
app.use('/api/appointments', appointmentRoutes);

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find().limit(10).select('-__v');
    res.status(200).json({
      status: 'Server is running',
      doctorsCount: doctors.length,
      doctors: doctors
    });
  } catch (error) {
    res.status(500).json({
      status: 'Server is running',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Departments API: http://localhost:${PORT}/api/departments`);
      console.log(`Doctors API: http://localhost:${PORT}/api/doctors`);
      console.log(`Appointments API: http://localhost:${PORT}/api/appointments`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();