"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthTestController = void 0;
const HealthTest_model_1 = __importDefault(require("../models/HealthTest.model"));
class HealthTestController {
    // Get all health tests
    async getAllTests(req, res) {
        try {
            const tests = await HealthTest_model_1.default.find().sort({ id: 1 });
            res.status(200).json({
                success: true,
                count: tests.length,
                data: tests
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching health tests',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get single test by ID
    async getTestById(req, res) {
        try {
            const test = await HealthTest_model_1.default.findOne({ id: parseInt(req.params.id) });
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching health test',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get tests by department
    async getTestsByDepartment(req, res) {
        try {
            const { department } = req.params;
            const tests = await HealthTest_model_1.default.find({
                department: { $regex: new RegExp(department, 'i') }
            }).sort({ id: 1 });
            res.status(200).json({
                success: true,
                count: tests.length,
                data: tests
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching tests by department',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new test
    async createTest(req, res) {
        try {
            const test = await HealthTest_model_1.default.create(req.body);
            res.status(201).json({
                success: true,
                data: test
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating health test',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update test
    async updateTest(req, res) {
        try {
            const test = await HealthTest_model_1.default.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true, runValidators: true });
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating health test',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete test
    async deleteTest(req, res) {
        try {
            const test = await HealthTest_model_1.default.findOneAndDelete({ id: parseInt(req.params.id) });
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting health test',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Seed initial data
    async seedTests(req, res) {
        try {
            // Clear existing data
            await HealthTest_model_1.default.deleteMany({});
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
            const tests = await HealthTest_model_1.default.insertMany(initialTests);
            res.status(201).json({
                success: true,
                message: 'Health tests seeded successfully',
                count: tests.length,
                data: tests
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error seeding health tests',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.HealthTestController = HealthTestController;
