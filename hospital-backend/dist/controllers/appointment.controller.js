"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const Doctor_model_1 = __importDefault(require("../models/Doctor.model"));
const Patient_model_1 = __importDefault(require("../models/Patient.model"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// ── Email transporter setup ───────────────────────────────────────────────────
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'virtualpatientsupport@gmail.com', // ← your Gmail
        pass: 'hgll jbar sgnb vdml' // ← your Gmail App Password
    }
});
// ── Email helper — handles both confirmed and cancelled ───────────────────────
async function sendStatusUpdateEmail(patientEmail, patientName, doctorName, date, time, priority, appointmentId, status) {
    const isConfirmed = status === 'confirmed';
    const subject = isConfirmed
        ? `Appointment Confirmed — Harram Hospital (#${appointmentId})`
        : `Appointment Cancelled — Harram Hospital (#${appointmentId})`;
    const text = isConfirmed
        ? `
Dear ${patientName},

Assalam o Alaikum.
    
We are pleased to inform you that your appointment has been reviewed and confirmed by the ${doctorName}. We look forward to welcoming you.
    
Appointment Details:
    
Appointment ID: #${appointmentId}
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Priority: ${priority}
Status: Confirmed
    
Kindly ensure that you arrive at least 10 minutes before your scheduled time to allow for any necessary formalities. Please bring along any previous medical reports or prescriptions, if available.
    
If you need to reschedule or cancel your appointment, we would appreciate it if you inform us in advance.
    
We are committed to providing you with the best possible care and wish you a smooth and comfortable visit.
    
Warm regards,
Virtual Patient Support System
"Your Health, Our Mission"
    
    This is an automated message; please do not reply to this email.

    `
        : `
Dear ${patientName},

Assalam o Alaikum.

We regret to inform you that your scheduled appointment has been cancelled by ${doctorName}.

Appointment Details:

Appointment ID: #${appointmentId}
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Priority: ${priority}
Status: Cancelled

We sincerely apologize for any inconvenience this may have caused and understand the importance of your time.

You may book a new appointment at your convenience through our Virtual Patient Support System. Our team will be happy to assist you in finding the earliest available slot.

Thank you for your understanding. We remain committed to providing you with quality care and hope to serve you again soon.

Warm regards,
Virtual Patient Support System
"Your Health, Our Mission"

This is an automated message; please do not reply to this email.
    `;
    await transporter.sendMail({
        from: 'virtualpatientsupport@gmail.com',
        to: patientEmail,
        subject: subject,
        text: text
    });
}
class AppointmentController {
    // ── 1. Get appointments by doctorId ────────────────────────────────────────
    async getAppointmentsByDoctorId(req, res) {
        try {
            const doctorId = parseInt(req.params.doctorId);
            const appointments = await appointment_model_1.default.find({ doctorId })
                .sort({ appointmentDate: 1, time: 1 });
            // Resolve userId → real patient name from patient_db
            const resolvedAppointments = await Promise.all(appointments.map(async (appt) => {
                const apptObj = appt.toObject();
                const patient = await Patient_model_1.default.findOne({ userId: apptObj.patientName })
                    .select('firstName lastName');
                if (patient) {
                    apptObj.patientName = `${patient.firstName} ${patient.lastName}`;
                }
                return apptObj;
            }));
            res.status(200).json({
                success: true,
                count: resolvedAppointments.length,
                data: resolvedAppointments
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching appointments',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // ── 2. Update status — fetch doctor name from doctors table ────────────────
    async updateStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            const updatedAppointment = await appointment_model_1.default.findOneAndUpdate({ id: id }, { status: status }, { new: true });
            if (!updatedAppointment) {
                res.status(404).json({ success: false, message: 'Appointment not found' });
                return;
            }
            // ✅ Send email for confirmed or cancelled
            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus === 'confirmed' || normalizedStatus === 'cancelled') {
                try {
                    // ✅ Fetch patient from patient_db using userId
                    const patient = await Patient_model_1.default.findOne({ userId: updatedAppointment.patientName })
                        .select('firstName lastName email');
                    // ✅ Fetch doctor from doctors table using numeric doctorId → get real name
                    const doctor = await Doctor_model_1.default.findOne({ id: updatedAppointment.doctorId })
                        .select('name');
                    if (patient && patient.email) {
                        const fullName = `${patient.firstName} ${patient.lastName}`;
                        const doctorName = doctor ? doctor.name : 'Your Doctor'; // fallback if not found
                        const apptDate = updatedAppointment.appointmentDate
                            .toISOString()
                            .split('T')[0];
                        await sendStatusUpdateEmail(patient.email, fullName, doctorName, // ✅ real doctor name from doctors table
                        apptDate, updatedAppointment.time, updatedAppointment.priority, updatedAppointment.id, normalizedStatus);
                        console.log(`[EMAIL] ${normalizedStatus} email sent to ${patient.email} | Doctor: ${doctorName}`);
                    }
                    else {
                        console.log(`[EMAIL] No patient found for userId: ${updatedAppointment.patientName}`);
                    }
                }
                catch (emailErr) {
                    console.error('[EMAIL ERROR]', emailErr); // never crash the status update
                }
            }
            res.status(200).json({
                success: true,
                message: `Appointment status updated to ${status}`,
                data: updatedAppointment
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating appointment status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // ── 3. Seed dummy appointments ─────────────────────────────────────────────
    async seedAppointments(req, res) {
        try {
            await appointment_model_1.default.deleteMany({});
            const doctors = await Doctor_model_1.default.find().limit(2);
            if (doctors.length === 0) {
                res.status(400).json({ success: false, message: 'No doctors found.' });
                return;
            }
            const dummyAppointments = [
                {
                    id: 1,
                    doctorId: doctors[0].id,
                    patientName: 'Ahmed Ali',
                    appointmentDate: new Date(),
                    time: '10:00 AM',
                    priority: 'High',
                    status: 'pending'
                },
                {
                    id: 2,
                    doctorId: 6,
                    patientName: 'Sara Khan',
                    appointmentDate: new Date(),
                    time: '11:30 AM',
                    priority: 'Normal',
                    status: 'pending'
                }
            ];
            const inserted = await appointment_model_1.default.insertMany(dummyAppointments);
            res.status(201).json({ success: true, count: inserted.length, data: inserted });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown'
            });
        }
    }
}
exports.AppointmentController = AppointmentController;
