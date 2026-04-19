"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const healthTest_routes_1 = __importDefault(require("./routes/healthTest.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const credentials_routes_1 = __importDefault(require("./routes/credentials.routes"));
const Feedback_routes_1 = __importDefault(require("./routes/Feedback.routes"));
const Admin_routes_1 = __importDefault(require("./routes/Admin.routes"));
// NEW: Import the appointment routes
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/departments', department_routes_1.default);
app.use('/api/health-tests', healthTest_routes_1.default);
app.use('/api/doctors', doctor_routes_1.default);
app.use('/api/feedback', Feedback_routes_1.default);
app.use('/api/admins', Admin_routes_1.default);
app.use('/api/credentials', credentials_routes_1.default);
// NEW: Register the appointment routes
app.use('/api/appointments', appointment_routes_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});
// Connect to database and start server
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Departments API: http://localhost:${PORT}/api/departments`);
            // NEW: Log the appointments API URL
            console.log(`Appointments API: http://localhost:${PORT}/api/appointments`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
