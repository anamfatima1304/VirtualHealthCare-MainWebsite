import { Router } from 'express';
import { HealthTestController } from '../controllers/healthTest.controller';

const router = Router();
const healthTestController = new HealthTestController();

// Seed route (run once to populate database)
router.post('/seed', healthTestController.seedTests.bind(healthTestController));

// CRUD routes
router.get('/', healthTestController.getAllTests.bind(healthTestController));
router.get('/:id', healthTestController.getTestById.bind(healthTestController));
router.get('/department/:department', healthTestController.getTestsByDepartment.bind(healthTestController));
router.post('/', healthTestController.createTest.bind(healthTestController));
router.put('/:id', healthTestController.updateTest.bind(healthTestController));
router.delete('/:id', healthTestController.deleteTest.bind(healthTestController));

export default router;