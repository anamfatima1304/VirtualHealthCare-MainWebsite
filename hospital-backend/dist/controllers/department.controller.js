"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const Department_model_1 = __importDefault(require("../models/Department.model"));
class DepartmentController {
    // Get all departments
    async getAllDepartments(req, res) {
        try {
            const departments = await Department_model_1.default.find().sort({ id: 1 });
            res.status(200).json({
                success: true,
                count: departments.length,
                data: departments
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching departments',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get single department by ID
    async getDepartmentById(req, res) {
        try {
            const department = await Department_model_1.default.findOne({ id: parseInt(req.params.id) });
            if (!department) {
                res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: department
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching department',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new department
    async createDepartment(req, res) {
        try {
            const department = await Department_model_1.default.create(req.body);
            res.status(201).json({
                success: true,
                data: department
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating department',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update department
    async updateDepartment(req, res) {
        try {
            const department = await Department_model_1.default.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true, runValidators: true });
            if (!department) {
                res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: department
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating department',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete department
    async deleteDepartment(req, res) {
        try {
            const department = await Department_model_1.default.findOneAndDelete({ id: parseInt(req.params.id) });
            if (!department) {
                res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Department deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting department',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Seed initial data
    async seedDepartments(req, res) {
        try {
            // Clear existing data
            await Department_model_1.default.deleteMany({});
            // Initial data from your Angular service
            const initialDepartments = [
                {
                    id: 1,
                    name: 'Cardiologist',
                    description: 'Comprehensive heart care services including diagnosis, treatment, and prevention of cardiovascular diseases with state-of-the-art technology.',
                    icon: 'fas fa-heartbeat',
                    services: ['ECG', 'Echocardiography', 'Cardiac Catheterization', 'Heart Surgery', 'Pacemaker Implantation'],
                    specialists: 1
                },
                {
                    id: 2,
                    name: 'Neurologist',
                    description: 'Advanced neurological care for brain, spine, and nervous system disorders with cutting-edge diagnostic and treatment facilities.',
                    icon: 'fas fa-brain',
                    services: ['MRI Scans', 'EEG', 'Stroke Treatment', 'Epilepsy Care', 'Brain Surgery'],
                    specialists: 1
                },
                {
                    id: 3,
                    name: 'Pediatrician',
                    description: 'Dedicated healthcare for children from newborns to adolescents, providing comprehensive medical care in a child-friendly environment.',
                    icon: 'fas fa-baby',
                    services: ['Vaccinations', 'Growth Monitoring', 'Pediatric Surgery', 'NICU', 'Child Psychology'],
                    specialists: 1
                },
                {
                    id: 4,
                    name: 'Orthopedic Surgeon',
                    description: 'Complete bone, joint, and muscle care including sports medicine, joint replacement, and trauma surgery with rehabilitation services.',
                    icon: 'fas fa-bone',
                    services: ['Joint Replacement', 'Sports Medicine', 'Trauma Surgery', 'Physiotherapy', 'Arthroscopy'],
                    specialists: 1
                },
                {
                    id: 5,
                    name: 'Dermatologist',
                    description: 'Comprehensive skin care services including medical, surgical, and cosmetic dermatology with advanced laser treatments.',
                    icon: 'fas fa-hand-paper',
                    services: ['Skin Cancer Treatment', 'Cosmetic Procedures', 'Laser Therapy', 'Acne Treatment', 'Dermatologic Surgery'],
                    specialists: 1
                },
                {
                    id: 6,
                    name: 'General Surgeon',
                    description: 'Expert surgical care including minimally invasive procedures, emergency surgeries, and comprehensive operative management.',
                    icon: 'fas fa-user-md',
                    services: ['Appendectomy', 'Gallbladder Surgery', 'Hernia Repair', 'Emergency Surgery', 'Minimally Invasive Surgery'],
                    specialists: 1
                }
            ];
            const departments = await Department_model_1.default.insertMany(initialDepartments);
            res.status(201).json({
                success: true,
                message: 'Departments seeded successfully',
                count: departments.length,
                data: departments
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error seeding departments',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.DepartmentController = DepartmentController;
