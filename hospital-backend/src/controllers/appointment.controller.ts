import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import nodemailer from 'nodemailer';

// ── Email transporter setup ───────────────────────────────────────────────────
// ✅ Generate a new App Password at: myaccount.google.com → "App passwords"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    const EMAIL_USER = 'healthcare.virtualpatient@gmail.com',      // ← your Gmail address
    const EMAIL_PASS = 'jaky safl xtrx cqyf',  // ← REPLACE with your new 16-char App Password
  },
});

// ── Email helper: confirmed / cancelled by doctor ─────────────────────────────
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

  const html = isConfirmed ? `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #c7d9ff;border-radius:14px;overflow:hidden;">
      <div style="background:#0d3b66;padding:22px 28px;">
        <h2 style="color:#fff;margin:0 0 4px;font-size:18px;">Virtual Hospital</h2>
        <p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;">Your health is our priority</p>
      </div>
      <div style="padding:26px 28px;background:#fff;">
        <h3 style="color:#0d3b66;margin:0 0 8px;">Appointment Confirmed</h3>
        <span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:11px;font-weight:bold;border-radius:20px;padding:3px 12px;margin-bottom:18px;">&#10003; Successfully Confirmed</span>
        <p style="color:#333;margin:0 0 10px;font-size:14px;">Assalam o Alaikum, <strong>${patientName}</strong>!</p>
        <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:14px;">Your appointment at <strong>Virtual Hospital</strong> has been confirmed by <strong>${doctorName}</strong>.</p>
        <div style="background:#f7faff;border:1px solid #c7d9ff;border-radius:10px;overflow:hidden;margin-bottom:20px;">
          <div style="background:#e8f0fe;padding:8px 16px;border-bottom:1px solid #c7d9ff;">
            <p style="font-size:11px;font-weight:bold;color:#0d3b66;margin:0;text-transform:uppercase;">Appointment Details</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #dce8ff;background:#f7faff;"><td style="padding:10px 16px;color:#555;width:40%;">Appointment ID</td><td style="padding:10px 16px;color:#0d3b66;font-weight:bold;">#${appointmentId}</td></tr>
            <tr style="border-bottom:1px solid #dce8ff;background:#fff;"><td style="padding:10px 16px;color:#555;">Doctor</td><td style="padding:10px 16px;color:#0d3b66;font-weight:bold;">${doctorName}</td></tr>
            <tr style="border-bottom:1px solid #dce8ff;background:#f7faff;"><td style="padding:10px 16px;color:#555;">Date</td><td style="padding:10px 16px;color:#0d3b66;font-weight:bold;">${date}</td></tr>
            <tr style="border-bottom:1px solid #dce8ff;background:#fff;"><td style="padding:10px 16px;color:#555;">Time</td><td style="padding:10px 16px;color:#0d3b66;font-weight:bold;">${time}</td></tr>
            <tr style="border-bottom:1px solid #dce8ff;background:#f7faff;"><td style="padding:10px 16px;color:#555;">Priority</td><td style="padding:10px 16px;"><span style="background:#fff3e0;color:#e65100;font-size:11px;font-weight:bold;border-radius:20px;padding:2px 10px;">${priority}</span></td></tr>
            <tr style="background:#fff;"><td style="padding:10px 16px;color:#555;">Status</td><td style="padding:10px 16px;"><span style="background:#e8f5e9;color:#2e7d32;font-size:11px;font-weight:bold;border-radius:20px;padding:2px 10px;">&#10003; Confirmed</span></td></tr>
          </table>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
          <tr>
            <td style="width:50%;padding-right:8px;"><div style="background:#e8f5e9;border-radius:8px;padding:10px 14px;"><p style="font-size:12px;font-weight:bold;color:#2e7d32;margin:0 0 3px;">Arrive Early</p><p style="font-size:12px;color:#388e3c;margin:0;">Please be there <strong>10 minutes</strong> before your slot.</p></div></td>
            <td style="width:50%;padding-left:8px;"><div style="background:#fff8e1;border-radius:8px;padding:10px 14px;"><p style="font-size:12px;font-weight:bold;color:#f57f17;margin:0 0 3px;">Bring Your Reports</p><p style="font-size:12px;color:#f9a825;margin:0;">Carry any previous test results or prescriptions.</p></div></td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin-bottom:18px;">
        <p style="color:#444;font-size:14px;margin:0 0 4px;">Warm Regards,</p>
        <p style="color:#0d3b66;font-weight:bold;font-size:14px;margin:0;">The Virtual Hospital Care Team</p>
        <p style="color:#aaa;font-size:12px;margin:4px 0 0;">Virtual Patient Support System &bull; Caring for you, every step of the way.</p>
      </div>
    </div>` : `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #ffcdd2;border-radius:14px;overflow:hidden;">
      <div style="background:#7f0000;padding:22px 28px;">
        <h2 style="color:#fff;margin:0 0 4px;font-size:18px;">Virtual Hospital</h2>
        <p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;">Your health is our priority</p>
      </div>
      <div style="padding:26px 28px;background:#fff;">
        <h3 style="color:#7f0000;margin:0 0 8px;">Appointment Cancelled</h3>
        <span style="display:inline-block;background:#ffebee;color:#c62828;font-size:11px;font-weight:bold;border-radius:20px;padding:3px 12px;margin-bottom:18px;">&#10007; Appointment Cancelled</span>
        <p style="color:#333;margin:0 0 10px;font-size:14px;">Assalam o Alaikum, <strong>${patientName}</strong>,</p>
        <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:14px;">Your appointment at <strong>Virtual Hospital</strong> has been cancelled by <strong>${doctorName}</strong>. We sincerely apologize for any inconvenience.</p>
        <div style="background:#fff5f5;border:1px solid #ffcdd2;border-radius:10px;overflow:hidden;margin-bottom:20px;">
          <div style="background:#ffebee;padding:8px 16px;border-bottom:1px solid #ffcdd2;">
            <p style="font-size:11px;font-weight:bold;color:#7f0000;margin:0;text-transform:uppercase;">Cancelled Appointment Details</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #ffcdd2;background:#fff5f5;"><td style="padding:10px 16px;color:#555;width:40%;">Appointment ID</td><td style="padding:10px 16px;color:#7f0000;font-weight:bold;">#${appointmentId}</td></tr>
            <tr style="border-bottom:1px solid #ffcdd2;background:#fff;"><td style="padding:10px 16px;color:#555;">Doctor</td><td style="padding:10px 16px;color:#7f0000;font-weight:bold;">${doctorName}</td></tr>
            <tr style="border-bottom:1px solid #ffcdd2;background:#fff5f5;"><td style="padding:10px 16px;color:#555;">Date</td><td style="padding:10px 16px;color:#7f0000;font-weight:bold;">${date}</td></tr>
            <tr style="border-bottom:1px solid #ffcdd2;background:#fff;"><td style="padding:10px 16px;color:#555;">Time</td><td style="padding:10px 16px;color:#7f0000;font-weight:bold;">${time}</td></tr>
            <tr style="background:#fff;"><td style="padding:10px 16px;color:#555;">Status</td><td style="padding:10px 16px;"><span style="background:#ffebee;color:#c62828;font-size:11px;font-weight:bold;border-radius:20px;padding:2px 10px;">&#10007; Cancelled</span></td></tr>
          </table>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
          <tr>
            <td style="width:50%;padding-right:8px;"><div style="background:#e3f2fd;border-radius:8px;padding:10px 14px;"><p style="font-size:12px;font-weight:bold;color:#1565c0;margin:0 0 3px;">Book Again</p><p style="font-size:12px;color:#1976d2;margin:0;">You can reschedule at your convenience anytime.</p></div></td>
            <td style="width:50%;padding-left:8px;"><div style="background:#f3e5f5;border-radius:8px;padding:10px 14px;"><p style="font-size:12px;font-weight:bold;color:#6a1b9a;margin:0 0 3px;">Need Help?</p><p style="font-size:12px;color:#7b1fa2;margin:0;">Contact our support team for assistance.</p></div></td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin-bottom:18px;">
        <p style="color:#444;font-size:14px;margin:0 0 4px;">Warm Regards,</p>
        <p style="color:#7f0000;font-weight:bold;font-size:14px;margin:0;">The Virtual Hospital Care Team</p>
        <p style="color:#aaa;font-size:12px;margin:4px 0 0;">Virtual Patient Support System &bull; Caring for you, every step of the way.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: '"Virtual Hospital Care Team" <virtualpatientsupport@gmail.com>',
    to: patientEmail,
    subject,
    html,
  });
}

// ── Emergency bump email — exported so emergency.routes.ts can import it ─────
// ✅ FIX Issue 2: instead of calling port 8000 via HTTP (which had wrong password),
//    emergency.routes.ts now imports and calls this directly — same process, same transporter
export async function sendEmergencyBumpEmail(
  patientId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  appointmentId: number
): Promise<void> {
  const patient = await Patient.findOne({ userId: patientId }).select('firstName lastName email');
  if (!patient || !patient.email) {
    console.warn(`⚠️  Bump email: patient not found for userId: ${patientId}`);
    return;
  }
  const fullName = `${patient.firstName} ${patient.lastName}`;

  await transporter.sendMail({
    from: '"Virtual Hospital Care Team" <virtualpatientsupport@gmail.com>',
    to: patient.email,
    subject: `Important: Your Appointment Has Been Cancelled — Virtual Hospital (#${appointmentId})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #ffcccc;border-radius:14px;overflow:hidden;">
        <div style="background:#c62828;padding:22px 28px;">
          <h2 style="color:#fff;margin:0 0 4px;font-size:18px;">Virtual Hospital</h2>
          <p style="color:rgba(255,255,255,0.75);margin:0;font-size:12px;">Appointment Update Notice</p>
        </div>
        <div style="padding:26px 28px;background:#fff;">
          <h3 style="color:#c62828;margin:0 0 6px;">Your Appointment Has Been Cancelled</h3>
          <span style="display:inline-block;background:#fff3e0;color:#e65100;font-size:11px;font-weight:bold;border-radius:20px;padding:3px 12px;margin-bottom:18px;">&#9888; Action Required</span>
          <p style="color:#333;margin:0 0 10px;">Dear <strong>${fullName}</strong>,</p>
          <p style="color:#555;line-height:1.7;margin:0 0 16px;font-size:14px;">
            We sincerely apologise. Your appointment has been <strong>automatically cancelled</strong>
            because an emergency medical case required urgent attention during your scheduled time slot.
          </p>
          <div style="background:#fff5f5;border:1px solid #ffcccc;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            <div style="background:#ffebee;padding:8px 16px;border-bottom:1px solid #ffcccc;">
              <p style="font-size:11px;font-weight:bold;color:#c62828;margin:0;text-transform:uppercase;">Cancelled Appointment</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #ffe0e0;background:#fff5f5;"><td style="padding:10px 16px;color:#555;width:40%;">Doctor</td><td style="padding:10px 16px;color:#c62828;font-weight:bold;">${doctorName}</td></tr>
              <tr style="border-bottom:1px solid #ffe0e0;background:#fff;"><td style="padding:10px 16px;color:#555;">Date</td><td style="padding:10px 16px;color:#c62828;font-weight:bold;">${appointmentDate}</td></tr>
              <tr style="border-bottom:1px solid #ffe0e0;background:#fff5f5;"><td style="padding:10px 16px;color:#555;">Time</td><td style="padding:10px 16px;color:#c62828;font-weight:bold;">${appointmentTime}</td></tr>
              <tr style="background:#fff;"><td style="padding:10px 16px;color:#555;">Appointment ID</td><td style="padding:10px 16px;color:#c62828;font-weight:bold;">#${appointmentId}</td></tr>
            </table>
          </div>
          <div style="background:#e8f5e9;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
            <p style="font-size:13px;font-weight:bold;color:#2e7d32;margin:0 0 8px;">&#10003; What to do next</p>
            <ul style="color:#388e3c;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
              <li>Log in to the patient portal and book a new appointment.</li>
              <li>All your details are saved — just pick a new slot.</li>
              <li>If urgent, please call our helpline or visit us directly.</li>
            </ul>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:18px;">
          <p style="color:#444;font-size:14px;margin:0 0 4px;">Warm regards,</p>
          <p style="color:#0d3b66;font-weight:bold;font-size:14px;margin:0;">The Virtual Hospital Care Team</p>
          <p style="color:#aaa;font-size:12px;margin:4px 0 0;">Virtual Patient Support System &bull; Caring for you, every step of the way.</p>
        </div>
      </div>`,
  });
  console.log(`✉️  Emergency bump email sent to: ${patient.email} (appointment #${appointmentId})`);
}

export class AppointmentController {

  async seedAppointments(req: Request, res: Response): Promise<void> {
    try {
      await Appointment.deleteMany({});
      const doctors = await Doctor.find().limit(2);
      if (doctors.length === 0) { res.status(400).json({ success: false, message: 'No doctors found' }); return; }
      const inserted = await Appointment.insertMany([
        { id: 1, doctorId: doctors[0].id, patientName: 'Ahmed Ali', appointmentDate: new Date(), time: '10:00 AM', priority: 'High',   status: 'pending' },
        { id: 2, doctorId: doctors[0].id, patientName: 'Sara Khan',  appointmentDate: new Date(), time: '11:30 AM', priority: 'Normal', status: 'pending' },
      ]);
      res.status(201).json({ success: true, count: inserted.length, data: inserted });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Seed failed', error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  // ✅ FIX Issue 1: cancelled slots now excluded from slot-availability queries
  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, date, patientName } = req.query;
      const query: any = {};

      if (doctorId)    query.doctorId    = parseInt(doctorId as string);
      if (patientName) query.patientName = patientName;

      if (date) {
        const [year, month, day] = (date as string).split('-').map(Number);
        query.appointmentDate = {
          $gte: new Date(year, month - 1, day,  0,  0,  0,   0),
          $lte: new Date(year, month - 1, day, 23, 59, 59, 999),
        };
      }

      // When checking slot availability (doctorId + date, NOT patientName),
      // exclude cancelled so those slots appear as free again
      if (doctorId && date && !patientName) {
        query.status = { $nin: ['cancelled', 'Cancelled'] };
      }

      const appointments = await Appointment.find(query);
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching appointments', error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      const lastAppt = await Appointment.findOne().sort({ id: -1 });
      const saved = await new Appointment({ ...req.body, id: lastAppt ? lastAppt.id + 1 : 1, status: 'pending' }).save();
      res.status(201).json({ success: true, data: saved });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating appointment', error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  // ✅ FIX Issue 2: patient-initiated cancel now sends email
  async cancelById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const appointment = await Appointment.findOneAndUpdate({ id }, { status: 'cancelled' }, { new: true });
      if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }

      try {
        const patient = await Patient.findOne({ userId: appointment.patientName }).select('firstName lastName email');
        const doctor  = await Doctor.findOne({ id: appointment.doctorId }).select('name');
        if (patient?.email) {
          await sendStatusUpdateEmail(
            patient.email,
            `${patient.firstName} ${patient.lastName}`,
            doctor ? doctor.name : 'Your Doctor',
            appointment.appointmentDate.toISOString().split('T')[0],
            appointment.time,
            appointment.priority,
            appointment.id,
            'cancelled'
          );
          console.log(`✉️  Cancel email sent to ${patient.email} for appointment #${id}`);
        }
      } catch (emailErr) {
        console.error('[CANCEL EMAIL ERROR]', emailErr); // non-blocking
      }

      res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await Appointment.find().sort({ appointmentDate: 1, time: 1 });
      const resolved = await Promise.all(appointments.map(async (appt) => {
        const obj = appt.toObject();
        const patient = await Patient.findOne({ userId: obj.patientName }).select('firstName lastName');
        if (patient) obj.patientName = `${patient.firstName} ${patient.lastName}`;
        return obj;
      }));
      res.status(200).json({ success: true, count: resolved.length, data: resolved });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching appointments', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAppointmentsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = parseInt(req.params.doctorId as string);
      const appointments = await Appointment.find({ doctorId }).sort({ appointmentDate: 1, time: 1 });
      const resolved = await Promise.all(appointments.map(async (appt) => {
        const obj = appt.toObject();
        const patient = await Patient.findOne({ userId: obj.patientName }).select('firstName lastName');
        if (patient) obj.patientName = `${patient.firstName} ${patient.lastName}`;
        return obj;
      }));
      res.status(200).json({ success: true, count: resolved.length, data: resolved });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching appointments', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const { status } = req.body;
      const updated = await Appointment.findOneAndUpdate({ id }, { status }, { new: true });
      if (!updated) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }

      const norm = status.toLowerCase();
      if (norm === 'confirmed' || norm === 'cancelled') {
        try {
          const patient = await Patient.findOne({ userId: updated.patientName }).select('firstName lastName email');
          const doctor  = await Doctor.findOne({ id: updated.doctorId }).select('name');
          if (patient?.email) {
            await sendStatusUpdateEmail(
              patient.email,
              `${patient.firstName} ${patient.lastName}`,
              doctor ? doctor.name : 'Your Doctor',
              updated.appointmentDate.toISOString().split('T')[0],
              updated.time, updated.priority, updated.id,
              norm as 'confirmed' | 'cancelled'
            );
          }
        } catch (e) { console.error('[EMAIL ERROR]', e); }
      }
      res.status(200).json({ success: true, message: 'Appointment updated', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating appointment' });
    }
  }

  async rescheduleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const { appointmentDate, time } = req.body;
      const appointment = await Appointment.findOneAndUpdate({ id }, { appointmentDate, time, status: 'pending' }, { new: true });
      if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
      res.status(200).json({ success: true, message: 'Appointment rescheduled', data: appointment });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error rescheduling appointment', error: error instanceof Error ? error.message : 'Unknown' });
    }
  }
}
