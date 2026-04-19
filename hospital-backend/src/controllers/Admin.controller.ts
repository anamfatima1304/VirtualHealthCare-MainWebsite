import { Request, Response } from 'express';
import Admin from '../models/Admin.model';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import Feedback from '../models/Feedback.model';
import HealthTest from '../models/HealthTest.model';
import Department from '../models/Department.model';

export class AdminController {
  // Get all admins
  async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await Admin.find().select('-password').sort({ id: 1 });
      res.status(200).json({
        success: true,
        count: admins.length,
        data: admins
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching admins',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single admin by ID
  async getAdminById(req: Request, res: Response): Promise<void> {
    try {
      const admin = await Admin.findOne({ id: parseInt(req.params.id as string) }).select('-password');
      
      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: admin
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get admin by email
  async getAdminByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const admin = await Admin.findOne({ email }).select('-password');
      
      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: admin
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new admin
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email: req.body.email });
      if (existingAdmin) {
        res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
        return;
      }

      // Get the highest ID and increment
      const lastAdmin = await Admin.findOne().sort({ id: -1 });
      const newId = lastAdmin ? lastAdmin.id + 1 : 1;

      const adminData = {
        ...req.body,
        id: newId
      };

      const newAdmin = new Admin(adminData);
      await newAdmin.save();
      
      // Remove password from response
      const { password, ...adminResponse } = newAdmin.toObject();

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: adminResponse
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update admin
  async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      // If password is being updated, it will be hashed by the pre-save middleware
      const admin = await Admin.findOneAndUpdate(
        { id: parseInt(req.params.id as string) },
        req.body,
        { new: true, runValidators: true }
      ).select('-password');

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: admin
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete admin
  async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const admin = await Admin.findOneAndDelete({ id: parseInt(req.params.id as string) });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Login admin
  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
        return;
      }

      // Find admin by email (include password for comparison)
      const admin = await Admin.findOne({ email });

      if (!admin) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check password
      const isPasswordValid = await admin.comparePassword(password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Remove password from response using destructuring
      const { password: _, ...adminResponse } = admin.toObject();

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: adminResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Seed initial admin data
  async seedAdmin(req: Request, res: Response): Promise<void> {
    try {
      // Clear existing data
      await Admin.deleteMany({});

      // Create single admin - Abdullah Hassan
      const adminData = {
        id: 1,
        firstName: 'Abdullah',
        lastName: 'Hassan',
        phoneNumber: '+92 300 1234567',
        email: 'abdullah.hassan@hospital.com',
        password: 'abdullah.hassan', // Will be hashed by pre-save middleware
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newAdmin = new Admin(adminData);
      await newAdmin.save();
      
      // Remove password from response using destructuring
      const { password, ...adminResponse } = newAdmin.toObject();

      res.status(201).json({
        success: true,
        message: 'Admin seeded successfully',
        data: adminResponse
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error seeding admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get analytics data
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      // Get total counts
      const [totalPatients, totalDoctors, totalAppointments, totalFeedback, totalHealthTests, totalDepartments] = await Promise.all([
        Patient.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Feedback.countDocuments(),
        HealthTest.countDocuments(),
        Department.countDocuments()
      ]);

      // Get appointment status distribution
      const appointmentStatusStats = await Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get monthly appointment trends (last 12 months)
      const monthlyAppointments = await Appointment.aggregate([
        {
          $match: {
            appointmentDate: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$appointmentDate' },
              month: { $month: '$appointmentDate' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Get department-wise appointment counts
      const departmentAppointments = await Appointment.aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctorId',
            foreignField: 'id',
            as: 'doctor'
          }
        },
        {
          $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'doctor.department',
            foreignField: 'name',
            as: 'department'
          }
        },
        {
          $unwind: { path: '$department', preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: '$department.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get recent feedback (last 10)
      const recentFeedback = await Feedback.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name message createdAt');

      // Get health test statistics
      const healthTestStats = await HealthTest.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totals: {
            patients: totalPatients,
            doctors: totalDoctors,
            appointments: totalAppointments,
            feedback: totalFeedback,
            healthTests: totalHealthTests,
            departments: totalDepartments
          },
          appointmentStatusStats,
          monthlyAppointments,
          departmentAppointments,
          recentFeedback,
          healthTestStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get dashboard summary (quick stats for dashboard)
  async getDashboardSummary(req: Request, res: Response): Promise<void> {
    try {
      const [totalPatients, totalDoctors, totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
        Patient.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'pending' }),
        Appointment.countDocuments({ status: 'Completed' })
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          pendingAppointments,
          completedAppointments
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}