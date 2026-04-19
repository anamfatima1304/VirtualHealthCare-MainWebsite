"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Feedback_controller_1 = require("../controllers/Feedback.controller");
const router = express_1.default.Router();
const feedbackController = new Feedback_controller_1.FeedbackController();
// GET - Get all feedback
router.get('/', feedbackController.getAllFeedback.bind(feedbackController));
// GET - Get feedback by ID
router.get('/:id', feedbackController.getFeedbackById.bind(feedbackController));
// POST - Create new feedback
router.post('/', feedbackController.createFeedback.bind(feedbackController));
// PUT - Update feedback
router.put('/:id', feedbackController.updateFeedback.bind(feedbackController));
// DELETE - Delete feedback
router.delete('/:id', feedbackController.deleteFeedback.bind(feedbackController));
// POST - Seed feedback data
router.post('/seed/data', feedbackController.seedFeedback.bind(feedbackController));
exports.default = router;
