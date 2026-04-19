import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import nodemailer from 'nodemailer';

// ── Email transporter setup ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'virtualpatientsupport@gmail.com', // ← your Gmail
    pass: 'hgll jbar sgnb vdml', // ← your Gmail App Password
  },
});

// ── Email helper — handles both confirmed and cancelled ───────────────────────
async function sendStatusUpdateEmail(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  priority: string,
  appointmentId: number,
  status: 'confirmed' | 'cancelled'
) {
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
    text: text,
  });
}

export class AppointmentController {
  // ── 1. Get appointments by doctorId ────────────────────────────────────────
  async getAppointmentsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = parseInt(req.params.doctorId as string);

      const appointments = await Appointment.find({ doctorId }).sort({
        appointmentDate: 1,
        time: 1,
      });

      // Resolve userId → real patient name from patient_db
      const resolvedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          const apptObj = appt.toObject();
          const patient = await Patient.findOne({ userId: apptObj.patientName }).select(
            'firstName lastName'
          );
          if (patient) {
            apptObj.patientName = `${patient.firstName} ${patient.lastName}`;
          }
          return apptObj;
        })
      );

      res.status(200).json({
        success: true,
        count: resolvedAppointments.length,
        data: resolvedAppointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ── 2. Update status — fetch doctor name from doctors table ────────────────
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const { status } = req.body;

      const updatedAppointment = await Appointment.findOneAndUpdate(
        { id: id },
        { status: status },
        { new: true }
      );

      if (!updatedAppointment) {
        res.status(404).json({ success: false, message: 'Appointment not found' });
        return;
      }

      // ✅ Send email for confirmed or cancelled
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'confirmed' || normalizedStatus === 'cancelled') {
        try {
          // ✅ Fetch patient from patient_db using userId
          const patient = await Patient.findOne({ userId: updatedAppointment.patientName }).select(
            'firstName lastName email'
          );

          // ✅ Fetch doctor from doctors table using numeric doctorId → get real name
          const doctor = await Doctor.findOne({ id: updatedAppointment.doctorId }).select('name');

          if (patient && patient.email) {
            const fullName = `${patient.firstName} ${patient.lastName}`;
            const doctorName = doctor ? doctor.name : 'Your Doctor'; // fallback if not found
            const apptDate = updatedAppointment.appointmentDate.toISOString().split('T')[0];

            await sendStatusUpdateEmail(
              patient.email,
              fullName,
              doctorName, // ✅ real doctor name from doctors table
              apptDate,
              updatedAppointment.time,
              updatedAppointment.priority,
              updatedAppointment.id,
              normalizedStatus as 'confirmed' | 'cancelled'
            );

            console.log(
              `[EMAIL] ${normalizedStatus} email sent to ${patient.email} | Doctor: ${doctorName}`
            );
          } else {
            console.log(`[EMAIL] No patient found for userId: ${updatedAppointment.patientName}`);
          }
        } catch (emailErr) {
          console.error('[EMAIL ERROR]', emailErr); // never crash the status update
        }
      }

      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: updatedAppointment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating appointment status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ── 3. Seed dummy appointments ─────────────────────────────────────────────
  async seedAppointments(req: Request, res: Response): Promise<void> {
    try {
      await Appointment.deleteMany({});
      const doctors = await Doctor.find().limit(2);

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
          status: 'pending',
        },
        {
          id: 2,
          doctorId: 6,
          patientName: 'Sara Khan',
          appointmentDate: new Date(),
          time: '11:30 AM',
          priority: 'Normal',
          status: 'pending',
        },
      ];

      const inserted = await Appointment.insertMany(dummyAppointments);
      res.status(201).json({ success: true, count: inserted.length, data: inserted });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  // ── 4. Get appointments (Handles Query Params for Booking) ────────────────
  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, date, patientName } = req.query;
      const query: any = {};

      if (doctorId) {
        query.doctorId = parseInt(doctorId as string);
      }

      if (patientName) {
        query.patientName = patientName as string;
      }

      if (date) {
        // Parse YYYY-MM-DD safely without timezone shifting
        const [year, month, day] = (date as string).split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.appointmentDate = { $gte: start, $lte: end };
      }

      const appointments = await Appointment.find(query);
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching filtered appointments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ── 5. Create new appointment ──────────────────────────────────────────────
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData = req.body;
      const { doctorId, patientName, time, appointmentDate } = appointmentData;

      // ── Duplicate check 1: same patient, same doctor, same time slot, same day
      const [year, month, day] = new Date(appointmentDate)
        .toISOString()
        .split('T')[0]
        .split('-')
        .map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0, 0);
      const end = new Date(year, month - 1, day, 23, 59, 59, 999);

      const patientDuplicate = await Appointment.findOne({
        patientName:     patientName,
        time:            time,
        appointmentDate: { $gte: start, $lte: end },
        status:          { $nin: ['cancelled'] }
      });
      
      if (patientDuplicate) {
        res.status(409).json({
          success: false,
          message: `You already have an appointment at ${time} on this date. Please select a different slot.`
        });
        return;
      }

      // ── Duplicate check 2: same doctor, same time slot already booked by anyone
      const slotTaken = await Appointment.findOne({
        doctorId:        parseInt(doctorId),
        time:            time,
        appointmentDate: { $gte: start, $lte: end },
        status:          { $nin: ['cancelled'] }
      });
      
      if (slotTaken) {
        res.status(409).json({
          success: false,
          message: `This time slot is already booked. Please select a different time.`
        });
        return;
      }

      // ── All clear — create the appointment
      const lastAppt = await Appointment.findOne().sort({ id: -1 });
      const nextId = lastAppt ? lastAppt.id + 1 : 1;

      const newAppointment = new Appointment({
        ...appointmentData,
        id: nextId,
        status: 'pending',
      });

      const saved = await newAppointment.save();
      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating appointment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
