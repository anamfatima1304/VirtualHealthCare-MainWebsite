"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const Doctor_model_1 = __importDefault(require("../models/Doctor.model"));
const Patient_model_1 = __importDefault(require("../models/Patient.model"));
const Feedback_model_1 = __importDefault(require("../models/Feedback.model"));
const HealthTest_model_1 = __importDefault(require("../models/HealthTest.model"));
const Department_model_1 = __importDefault(require("../models/Department.model"));
class AdminController {
    // Get all admins
    async getAllAdmins(req, res) {
        try {
            const admins = await Admin_model_1.default.find().select('-password').sort({ id: 1 });
            res.status(200).json({
                success: true,
                count: admins.length,
                data: admins
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching admins',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get single admin by ID
    async getAdminById(req, res) {
        try {
            const admin = await Admin_model_1.default.findOne({ id: parseInt(req.params.id) }).select('-password');
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get admin by email
    async getAdminByEmail(req, res) {
        try {
            const { email } = req.params;
            const admin = await Admin_model_1.default.findOne({ email }).select('-password');
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new admin
    async createAdmin(req, res) {
        try {
            // Check if email already exists
            const existingAdmin = await Admin_model_1.default.findOne({ email: req.body.email });
            if (existingAdmin) {
                res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
                return;
            }
            // Get the highest ID and increment
            const lastAdmin = await Admin_model_1.default.findOne().sort({ id: -1 });
            const newId = lastAdmin ? lastAdmin.id + 1 : 1;
            const adminData = {
                ...req.body,
                id: newId
            };
            const newAdmin = new Admin_model_1.default(adminData);
            await newAdmin.save();
            // Remove password from response
            const { password, ...adminResponse } = newAdmin.toObject();
            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                data: adminResponse
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update admin
    async updateAdmin(req, res) {
        try {
            // If password is being updated, it will be hashed by the pre-save middleware
            const admin = await Admin_model_1.default.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true, runValidators: true }).select('-password');
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete admin
    async deleteAdmin(req, res) {
        try {
            const admin = await Admin_model_1.default.findOneAndDelete({ id: parseInt(req.params.id) });
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Login admin
    async loginAdmin(req, res) {
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
            const admin = await Admin_model_1.default.findOne({ email });
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error logging in',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Seed initial admin data
    async seedAdmin(req, res) {
        try {
            // Clear existing data
            await Admin_model_1.default.deleteMany({});
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
            const newAdmin = new Admin_model_1.default(adminData);
            await newAdmin.save();
            // Remove password from response using destructuring
            const { password, ...adminResponse } = newAdmin.toObject();
            res.status(201).json({
                success: true,
                message: 'Admin seeded successfully',
                data: adminResponse
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error seeding admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get analytics data
    async getAnalytics(req, res) {
        try {
            // Get total counts
            const [totalPatients, totalDoctors, totalAppointments, totalFeedback, totalHealthTests, totalDepartments] = await Promise.all([
                Patient_model_1.default.countDocuments(),
                Doctor_model_1.default.countDocuments(),
                appointment_model_1.default.countDocuments(),
                Feedback_model_1.default.countDocuments(),
                HealthTest_model_1.default.countDocuments(),
                Department_model_1.default.countDocuments()
            ]);
            // Get appointment status distribution
            const appointmentStatusStats = await appointment_model_1.default.aggregate([
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
            const monthlyAppointments = await appointment_model_1.default.aggregate([
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
            const departmentAppointments = await appointment_model_1.default.aggregate([
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
            const recentFeedback = await Feedback_model_1.default.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('name message createdAt');
            // Get health test statistics
            const healthTestStats = await HealthTest_model_1.default.aggregate([
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching analytics data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get dashboard summary (quick stats for dashboard)
    async getDashboardSummary(req, res) {
        try {
            const [totalPatients, totalDoctors, totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
                Patient_model_1.default.countDocuments(),
                Doctor_model_1.default.countDocuments(),
                appointment_model_1.default.countDocuments(),
                appointment_model_1.default.countDocuments({ status: 'pending' }),
                appointment_model_1.default.countDocuments({ status: 'Completed' })
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard summary',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.AdminController = AdminController;
