import { Request, Response } from 'express';
import Doctor from '../models/Doctor.model';

export class DoctorController {
  // Get all doctors
  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await Doctor.find().sort({ id: 1 });
      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single doctor by ID
  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await Doctor.findOne({ id: parseInt(req.params.id) });
      
      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get doctors by specialty
  async getDoctorsBySpecialty(req: Request, res: Response): Promise<void> {
    try {
      const { specialty } = req.params;
      const doctors = await Doctor.find({ 
        specialty: { $regex: new RegExp(specialty, 'i') } 
      }).sort({ id: 1 });
      
      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors by specialty',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get doctors by available day
  async getDoctorsByDay(req: Request, res: Response): Promise<void> {
    try {
      const { day } = req.params;
      const doctors = await Doctor.find({ 
        availableDays: { $regex: new RegExp(day, 'i') } 
      }).sort({ id: 1 });
      
      res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching doctors by day',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new doctor
  async createDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await Doctor.create(req.body);
      res.status(201).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating doctor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update doctor
  async updateDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await Doctor.findOneAndUpdate(
        { id: parseInt(req.params.id) },
        req.body,
        { new: true, runValidators: true }
      );

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doctor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating doctor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete doctor
  async deleteDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await Doctor.findOneAndDelete({ id: parseInt(req.params.id) });

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting doctor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Seed initial data
  async seedDoctors(req: Request, res: Response): Promise<void> {
    try {
      // Clear existing data
      await Doctor.deleteMany({});
  
      // Initial data with time slots
      const initialDoctors = [
        {
          id: 1,
          name: 'Dr. Sarah Haider',
          specialty: 'Cardiologist',
          experience: '15 years',
          education: 'MD, Harvard Medical School',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          timeSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
            { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' }
          ],
          shortBio: 'Specialist in cardiovascular diseases with extensive experience in heart surgery.',
          consultationFee: 'Rs. 200'
        },
        {
          id: 2,
          name: 'Dr. Mustafa Hassan',
          specialty: 'Neurologist',
          experience: '12 years',
          education: 'MD, Johns Hopkins University',
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Tuesday', 'Thursday', 'Saturday'],
          timeSlots: [
            { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
          ],
          shortBio: 'Expert in treating neurological disorders and brain-related conditions.',
          consultationFee: 'Rs. 180'
        },
        {
          id: 3,
          name: 'Dr. Eman Aslam',
          specialty: 'Pediatrician',
          experience: '10 years',
          education: 'MD, Stanford University',
          image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Monday', 'Tuesday', 'Thursday'],
          timeSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' }
          ],
          shortBio: 'Dedicated to providing comprehensive healthcare for children and adolescents.',
          consultationFee: 'Rs. 150'
        },
        {
          id: 4,
          name: 'Dr. Ahmed Raza',
          specialty: 'Orthopedic Surgeon',
          experience: '18 years',
          education: 'MD, Mayo Clinic',
          image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Wednesday', 'Friday', 'Saturday'],
          timeSlots: [
            { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
            { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' },
            { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
          ],
          shortBio: 'Specializes in joint replacement and sports medicine injuries.',
          consultationFee: 'Rs. 220'
        },
        {
          id: 5,
          name: 'Dr. Aslam Qureshi',
          specialty: 'Dermatologist',
          experience: '8 years',
          education: 'MD, UCLA Medical School',
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Monday', 'Wednesday', 'Friday'],
          timeSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Monday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Wednesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Wednesday', startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' },
            { day: 'Friday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Friday', startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' }
          ],
          shortBio: 'Expert in skin conditions, cosmetic procedures, and dermatological surgery.',
          consultationFee: 'Rs. 160'
        },
        {
          id: 6,
          name: 'Dr. Dawood Khan',
          specialty: 'General Surgeon',
          experience: '14 years',
          education: 'MD, Yale Medical School',
          image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
          availableDays: ['Tuesday', 'Thursday', 'Saturday'],
          timeSlots: [
            { day: 'Tuesday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Tuesday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Thursday', startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
            { day: 'Thursday', startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' },
            { day: 'Saturday', startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
          ],
          shortBio: 'Skilled in minimally invasive surgical techniques and emergency procedures.',
          consultationFee: 'Rs. 190'
        }
      ];
  
      const doctors = await Doctor.insertMany(initialDoctors);
  
      res.status(201).json({
        success: true,
        message: 'Doctors seeded successfully',
        count: doctors.length,
        data: doctors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error seeding doctors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}