"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackController = void 0;
const Feedback_model_1 = __importDefault(require("../models/Feedback.model"));
class FeedbackController {
    // Get all feedback
    async getAllFeedback(req, res) {
        try {
            const feedback = await Feedback_model_1.default.find().sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                count: feedback.length,
                data: feedback
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get single feedback by ID
    async getFeedbackById(req, res) {
        try {
            const feedback = await Feedback_model_1.default.findOne({ id: parseInt(req.params.id) });
            if (!feedback) {
                res.status(404).json({
                    success: false,
                    message: 'Feedback not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: feedback
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new feedback
    async createFeedback(req, res) {
        try {
            // Get the highest ID and increment
            const lastFeedback = await Feedback_model_1.default.findOne().sort({ id: -1 });
            const newId = lastFeedback ? lastFeedback.id + 1 : 1;
            const feedbackData = {
                ...req.body,
                id: newId
            };
            const feedback = await Feedback_model_1.default.create(feedbackData);
            res.status(201).json({
                success: true,
                message: 'Feedback submitted successfully',
                data: feedback
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error creating feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update feedback
    async updateFeedback(req, res) {
        try {
            const feedback = await Feedback_model_1.default.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true, runValidators: true });
            if (!feedback) {
                res.status(404).json({
                    success: false,
                    message: 'Feedback not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Feedback updated',
                data: feedback
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error updating feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete feedback
    async deleteFeedback(req, res) {
        try {
            const feedback = await Feedback_model_1.default.findOneAndDelete({ id: parseInt(req.params.id) });
            if (!feedback) {
                res.status(404).json({
                    success: false,
                    message: 'Feedback not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Feedback deleted successfully'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Seed initial demo data
    async seedFeedback(req, res) {
        try {
            // Clear existing data
            await Feedback_model_1.default.deleteMany({});
            // Demo data with Pakistani names
            const initialFeedback = [
                {
                    id: 1,
                    name: 'Ahmed Ali Khan',
                    email: 'ahmed.khan@example.com',
                    message: 'Excellent service! The doctors are very professional and the staff is courteous. I had a great experience during my visit.',
                    createdAt: new Date('2026-01-10T10:30:00'),
                    updatedAt: new Date('2026-01-10T10:30:00')
                },
                {
                    id: 2,
                    name: 'Fatima Noor',
                    email: 'fatima.noor@example.com',
                    message: 'I would like to know about the cardiology department timings and available specialists. Also, do you accept health insurance?',
                    createdAt: new Date('2026-01-12T14:20:00'),
                    updatedAt: new Date('2026-01-12T14:20:00')
                },
                {
                    id: 3,
                    name: 'Muhammad Bilal',
                    email: 'm.bilal@example.com',
                    message: 'The waiting time was a bit long, but the treatment quality was excellent. Dr. Sarah Haider is very knowledgeable and caring.',
                    createdAt: new Date('2026-01-13T09:15:00'),
                    updatedAt: new Date('2026-01-13T09:15:00')
                },
                {
                    id: 4,
                    name: 'Ayesha Malik',
                    email: 'ayesha.malik@example.com',
                    message: 'Is it possible to book appointments online? Also, what are the charges for pediatric consultation?',
                    createdAt: new Date('2026-01-15T11:45:00'),
                    updatedAt: new Date('2026-01-15T11:45:00')
                },
                {
                    id: 5,
                    name: 'Hassan Raza',
                    email: 'hassan.raza@example.com',
                    message: 'Great hospital with modern facilities. The orthopedic department helped me recover from my sports injury. Highly recommended!',
                    createdAt: new Date('2026-01-16T16:30:00'),
                    updatedAt: new Date('2026-01-16T16:30:00')
                },
                {
                    id: 6,
                    name: 'Zainab Ahmed',
                    email: 'zainab.ahmed@example.com',
                    message: 'The dermatology clinic is excellent. Dr. Aslam Qureshi provided very effective treatment for my skin condition.',
                    createdAt: new Date('2026-01-17T08:00:00'),
                    updatedAt: new Date('2026-01-17T08:00:00')
                },
                {
                    id: 7,
                    name: 'Usman Tariq',
                    email: 'usman.tariq@example.com',
                    message: 'Please add more parking spaces. The hospital is great but parking is always full during peak hours.',
                    createdAt: new Date('2026-01-17T10:20:00'),
                    updatedAt: new Date('2026-01-17T10:20:00')
                },
                {
                    id: 8,
                    name: 'Sana Zahid',
                    email: 'sana.zahid@example.com',
                    message: 'The emergency department staff was very efficient and caring. Thank you for the quick response during my emergency.',
                    createdAt: new Date('2026-01-17T12:50:00'),
                    updatedAt: new Date('2026-01-17T12:50:00')
                }
            ];
            const feedback = await Feedback_model_1.default.insertMany(initialFeedback);
            res.status(201).json({
                success: true,
                message: 'Feedback seeded successfully',
                count: feedback.length,
                data: feedback
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error seeding feedback',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.FeedbackController = FeedbackController;
