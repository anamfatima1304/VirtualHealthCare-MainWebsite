import express from 'express';
import { FeedbackController } from '../controllers/Feedback.controller';

const router = express.Router();
const feedbackController = new FeedbackController();

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

export default router;