import { Request, Response } from 'express';
import HealthTest from '../models/HealthTest.model';

export class HealthTestController {
  // Get all health tests
  async getAllTests(req: Request, res: Response): Promise<void> {
    try {
      const tests = await HealthTest.find().sort({ id: 1 });
      res.status(200).json({
        success: true,
        count: tests.length,
        data: tests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching health tests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get single test by ID
  async getTestById(req: Request, res: Response): Promise<void> {
    try {
      const test = await HealthTest.findOne({ id: parseInt(req.params.id) });
      
      if (!test) {
        res.status(404).json({
          success: false,
          message: 'Health test not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: test
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching health test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get tests by department
  async getTestsByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { department } = req.params;
      const tests = await HealthTest.find({ 
        department: { $regex: new RegExp(department, 'i') } 
      }).sort({ id: 1 });
      
      res.status(200).json({
        success: true,
        count: tests.length,
        data: tests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tests by department',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new test
  async createTest(req: Request, res: Response): Promise<void> {
    try {
      const test = await HealthTest.create(req.body);
      res.status(201).json({
        success: true,
        data: test
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating health test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update test
  async updateTest(req: Request, res: Response): Promise<void> {
    try {
      const test = await HealthTest.findOneAndUpdate(
        { id: parseInt(req.params.id) },
        req.body,
        { new: true, runValidators: true }
      );

      if (!test) {
        res.status(404).json({
          success: false,
          message: 'Health test not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: test
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating health test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete test
  async deleteTest(req: Request, res: Response): Promise<void> {
    try {
      const test = await HealthTest.findOneAndDelete({ id: parseInt(req.params.id) });

      if (!test) {
        res.status(404).json({
          success: false,
          message: 'Health test not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Health test deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting health test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Seed initial data
  async seedTests(req: Request, res: Response): Promise<void> {
    try {
      // Clear existing data
      await HealthTest.deleteMany({});

      // Initial data from your Angular service
      const initialTests = [
        {
          id: 1,
          name: 'Complete Blood Count (CBC)',
          price: 25,
          department: 'Hematology',
          availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
        },
        {
          id: 2,
          name: 'Chest X-Ray',
          price: 80,
          department: 'Radiology',
          availableTimeSlots: ['Morning 9-12 PM', 'Evening 3-6 PM']
        },
        {
          id: 3,
          name: 'Lipid Profile',
          price: 35,
          department: 'Biochemistry',
          availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 1-4 PM', 'Evening 5-7 PM']
        },
        {
          id: 4,
          name: 'ECG (Electrocardiogram)',
          price: 45,
          department: 'Cardiology',
          availableTimeSlots: ['Morning 9-12 PM', 'Afternoon 2-5 PM']
        },
        {
          id: 5,
          name: 'Thyroid Function Test',
          price: 55,
          department: 'Endocrinology',
          availableTimeSlots: ['Morning 8-10 AM', 'Late Morning 10-12 PM']
        },
        {
          id: 6,
          name: 'Ultrasound Abdomen',
          price: 120,
          department: 'Radiology',
          availableTimeSlots: ['Morning 10-12 PM', 'Afternoon 2-4 PM', 'Evening 4-6 PM']
        },
        {
          id: 7,
          name: 'Blood Sugar Test',
          price: 15,
          department: 'Biochemistry',
          availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
        },
        {
          id: 8,
          name: 'Urine Analysis',
          price: 20,
          department: 'Pathology',
          availableTimeSlots: ['Morning 8-12 PM', 'Afternoon 1-5 PM']
        }
      ];

      const tests = await HealthTest.insertMany(initialTests);

      res.status(201).json({
        success: true,
        message: 'Health tests seeded successfully',
        count: tests.length,
        data: tests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error seeding health tests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}