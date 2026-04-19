"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthTest_controller_1 = require("../controllers/healthTest.controller");
const router = (0, express_1.Router)();
const healthTestController = new healthTest_controller_1.HealthTestController();
// Seed route (run once to populate database)
router.post('/seed', healthTestController.seedTests.bind(healthTestController));
// CRUD routes
router.get('/', healthTestController.getAllTests.bind(healthTestController));
router.get('/:id', healthTestController.getTestById.bind(healthTestController));
router.get('/department/:department', healthTestController.getTestsByDepartment.bind(healthTestController));
router.post('/', healthTestController.createTest.bind(healthTestController));
router.put('/:id', healthTestController.updateTest.bind(healthTestController));
router.delete('/:id', healthTestController.deleteTest.bind(healthTestController));
exports.default = router;
