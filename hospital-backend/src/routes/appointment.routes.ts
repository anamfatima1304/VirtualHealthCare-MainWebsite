import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

const router = Router();
const appointmentController = new AppointmentController();

// 1. Seed route: Run this once via Postman/Browser to create the collection and dummy data
router.post('/seed', appointmentController.seedAppointments.bind(appointmentController));

// 2. Fetch appointments: Used by the Doctor Dashboard to show their specific list
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctorId.bind(appointmentController));

// 3. Update Status: Used when the doctor clicks Confirm, Complete, or Cancel
// This matches the updateStatus method in your AppointmentController
router.put('/:id/status', appointmentController.updateStatus.bind(appointmentController));

// GET /api/appointments?doctorId=...&date=...
router.get('/', appointmentController.getAppointments.bind(appointmentController));

// POST /api/appointments
router.post('/', appointmentController.createAppointment.bind(appointmentController));

router.patch('/:id', appointmentController.cancelById.bind(appointmentController));
router.put('/:id', appointmentController.rescheduleById.bind(appointmentController));

export default router;
