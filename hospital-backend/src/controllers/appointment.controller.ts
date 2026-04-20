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
    ? `Appointment Confirmed — Virtual Hospital (#${appointmentId})`
    : `Appointment Cancelled — Virtual Hospital (#${appointmentId})`;

  const html = isConfirmed
    ? `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #c7d9ff; border-radius: 14px; overflow: hidden;">

      <!-- Header Banner -->
      <div style="background: #0d3b66; padding: 22px 28px;">
        <h2 style="color: #ffffff; margin: 0 0 4px; font-size: 18px;">Virtual Hospital</h2>
        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">Your health is our priority</p>
      </div>

      <!-- Body -->
      <div style="padding: 26px 28px; background: #ffffff;">

        <!-- Title + Confirmation Badge -->
        <h3 style="color: #0d3b66; margin: 0 0 8px;">Appointment Confirmed</h3>
        <span style="display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 3px 12px; margin-bottom: 18px;">
          &#10003; Successfully Confirmed
        </span>

        <!-- Greeting -->
        <p style="color: #333; margin: 0 0 10px; font-size: 14px;">
          Assalam o Alaikum, <strong>${patientName}</strong>!
        </p>
        <p style="color: #555; line-height: 1.7; margin: 0 0 20px; font-size: 14px;">
          We are pleased to inform you that your appointment at <strong>Virtual Hospital</strong> has been successfully confirmed by <strong>${doctorName}</strong>. We look forward to taking great care of you!
        </p>

        <!-- Appointment Details Table -->
        <div style="background: #f7faff; border: 1px solid #c7d9ff; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #e8f0fe; padding: 8px 16px; border-bottom: 1px solid #c7d9ff;">
            <p style="font-size: 11px; font-weight: bold; color: #0d3b66; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Appointment Details</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #dce8ff; background: #f7faff;">
              <td style="padding: 10px 16px; color: #555; width: 40%;">Appointment ID</td>
              <td style="padding: 10px 16px; color: #0d3b66; font-weight: bold;">#${appointmentId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dce8ff; background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Doctor</td>
              <td style="padding: 10px 16px; color: #0d3b66; font-weight: bold;">${doctorName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dce8ff; background: #f7faff;">
              <td style="padding: 10px 16px; color: #555;">Date</td>
              <td style="padding: 10px 16px; color: #0d3b66; font-weight: bold;">${date}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dce8ff; background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Time</td>
              <td style="padding: 10px 16px; color: #0d3b66; font-weight: bold;">${time}</td>
            </tr>
            <tr style="border-bottom: 1px solid #dce8ff; background: #f7faff;">
              <td style="padding: 10px 16px; color: #555;">Priority</td>
              <td style="padding: 10px 16px;">
                <span style="background: #fff3e0; color: #e65100; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 2px 10px;">
                  ${priority}
                </span>
              </td>
            </tr>
            <tr style="background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Status</td>
              <td style="padding: 10px 16px;">
                <span style="background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 2px 10px;">
                  &#10003; Confirmed
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Tip Cards -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tr>
            <td style="width: 50%; padding-right: 8px;">
              <div style="background: #e8f5e9; border-radius: 8px; padding: 10px 14px;">
                <p style="font-size: 12px; font-weight: bold; color: #2e7d32; margin: 0 0 3px;">Arrive Early</p>
                <p style="font-size: 12px; color: #388e3c; margin: 0;">Please be there <strong>10 minutes</strong> before your slot.</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 8px;">
              <div style="background: #fff8e1; border-radius: 8px; padding: 10px 14px;">
                <p style="font-size: 12px; font-weight: bold; color: #f57f17; margin: 0 0 3px;">Bring Your Reports</p>
                <p style="font-size: 12px; color: #f9a825; margin: 0;">Carry any previous test results or prescriptions.</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Regards -->
        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 18px;">
        <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 10px;">
          If you need to reschedule or have any questions before your visit, please don't hesitate to contact us. We are always here to help you.
        </p>
        <p style="color: #444; font-size: 14px; margin: 0 0 4px;">Warm Regards,</p>
        <p style="color: #0d3b66; font-weight: bold; font-size: 14px; margin: 0;">The Virtual Hospital Care Team</p>
        <p style="color: #aaa; font-size: 12px; margin: 4px 0 0;">Virtual Patient Support System &bull; Caring for you, every step of the way.</p>

      </div>
    </div>
    `
    : `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #ffcdd2; border-radius: 14px; overflow: hidden;">

      <!-- Header Banner -->
      <div style="background: #7f0000; padding: 22px 28px;">
        <h2 style="color: #ffffff; margin: 0 0 4px; font-size: 18px;">Virtual Hospital</h2>
        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">Your health is our priority</p>
      </div>

      <!-- Body -->
      <div style="padding: 26px 28px; background: #ffffff;">

        <!-- Title + Cancellation Badge -->
        <h3 style="color: #7f0000; margin: 0 0 8px;">Appointment Cancelled</h3>
        <span style="display: inline-block; background: #ffebee; color: #c62828; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 3px 12px; margin-bottom: 18px;">
          &#10007; Appointment Cancelled
        </span>

        <!-- Greeting -->
        <p style="color: #333; margin: 0 0 10px; font-size: 14px;">
          Assalam o Alaikum, <strong>${patientName}</strong>,
        </p>
        <p style="color: #555; line-height: 1.7; margin: 0 0 20px; font-size: 14px;">
          We regret to inform you that your appointment at <strong>Virtual Hospital</strong> has been cancelled by <strong>${doctorName}</strong>. We sincerely apologize for any inconvenience this may have caused.
        </p>

        <!-- Appointment Details Table -->
        <div style="background: #fff5f5; border: 1px solid #ffcdd2; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #ffebee; padding: 8px 16px; border-bottom: 1px solid #ffcdd2;">
            <p style="font-size: 11px; font-weight: bold; color: #7f0000; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Cancelled Appointment Details</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #ffcdd2; background: #fff5f5;">
              <td style="padding: 10px 16px; color: #555; width: 40%;">Appointment ID</td>
              <td style="padding: 10px 16px; color: #7f0000; font-weight: bold;">#${appointmentId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ffcdd2; background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Doctor</td>
              <td style="padding: 10px 16px; color: #7f0000; font-weight: bold;">${doctorName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ffcdd2; background: #fff5f5;">
              <td style="padding: 10px 16px; color: #555;">Date</td>
              <td style="padding: 10px 16px; color: #7f0000; font-weight: bold;">${date}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ffcdd2; background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Time</td>
              <td style="padding: 10px 16px; color: #7f0000; font-weight: bold;">${time}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ffcdd2; background: #fff5f5;">
              <td style="padding: 10px 16px; color: #555;">Priority</td>
              <td style="padding: 10px 16px;">
                <span style="background: #fff3e0; color: #e65100; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 2px 10px;">
                  ${priority}
                </span>
              </td>
            </tr>
            <tr style="background: #ffffff;">
              <td style="padding: 10px 16px; color: #555;">Status</td>
              <td style="padding: 10px 16px;">
                <span style="background: #ffebee; color: #c62828; font-size: 11px; font-weight: bold; border-radius: 20px; padding: 2px 10px;">
                  &#10007; Cancelled
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Tip Cards -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tr>
            <td style="width: 50%; padding-right: 8px;">
              <div style="background: #e3f2fd; border-radius: 8px; padding: 10px 14px;">
                <p style="font-size: 12px; font-weight: bold; color: #1565c0; margin: 0 0 3px;">Book Again</p>
                <p style="font-size: 12px; color: #1976d2; margin: 0;">You can reschedule at your convenience anytime.</p>
              </div>
            </td>
            <td style="width: 50%; padding-left: 8px;">
              <div style="background: #f3e5f5; border-radius: 8px; padding: 10px 14px;">
                <p style="font-size: 12px; font-weight: bold; color: #6a1b9a; margin: 0 0 3px;">Need Help?</p>
                <p style="font-size: 12px; color: #7b1fa2; margin: 0;">Contact our support team for assistance.</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Regards -->
        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 18px;">
        <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0 0 10px;">
          We hope to serve you again soon. Please feel free to book a new appointment at any time — we are always here for your healthcare needs.
        </p>
        <p style="color: #444; font-size: 14px; margin: 0 0 4px;">Warm Regards,</p>
        <p style="color: #7f0000; font-weight: bold; font-size: 14px; margin: 0;">The Virtual Hospital Care Team</p>
        <p style="color: #aaa; font-size: 12px; margin: 4px 0 0;">Virtual Patient Support System &bull; Caring for you, every step of the way.</p>

      </div>
    </div>
    `;

  await transporter.sendMail({
    from: '"Virtual Hospital Care Team" <virtualpatientsupport@gmail.com>',
    to: patientEmail,
    subject,
    html,
  });
}

export class AppointmentController {

  // ── 3. Seed dummy appointments ─────────────────────────────────────────────
  async seedAppointments(req: Request, res: Response): Promise<void> {
    try {
      await Appointment.deleteMany({});

      const doctors = await Doctor.find().limit(2);

      if (doctors.length === 0) {
        res.status(400).json({ success: false, message: 'No doctors found' });
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

      res.status(201).json({ success: true, count: inserted.length, data: inserted });

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

      if (doctorId) query.doctorId = parseInt(doctorId as string);
      if (patientName) query.patientName = patientName;

      if (date) {
        const [year, month, day] = (date as string).split('-').map(Number);
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);
        query.appointmentDate = { $gte: start, $lte: end };
      }

      const appointments = await Appointment.find(query);

      res.status(200).json({ success: true, data: appointments });

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

      res.status(201).json({ success: true, data: saved });

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