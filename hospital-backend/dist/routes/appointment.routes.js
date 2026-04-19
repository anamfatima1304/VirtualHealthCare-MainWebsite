"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
const appointmentController = new appointment_controller_1.AppointmentController();
// 1. Seed route: Run this once via Postman/Browser to create the collection and dummy data
router.post('/seed', appointmentController.seedAppointments.bind(appointmentController));
// 2. Fetch appointments: Used by the Doctor Dashboard to show their specific list
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctorId.bind(appointmentController));
// 3. Update Status: Used when the doctor clicks Confirm, Complete, or Cancel
// This matches the updateStatus method in your AppointmentController
router.put('/:id/status', appointmentController.updateStatus.bind(appointmentController));
exports.default = router;
