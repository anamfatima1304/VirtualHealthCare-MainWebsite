import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import DoctorCredentials from '../models/DoctorCredentials.model';
import Doctor from '../models/Doctor.model';

export class CredentialsController {
  // Get all credentials with doctor names
  async getAllCredentials(req: Request, res: Response): Promise<void> {
    try {
      const credentials = await DoctorCredentials.find().sort({ id: 1 });
      
      // Fetch doctor names for each credential
      const credentialsWithNames = await Promise.all(
        credentials.map(async (cred) => {
          const doctor = await Doctor.findOne({ id: cred.doctorId });
          return {
            id: cred.id,
            doctorId: cred.doctorId,
            doctorName: doctor?.name || 'Unknown Doctor',
            username: cred.username,
            // Don't send actual password to frontend
            hasPassword: true,
            createdAt: cred.createdAt,
            updatedAt: cred.updatedAt
          };
        })
      );

      res.status(200).json({
        success: true,
        count: credentialsWithNames.length,
        data: credentialsWithNames
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get credentials by ID
  async getCredentialsById(req: Request, res: Response): Promise<void> {
    try {
      const credentials = await DoctorCredentials.findOne({ id: parseInt(req.params.id) });
      
      if (!credentials) {
        res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
        return;
      }

      const doctor = await Doctor.findOne({ id: credentials.doctorId });

      res.status(200).json({
        success: true,
        data: {
          id: credentials.id,
          doctorId: credentials.doctorId,
          doctorName: doctor?.name || 'Unknown Doctor',
          username: credentials.username,
          hasPassword: true
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get credentials by doctorId
  async getCredentialsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const credentials = await DoctorCredentials.findOne({ 
        doctorId: parseInt(req.params.doctorId) 
      });
      
      if (!credentials) {
        res.status(404).json({
          success: false,
          message: 'Credentials not found for this doctor'
        });
        return;
      }

      const doctor = await Doctor.findOne({ id: credentials.doctorId });

      res.status(200).json({
        success: true,
        data: {
          id: credentials.id,
          doctorId: credentials.doctorId,
          doctorName: doctor?.name || 'Unknown Doctor',
          username: credentials.username,
          hasPassword: true
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new credentials
  async createCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, username, password } = req.body;

      // Validate required fields
      if (!doctorId || !username || !password) {
        res.status(400).json({
          success: false,
          message: 'Doctor ID, username, and password are required'
        });
        return;
      }

      // Check if doctor exists
      const doctor = await Doctor.findOne({ id: doctorId });
      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      // Check if credentials already exist for this doctor
      const existingCredsByDoctor = await DoctorCredentials.findOne({ doctorId });
      if (existingCredsByDoctor) {
        res.status(400).json({
          success: false,
          message: 'Credentials already exist for this doctor'
        });
        return;
      }

      // Check if username already exists
      const existingCredsByUsername = await DoctorCredentials.findOne({ 
        username: username.toLowerCase() 
      });
      if (existingCredsByUsername) {
        res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
        return;
      }

      // Get next ID
      const lastCred = await DoctorCredentials.findOne().sort({ id: -1 });
      const newId = lastCred ? lastCred.id + 1 : 1;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create credentials
      const credentials = await DoctorCredentials.create({
        id: newId,
        doctorId,
        username: username.toLowerCase(),
        password: hashedPassword
      });

      res.status(201).json({
        success: true,
        message: 'Credentials created successfully',
        data: {
          id: credentials.id,
          doctorId: credentials.doctorId,
          doctorName: doctor.name,
          username: credentials.username,
          hasPassword: true
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update credentials
  async updateCredentials(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const credId = parseInt(req.params.id);

      const credentials = await DoctorCredentials.findOne({ id: credId });
      
      if (!credentials) {
        res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
        return;
      }

      // Update username if provided
      if (username && username !== credentials.username) {
        // Check if new username already exists
        const existingCreds = await DoctorCredentials.findOne({ 
          username: username.toLowerCase(),
          id: { $ne: credId }
        });
        
        if (existingCreds) {
          res.status(400).json({
            success: false,
            message: 'Username already exists'
          });
          return;
        }
        
        credentials.username = username.toLowerCase();
      }

      // Update password if provided
      if (password) {
        credentials.password = await bcrypt.hash(password, 10);
      }

      await credentials.save();

      const doctor = await Doctor.findOne({ id: credentials.doctorId });

      res.status(200).json({
        success: true,
        message: 'Credentials updated successfully',
        data: {
          id: credentials.id,
          doctorId: credentials.doctorId,
          doctorName: doctor?.name || 'Unknown Doctor',
          username: credentials.username,
          hasPassword: true
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete credentials
  async deleteCredentials(req: Request, res: Response): Promise<void> {
    try {
      const credentials = await DoctorCredentials.findOneAndDelete({ 
        id: parseInt(req.params.id) 
      });

      if (!credentials) {
        res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Credentials deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Verify login (for future use)
  async verifyLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
        return;
      }

      const credentials = await DoctorCredentials.findOne({ 
        username: username.toLowerCase() 
      });

      if (!credentials) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, credentials.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const doctor = await Doctor.findOne({ id: credentials.doctorId });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          doctorId: credentials.doctorId,
          doctorName: doctor?.name || 'Unknown Doctor',
          username: credentials.username
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying login',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Seed initial credentials for all doctors
  async seedCredentials(req: Request, res: Response): Promise<void> {
    try {
      // Clear existing credentials
      await DoctorCredentials.deleteMany({});

      // Get all doctors from database
      const doctors = await Doctor.find().sort({ id: 1 });

      if (doctors.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No doctors found. Please seed doctors first.'
        });
        return;
      }

      // Create credentials for each doctor
      // Format: username = dr.[firstname] (lowercase)
      // Password = Doctor@123 (you can change this)
      const credentialsData = doctors.map((doctor, index) => {
        const firstName = doctor.name.split(' ')[1] || doctor.name.split(' ')[0]; // Get first name
        const username = `dr.${firstName.toLowerCase()}`;
        
        return {
          id: index + 1,
          doctorId: doctor.id,
          username: username,
          password: 'Doctor@123' // Default password - will be hashed
        };
      });

      // Hash passwords and create credentials
      const credentialsToInsert = await Promise.all(
        credentialsData.map(async (cred) => ({
          ...cred,
          password: await bcrypt.hash(cred.password, 10)
        }))
      );

      const credentials = await DoctorCredentials.insertMany(credentialsToInsert);

      // Fetch doctor names for response
      const credentialsWithNames = await Promise.all(
        credentials.map(async (cred) => {
          const doctor = await Doctor.findOne({ id: cred.doctorId });
          return {
            id: cred.id,
            doctorId: cred.doctorId,
            doctorName: doctor?.name || 'Unknown',
            username: cred.username,
            defaultPassword: 'Doctor@123' // Show default password in response
          };
        })
      );

      res.status(201).json({
        success: true,
        message: 'Credentials seeded successfully',
        count: credentials.length,
        data: credentialsWithNames,
        note: 'Default password for all doctors is: Doctor@123'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error seeding credentials',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}