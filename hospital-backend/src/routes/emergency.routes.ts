// hospital-backend/src/routes/emergency.routes.ts
// Add to your hospital backend (port 3000)
// Register in app.ts:  app.use('/api/emergency', emergencyRoutes);

import express, { Request, Response } from 'express';
import Appointment from '../models/Appointment.model';
import Doctor from '../models/Doctor.model';
// ✅ FIX: import email helper directly — no more HTTP call to port 8000
import { sendEmergencyBumpEmail } from '../controllers/appointment.controller';

const router = express.Router();

// ============================================================
// EMERGENCY KEYWORDS — comprehensive list
// ============================================================
const EMERGENCY_KEYWORDS: Record<string, string[]> = {
  cardiac: [
    'heart attack', 'chest pain', 'chest tightness', 'cardiac arrest',
    'heart pain', 'heart failure', 'palpitations', 'irregular heartbeat',
    'angina', 'myocardial', 'heart pressure', 'left arm pain',
    'jaw pain', 'shortness of breath', 'cant breathe', "can't breathe",
    'difficulty breathing', 'breathing difficulty', 'breathless',
  ],
  accident: [
    'accident', 'car crash', 'road accident', 'vehicle accident',
    'motorcycle accident', 'bike accident', 'hit by car', 'fell', 'fall',
    'fallen', 'fracture', 'broken bone', 'broken arm', 'broken leg',
    'head injury', 'head trauma', 'skull', 'concussion', 'trauma',
    'bleeding', 'blood loss', 'heavy bleeding', 'wound', 'deep cut',
    'laceration', 'internal bleeding',
  ],
  stroke: [
    'stroke', 'paralysis', 'face drooping', 'arm weakness', 'leg weakness',
    'speech problem', 'slurred speech', 'sudden headache', 'worst headache',
    'vision loss', 'sudden vision', 'numbness', 'confusion', 'loss of balance',
    'brain attack',
  ],
  unconscious: [
    'unconscious', 'fainted', 'fainting', 'passed out', 'unresponsive',
    'not responding', 'collapsed', 'blackout', 'loss of consciousness',
    'dizzy and fell', 'dizziness',
  ],
  severe_pain: [
    'severe pain', 'extreme pain', 'unbearable pain', 'sharp pain',
    'stabbing pain', 'intense pain', 'excruciating', 'worst pain',
    'severe abdominal pain', 'severe stomach pain', 'appendix',
  ],
  allergic: [
    'allergic reaction', 'anaphylaxis', 'anaphylactic', 'swollen throat',
    'throat closing', 'hives', 'swelling face', 'face swelling',
    'epipen', 'bee sting', 'severe allergy',
  ],
  poisoning: [
    'overdose', 'poisoning', 'poison', 'swallowed', 'ingested',
    'drug overdose', 'medication overdose', 'toxic', 'chemical burn',
    'burn', 'burnt', 'severe burn',
  ],
  other_emergency: [
    'emergency', 'urgent', 'critical', 'serious condition', 'life threatening',
    'life-threatening', 'immediately', 'right now', 'help me',
    'vomiting blood', 'blood in vomit', 'coughing blood', 'seizure',
    'convulsion', 'epilepsy attack', 'high fever', 'fever 40', 'fever 41',
    'fever 42', '40 degree', '41 degree', '42 degree',
  ],
};

// ============================================================
// HELPER: detect emergency from reason text
// ============================================================
function detectEmergency(reason: string): { isEmergency: boolean; category: string } {
  if (!reason || reason.trim().length === 0) {
    return { isEmergency: false, category: '' };
  }

  const lower = reason.toLowerCase();

  for (const [category, keywords] of Object.entries(EMERGENCY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { isEmergency: true, category };
      }
    }
  }

  return { isEmergency: false, category: '' };
}

// ============================================================
// HELPER: calculate next 15-min slot from NOW
//   9:05 → "09:15 AM"
//   9:23 → "09:30 AM"
//   9:47 → "10:00 AM"
// ============================================================
function getNextSlot(): { slotString: string; slotDate: Date } {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  // Round UP to next multiple of 15
  const nextSlotMinutes = Math.ceil((totalMinutes + 1) / 15) * 15;

  const slotDate = new Date(now);
  slotDate.setHours(Math.floor(nextSlotMinutes / 60), nextSlotMinutes % 60, 0, 0);

  const h24 = Math.floor(nextSlotMinutes / 60);
  const m = nextSlotMinutes % 60;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const slotString = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

  return { slotString, slotDate };
}

// ============================================================
// ROUTE 1 — POST /api/emergency/detect
// Body: { reason: string }
// Returns: { isEmergency, category }
// ============================================================
router.post('/detect', (req: Request, res: Response) => {
  const { reason } = req.body;

  if (reason === undefined) {
    return res.status(400).json({ success: false, message: 'reason is required' });
  }

  const result = detectEmergency(reason);
  return res.status(200).json({ success: true, ...result });
});

// ============================================================
// HELPER: check if next slot falls within doctor's working hours today
// ============================================================
function isDoctorAvailableForSlot(doctor: any, slotDate: Date, slotString: string): {
  available: boolean;
  reason: string;
} {
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = DAY_NAMES[slotDate.getDay()];

  // 1. Check if doctor works today at all
  const availableDays: string[] = doctor.availableDays || [];
  if (!availableDays.includes(todayDayName)) {
    return {
      available: false,
      reason: `Dr. ${doctor.name} is not available today (${todayDayName}). Their working days are: ${availableDays.join(', ')}.`
    };
  }

  // 2. Check if the next slot falls within any of their time slot ranges for today
  const timeSlots: Array<{ day: string; startTime: string; endTime: string }> = doctor.timeSlots || [];
  const todaySlots = timeSlots.filter((ts: any) => ts.day === todayDayName);

  if (todaySlots.length === 0) {
    return {
      available: false,
      reason: `Dr. ${doctor.name} has no scheduled hours for ${todayDayName}.`
    };
  }

  // Convert slotString (e.g. "09:30 AM") to 24h minutes for comparison
  const [timePart, ampm] = slotString.split(' ');
  const [sh, sm] = timePart.split(':').map(Number);
  let slotMinutes = sh * 60 + sm;
  if (ampm === 'PM' && sh !== 12) slotMinutes += 720;
  if (ampm === 'AM' && sh === 12) slotMinutes = sm; // 12:xx AM = 0:xx

  // 🔍 DEBUG — remove after confirming fix
  console.log('🔍 Emergency availability check:');
  console.log('   Today:', todayDayName);
  console.log('   Next slot:', slotString, '→', slotMinutes, 'minutes');
  console.log('   Doctor availableDays:', availableDays);
  console.log('   Doctor timeSlots for today:', JSON.stringify(todaySlots));

  const slotFits = todaySlots.some((ts: any) => {
    const [startH, startM] = ts.startTime.split(':').map(Number);
    const [endH, endM]     = ts.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes   = endH * 60 + endM;
    console.log(`   Checking slot range: ${ts.startTime}(${startMinutes}) – ${ts.endTime}(${endMinutes}), slotMinutes=${slotMinutes}, fits=${slotMinutes >= startMinutes && (slotMinutes + 15) <= endMinutes}`);
    // Slot must start at or after startTime, and end (slot+15) at or before endTime
    return slotMinutes >= startMinutes && (slotMinutes + 15) <= endMinutes;
  });

  if (!slotFits) {
    const hoursText = todaySlots
      .map((ts: any) => `${ts.startTime}–${ts.endTime}`)
      .join(', ');
    return {
      available: false,
      reason: `The next available slot (${slotString}) is outside Dr. ${doctor.name}'s working hours today (${hoursText}).`
    };
  }

  return { available: true, reason: '' };
}

// ============================================================
// ROUTE 2 — POST /api/emergency/book
// Body: { doctorId, patientId, reason, category }
// Logic:
//   1. Calculate next 15-min slot from NOW
//   2. ✅ NEW — verify doctor is available today AND in that slot
//   3. Check if that slot is taken on today's date
//   4. If taken → cancel bumped patient, email them
//   5. Book emergency appointment with priority: 'High'
// ============================================================
router.post('/book', async (req: Request, res: Response) => {
  try {
    const { doctorId, patientId, reason, category } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({ success: false, message: 'doctorId and patientId are required' });
    }

    // 1. Get next slot
    const { slotString, slotDate } = getNextSlot();
    const todayStr = slotDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 2. Find doctor
    const doctor = await Doctor.findOne({ id: doctorId }).lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    const doctorName = (doctor as any).name;

    // ✅ 3. Check doctor availability for today + next slot
    const availability = isDoctorAvailableForSlot(doctor, slotDate, slotString);
    if (!availability.available) {
      return res.status(409).json({
        success: false,
        doctorUnavailable: true,        // frontend uses this flag to show the "visit hospital" message
        message: availability.reason,
      });
    }

    // 4. Check if the next slot is already booked for this doctor today
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay   = new Date(todayStr + 'T23:59:59.999Z');

    const existingAppointment = await Appointment.findOne({
      doctorId,
      time: slotString,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['Cancelled', 'cancelled'] },
    });

    let bumpedPatientId: string | null = null;
    let bumpedAppointmentId: number | null = null;

    if (existingAppointment) {
      // 4a. Cancel the existing (bumped) appointment
      bumpedPatientId    = existingAppointment.patientName; // stores patientId/userId
      bumpedAppointmentId = existingAppointment.id;

      existingAppointment.status = 'Cancelled';
      await existingAppointment.save();

      console.log(`🚨 Emergency bump: cancelled appointment #${bumpedAppointmentId} (patient: ${bumpedPatientId})`);

      // 4b. Send cancellation email to bumped patient (non-blocking)
      try {
        await sendEmergencyBumpEmail(
          bumpedPatientId,
          doctorName,
          slotDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          slotString,
          bumpedAppointmentId
        );
      } catch (emailErr) {
        console.error('⚠️  Bump email failed (non-blocking):', emailErr);
      }
    }

    // 5. Generate a new unique numeric ID
    const lastAppt = await Appointment.findOne().sort({ id: -1 }).lean();
    const newId = lastAppt ? (lastAppt as any).id + 1 : 1;

    // 6. Book emergency appointment
    const emergencyAppointment = new Appointment({
      id:              newId,
      doctorId,
      patientName:     patientId,
      appointmentDate: slotDate,
      time:            slotString,
      priority:        'High',
      status:          'pending',
    });

    await emergencyAppointment.save();

    console.log(`✅ Emergency appointment booked: #${newId} for patient ${patientId} at ${slotString}`);

    return res.status(201).json({
      success: true,
      message: 'Emergency appointment booked successfully',
      appointment: {
        id:              emergencyAppointment.id,
        doctorId,
        doctorName,
        patientName:     patientId,
        appointmentDate: emergencyAppointment.appointmentDate,
        time:            slotString,
        priority:        'High',
        status:          'pending',
      },
      bumped: bumpedPatientId
        ? { appointmentId: bumpedAppointmentId, patientId: bumpedPatientId }
        : null,
    });

  } catch (error) {
    console.error('❌ Emergency booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error during emergency booking' });
  }
});

export default router;