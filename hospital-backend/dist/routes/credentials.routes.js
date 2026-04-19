"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const credentials_controller_1 = require("../controllers/credentials.controller");
const router = (0, express_1.Router)();
const credentialsController = new credentials_controller_1.CredentialsController();
// Seed route (run once to populate credentials)
router.post('/seed', credentialsController.seedCredentials.bind(credentialsController));
// CRUD routes
router.get('/', credentialsController.getAllCredentials.bind(credentialsController));
router.get('/:id', credentialsController.getCredentialsById.bind(credentialsController));
router.get('/doctor/:doctorId', credentialsController.getCredentialsByDoctorId.bind(credentialsController));
router.post('/', credentialsController.createCredentials.bind(credentialsController));
router.put('/:id', credentialsController.updateCredentials.bind(credentialsController));
router.delete('/:id', credentialsController.deleteCredentials.bind(credentialsController));
// Login verification route (for future use)
router.post('/verify-login', credentialsController.verifyLogin.bind(credentialsController));
exports.default = router;
