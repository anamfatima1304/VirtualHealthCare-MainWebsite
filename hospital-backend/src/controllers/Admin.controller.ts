import { Request, Response } from 'express';
import Admin from '../models/Admin.model';

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
      const admin = await Admin.findOne({ id: parseInt(req.params.id) }).select('-password');
      
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
        { id: parseInt(req.params.id) },
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
      const admin = await Admin.findOneAndDelete({ id: parseInt(req.params.id) });

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
}