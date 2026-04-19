"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const router = (0, express_1.Router)();
const departmentController = new department_controller_1.DepartmentController();
// Seed route (run once to populate database)
router.post('/seed', departmentController.seedDepartments.bind(departmentController));
// CRUD routes
router.get('/', departmentController.getAllDepartments.bind(departmentController));
router.get('/:id', departmentController.getDepartmentById.bind(departmentController));
router.post('/', departmentController.createDepartment.bind(departmentController));
router.put('/:id', departmentController.updateDepartment.bind(departmentController));
router.delete('/:id', departmentController.deleteDepartment.bind(departmentController));
exports.default = router;
