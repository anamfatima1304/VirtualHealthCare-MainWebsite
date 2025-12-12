import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';

const router = Router();
const departmentController = new DepartmentController();

// Seed route (run once to populate database)
router.post('/seed', departmentController.seedDepartments.bind(departmentController));

// CRUD routes
router.get('/', departmentController.getAllDepartments.bind(departmentController));
router.get('/:id', departmentController.getDepartmentById.bind(departmentController));
router.post('/', departmentController.createDepartment.bind(departmentController));
router.put('/:id', departmentController.updateDepartment.bind(departmentController));
router.delete('/:id', departmentController.deleteDepartment.bind(departmentController));

export default router;