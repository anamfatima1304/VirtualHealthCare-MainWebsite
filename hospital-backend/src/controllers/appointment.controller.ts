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

  // ── 3. Seed dummy appointments ─────────────────────────────────────────────
  async seedAppointments(req: Request, res: Response): Promise<void> {
    try {
      await Appointment.deleteMany({});

      const doctors = await Doctor.find().limit(2);

      if (doctors.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No doctors found'
        });
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
          doctorId: doctors[0].id,
          patientName: 'Sara Khan',
          appointmentDate: new Date(),
          time: '11:30 AM',
          priority: 'Normal',
          status: 'pending',
        },
      ];

      const inserted = await Appointment.insertMany(dummyAppointments);

      res.status(201).json({
        success: true,
        count: inserted.length,
        data: inserted
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Seed failed',
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // ── 4. Get appointments (filters for booking system) ───────────────────────
  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, date, patientName } = req.query;
      const query: any = {};

      if (doctorId) {
        query.doctorId = parseInt(doctorId as string);
      }

      if (patientName) {
        query.patientName = patientName;
      }

      if (date) {
        const [year, month, day] = (date as string).split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.appointmentDate = { $gte: start, $lte: end };
      }

      const appointments = await Appointment.find(query);

      res.status(200).json({
        success: true,
        data: appointments
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // ── Create appointment ─────────────────────────────────────────────────────
  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentData = req.body;

      const lastAppt = await Appointment.findOne().sort({ id: -1 });
      const nextId = lastAppt ? lastAppt.id + 1 : 1;

      const newAppointment = new Appointment({
        ...appointmentData,
        id: nextId,
        status: 'pending'
      });

      const saved = await newAppointment.save();

      res.status(201).json({
        success: true,
        data: saved
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating appointment',
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // ── Cancel appointment by id ───────────────────────────────────────────────
  async cancelById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);

      const appointment = await Appointment.findOneAndUpdate(
        { id },
        { status: 'cancelled' },
        { new: true }
      );

      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled',
        data: appointment
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown'
      });
    }
  }

  // ── 0. Get all appointments (Analytics) ───────────────────────────────────
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
  // ── Reschedule appointment by id ───────────────────────────────────────────
async rescheduleById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { appointmentDate, time } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { id },
      { appointmentDate, time, status: 'pending' },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment',
      error: error instanceof Error ? error.message : 'Unknown'
    });
  }
}
}