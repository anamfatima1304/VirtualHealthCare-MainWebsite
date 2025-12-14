import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';

const router = Router();
const doctorController = new DoctorController();

// Seed route (run once to populate database)
router.post('/seed', doctorController.seedDoctors.bind(doctorController));

// CRUD routes
router.get('/', doctorController.getAllDoctors.bind(doctorController));
router.get('/:id', doctorController.getDoctorById.bind(doctorController));
router.get('/specialty/:specialty', doctorController.getDoctorsBySpecialty.bind(doctorController));
router.get('/day/:day', doctorController.getDoctorsByDay.bind(doctorController));
router.post('/', doctorController.createDoctor.bind(doctorController));
router.put('/:id', doctorController.updateDoctor.bind(doctorController));
router.delete('/:id', doctorController.deleteDoctor.bind(doctorController));

export default router;