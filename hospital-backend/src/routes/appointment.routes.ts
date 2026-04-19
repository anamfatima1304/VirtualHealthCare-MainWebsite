import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

const router = Router();
const appointmentController = new AppointmentController();

// ── 0. Get all appointments (Admin Analytics) ────────────────────────────────
router.get('/all', appointmentController.getAllAppointments.bind(appointmentController));

// ── 1. Seed dummy data ───────────────────────────────────────────────────────
router.post('/seed', appointmentController.seedAppointments.bind(appointmentController));

// ── 2. Get appointments by doctor ────────────────────────────────────────────
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctorId.bind(appointmentController));

// ── 3. Update appointment status ─────────────────────────────────────────────
router.put('/:id/status', appointmentController.updateStatus.bind(appointmentController));

// ── 4. Filter appointments (booking usage) ───────────────────────────────────
// GET /api/appointments?doctorId=...&date=...&patientName=...
router.get('/', appointmentController.getAppointments.bind(appointmentController));

// ── 5. Create new appointment ────────────────────────────────────────────────
router.post('/', appointmentController.createAppointment.bind(appointmentController));

// ── 6. Cancel appointment ────────────────────────────────────────────────────
router.patch('/:id', appointmentController.cancelById.bind(appointmentController));

// ── 7. Reschedule appointment ────────────────────────────────────────────────
router.put('/:id', appointmentController.rescheduleById.bind(appointmentController));

export default router;