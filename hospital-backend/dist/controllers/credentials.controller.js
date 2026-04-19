"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const DoctorCredentials_model_1 = __importDefault(require("../models/DoctorCredentials.model"));
const Doctor_model_1 = __importDefault(require("../models/Doctor.model"));
class CredentialsController {
    // Get all credentials with doctor names
    async getAllCredentials(req, res) {
        try {
            const credentials = await DoctorCredentials_model_1.default.find().sort({ id: 1 });
            const credentialsWithNames = await Promise.all(credentials.map(async (cred) => {
                const doctor = await Doctor_model_1.default.findOne({ id: cred.doctorId });
                return {
                    id: cred.id,
                    doctorId: cred.doctorId,
                    doctorName: doctor?.name || 'Unknown Doctor',
                    username: cred.username,
                    email: cred.email, // ✅ NEW
                    hasPassword: true,
                    createdAt: cred.createdAt,
                    updatedAt: cred.updatedAt
                };
            }));
            res.status(200).json({
                success: true,
                count: credentialsWithNames.length,
                data: credentialsWithNames
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get credentials by ID
    async getCredentialsById(req, res) {
        try {
            const credentials = await DoctorCredentials_model_1.default.findOne({ id: parseInt(req.params.id) });
            if (!credentials) {
                res.status(404).json({
                    success: false,
                    message: 'Credentials not found'
                });
                return;
            }
            const doctor = await Doctor_model_1.default.findOne({ id: credentials.doctorId });
            res.status(200).json({
                success: true,
                data: {
                    id: credentials.id,
                    doctorId: credentials.doctorId,
                    doctorName: doctor?.name || 'Unknown Doctor',
                    username: credentials.username,
                    email: credentials.email, // ✅ NEW
                    hasPassword: true
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get credentials by doctorId
    async getCredentialsByDoctorId(req, res) {
        try {
            const credentials = await DoctorCredentials_model_1.default.findOne({
                doctorId: parseInt(req.params.doctorId)
            });
            if (!credentials) {
                res.status(404).json({
                    success: false,
                    message: 'Credentials not found for this doctor'
                });
                return;
            }
            const doctor = await Doctor_model_1.default.findOne({ id: credentials.doctorId });
            res.status(200).json({
                success: true,
                data: {
                    id: credentials.id,
                    doctorId: credentials.doctorId,
                    doctorName: doctor?.name || 'Unknown Doctor',
                    username: credentials.username,
                    email: credentials.email, // ✅ NEW
                    hasPassword: true
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new credentials
    async createCredentials(req, res) {
        try {
            const { doctorId, username, password, email } = req.body; // ✅ added email
            // Validate required fields
            if (!doctorId || !username || !password || !email) { // ✅ validate email
                res.status(400).json({
                    success: false,
                    message: 'Doctor ID, username, password, and email are required'
                });
                return;
            }
            // Check if doctor exists
            const doctor = await Doctor_model_1.default.findOne({ id: doctorId });
            if (!doctor) {
                res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
                return;
            }
            // Check if credentials already exist for this doctor
            const existingCredsByDoctor = await DoctorCredentials_model_1.default.findOne({ doctorId });
            if (existingCredsByDoctor) {
                res.status(400).json({
                    success: false,
                    message: 'Credentials already exist for this doctor'
                });
                return;
            }
            // Check if username already exists
            const existingCredsByUsername = await DoctorCredentials_model_1.default.findOne({
                username: username.toLowerCase()
            });
            if (existingCredsByUsername) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
            // ✅ Check if email already exists
            const existingCredsByEmail = await DoctorCredentials_model_1.default.findOne({
                email: email.toLowerCase()
            });
            if (existingCredsByEmail) {
                res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
                return;
            }
            // Get next ID
            const lastCred = await DoctorCredentials_model_1.default.findOne().sort({ id: -1 });
            const newId = lastCred ? lastCred.id + 1 : 1;
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create credentials
            const credentials = await DoctorCredentials_model_1.default.create({
                id: newId,
                doctorId,
                username: username.toLowerCase(),
                password: hashedPassword,
                email: email.toLowerCase() // ✅ NEW
            });
            res.status(201).json({
                success: true,
                message: 'Credentials created successfully',
                data: {
                    id: credentials.id,
                    doctorId: credentials.doctorId,
                    doctorName: doctor.name,
                    username: credentials.username,
                    email: credentials.email, // ✅ NEW
                    hasPassword: true
                }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update credentials
    async updateCredentials(req, res) {
        try {
            const { username, password, email } = req.body; // ✅ added email
            const credId = parseInt(req.params.id);
            const credentials = await DoctorCredentials_model_1.default.findOne({ id: credId });
            if (!credentials) {
                res.status(404).json({
                    success: false,
                    message: 'Credentials not found'
                });
                return;
            }
            // Update username if provided
            if (username && username !== credentials.username) {
                const existingCreds = await DoctorCredentials_model_1.default.findOne({
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
                credentials.password = await bcrypt_1.default.hash(password, 10);
            }
            // ✅ Update email if provided
            if (email && email.toLowerCase() !== credentials.email) {
                const existingEmail = await DoctorCredentials_model_1.default.findOne({
                    email: email.toLowerCase(),
                    id: { $ne: credId }
                });
                if (existingEmail) {
                    res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                    return;
                }
                credentials.email = email.toLowerCase();
            }
            await credentials.save();
            const doctor = await Doctor_model_1.default.findOne({ id: credentials.doctorId });
            res.status(200).json({
                success: true,
                message: 'Credentials updated successfully',
                data: {
                    id: credentials.id,
                    doctorId: credentials.doctorId,
                    doctorName: doctor?.name || 'Unknown Doctor',
                    username: credentials.username,
                    email: credentials.email, // ✅ NEW
                    hasPassword: true
                }
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete credentials
    async deleteCredentials(req, res) {
        try {
            const credentials = await DoctorCredentials_model_1.default.findOneAndDelete({
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Verify login
    async verifyLogin(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
                return;
            }
            const credentials = await DoctorCredentials_model_1.default.findOne({
                username: username.toLowerCase()
            });
            if (!credentials) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, credentials.password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            const doctor = await Doctor_model_1.default.findOne({ id: credentials.doctorId });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    doctorId: credentials.doctorId,
                    doctorName: doctor?.name || 'Unknown Doctor',
                    username: credentials.username,
                    email: credentials.email // ✅ NEW
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error verifying login',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Seed initial credentials for all doctors
    async seedCredentials(req, res) {
        try {
            await DoctorCredentials_model_1.default.deleteMany({});
            const doctors = await Doctor_model_1.default.find().sort({ id: 1 });
            if (doctors.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No doctors found. Please seed doctors first.'
                });
                return;
            }
            const credentialsData = doctors.map((doctor, index) => {
                const firstName = doctor.name.split(' ')[1] || doctor.name.split(' ')[0];
                const username = `dr.${firstName.toLowerCase()}`;
                const email = `${username}@hospital.com`; // ✅ auto-generate email for seeding
                return {
                    id: index + 1,
                    doctorId: doctor.id,
                    username,
                    password: 'Doctor@123',
                    email // ✅ NEW
                };
            });
            const credentialsToInsert = await Promise.all(credentialsData.map(async (cred) => ({
                ...cred,
                password: await bcrypt_1.default.hash(cred.password, 10)
            })));
            const credentials = await DoctorCredentials_model_1.default.insertMany(credentialsToInsert);
            const credentialsWithNames = await Promise.all(credentials.map(async (cred) => {
                const doctor = await Doctor_model_1.default.findOne({ id: cred.doctorId });
                return {
                    id: cred.id,
                    doctorId: cred.doctorId,
                    doctorName: doctor?.name || 'Unknown',
                    username: cred.username,
                    email: cred.email, // ✅ NEW
                    defaultPassword: 'Doctor@123'
                };
            }));
            res.status(201).json({
                success: true,
                message: 'Credentials seeded successfully',
                count: credentials.length,
                data: credentialsWithNames,
                note: 'Default password for all doctors is: Doctor@123'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error seeding credentials',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.CredentialsController = CredentialsController;
