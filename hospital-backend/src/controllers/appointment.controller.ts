import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import nodemailer from 'nodemailer';

// ── Email transporter setup ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'virtualpatientsupport@gmail.com',
    pass: 'hgll jbar sgnb vdml',
  },
});

// ── Email helper ──────────────────────────────────────────────────────────────
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

Your appointment has been confirmed by ${doctorName}.

Appointment Details:
ID: #${appointmentId}
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Priority: ${priority}
Status: Confirmed

Please arrive 10 minutes early.

Regards,
Virtual Patient Support System
`
    : `
Dear ${patientName},

Assalam o Alaikum.

Your appointment has been cancelled by ${doctorName}.

Appointment Details:
ID: #${appointmentId}
Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Priority: ${priority}
Status: Cancelled

Please book again at your convenience.

Regards,
Virtual Patient Support System
`;

  await transporter.sendMail({
    from: 'virtualpatientsupport@gmail.com',
    to: patientEmail,
    subject,
    text,
  });
}

export class AppointmentController {

  // ── 0. Get all appointments (Analytics) ─────────────────────────────────────
  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await Appointment.find().sort({ appointmentDate: 1, time: 1 });

      const resolvedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          const apptObj = appt.toObject();
          const patient = await Patient.findOne({ userId: apptObj.patientName })
            .select('firstName lastName');

          if (patient) {
            apptObj.patientName = `${patient.firstName} ${patient.lastName}`;
          }
          return apptObj;
        })
      );

      res.status(200).json({
        success: true,
        count: resolvedAppointments.length,
        data: resolvedAppointments
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ── 1. Get appointments by doctorId ────────────────────────────────────────
  async getAppointmentsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = parseInt(req.params.doctorId as string);

      const appointments = await Appointment.find({ doctorId }).sort({
        appointmentDate: 1,
        time: 1,
      });

      const resolvedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          const apptObj = appt.toObject();
          const patient = await Patient.findOne({ userId: apptObj.patientName })
            .select('firstName lastName');

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

  // ── 2. Update status ───────────────────────────────────────────────────────
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const { status } = req.body;

      const updatedAppointment = await Appointment.findOneAndUpdate(
        { id },
        { status },
        { new: true }
      );

      if (!updatedAppointment) {
        res.status(404).json({ success: false, message: 'Appointment not found' });
        return;
      }

      const normalizedStatus = status.toLowerCase();

      if (normalizedStatus === 'confirmed' || normalizedStatus === 'cancelled') {
        try {
          const patient = await Patient.findOne({ userId: updatedAppointment.patientName })
            .select('firstName lastName email');

          const doctor = await Doctor.findOne({ id: updatedAppointment.doctorId })
            .select('name');

          if (patient && patient.email) {
            const fullName = `${patient.firstName} ${patient.lastName}`;
            const doctorName = doctor ? doctor.name : 'Your Doctor';
            const apptDate = updatedAppointment.appointmentDate.toISOString().split('T')[0];

            await sendStatusUpdateEmail(
              patient.email,
              fullName,
              doctorName,
              apptDate,
              updatedAppointment.time,
              updatedAppointment.priority,
              updatedAppointment.id,
              normalizedStatus as 'confirmed' | 'cancelled'
            );
          }
        } catch (e) {
          console.error('[EMAIL ERROR]', e);
        }
      }

      res.status(200).json({
        success: true,
        message: `Appointment updated`,
        data: updatedAppointment,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating appointment',
      });
    }
  }
}