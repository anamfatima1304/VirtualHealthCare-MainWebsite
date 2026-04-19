"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctor_controller_1 = require("../controllers/doctor.controller");
const router = (0, express_1.Router)();
const doctorController = new doctor_controller_1.DoctorController();
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
exports.default = router;
