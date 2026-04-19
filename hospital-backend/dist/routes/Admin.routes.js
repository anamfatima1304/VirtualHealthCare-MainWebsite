"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Admin_controller_1 = require("../controllers/Admin.controller");
const router = express_1.default.Router();
const adminController = new Admin_controller_1.AdminController();
// GET - Get all admins
router.get('/', adminController.getAllAdmins.bind(adminController));
// GET - Get admin by ID
router.get('/:id', adminController.getAdminById.bind(adminController));
// GET - Get admin by email
router.get('/email/:email', adminController.getAdminByEmail.bind(adminController));
// POST - Create new admin
router.post('/', adminController.createAdmin.bind(adminController));
// POST - Login admin
router.post('/login', adminController.loginAdmin.bind(adminController));
// PUT - Update admin
router.put('/:id', adminController.updateAdmin.bind(adminController));
// DELETE - Delete admin
router.delete('/:id', adminController.deleteAdmin.bind(adminController));
// POST - Seed admin data
router.post('/seed/data', adminController.seedAdmin.bind(adminController));
// GET - Get analytics data
router.get('/analytics/data', adminController.getAnalytics.bind(adminController));
// GET - Get dashboard summary
router.get('/dashboard/summary', adminController.getDashboardSummary.bind(adminController));
exports.default = router;
