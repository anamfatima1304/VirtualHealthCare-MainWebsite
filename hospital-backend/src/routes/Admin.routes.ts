import express from 'express';
import { AdminController } from '../controllers/Admin.controller';

const router = express.Router();
const adminController = new AdminController();

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

export default router;