// hospital-backend/src/routes/emergency.routes.ts
// Add to your hospital backend (port 3000)
// Register in app.ts:  app.use('/api/emergency', emergencyRoutes);

import express, { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
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
// HELPER: calculate next 15-min slot from NOW (PKT = UTC+5)
//
// FIX EXPLANATION:
//   The old code did:  slotDate.setUTCHours(slotHour24 - 5, ...)
//   Problem: when PKT time is e.g. 01:30 (past midnight), slotHour24=1,
//   so 1-5 = -4 which JavaScript normalises to the PREVIOUS UTC day at 20:00.
//   Then isDoctorAvailableForSlot added +5h back, landing on the same
//   previous day — giving the wrong weekday name.
//
//   The fix: get the full PKT calendar date (year/month/day) from
//   Intl.DateTimeFormat, then build slotDate directly from those PKT
//   date parts, converting correctly to UTC.
// ============================================================
function getNextSlot(): { slotString: string; slotDate: Date } {
  const now = new Date();

  // Get current PKT date AND time in one call
  const pkFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = pkFormatter.formatToParts(now);
  const get = (type: string): number =>
    parseInt(parts.find(p => p.type === type)!.value, 10);

  const pkYear   = get('year');
  const pkMonth  = get('month');  // 1-based
  const pkDay    = get('day');
  const pkHour   = get('hour');
  const pkMinute = get('minute');

  // Round up to next 15-min boundary
  const totalMinutes    = pkHour * 60 + pkMinute;
  const nextSlotMinutes = Math.ceil((totalMinutes + 1) / 15) * 15;

  // nextSlotMinutes can be >= 1440 if we are near PKT midnight
  // e.g. PKT 23:50 → nextSlotMinutes = 1440 (= next day 00:00 PKT)
  const slotHour24 = Math.floor(nextSlotMinutes / 60) % 24;
  const slotMin    = nextSlotMinutes % 60;
  const dayOffset  = nextSlotMinutes >= 1440 ? 1 : 0; // rolled into next PKT day

  // Build the slot's display string (12h format)
  const ampm = slotHour24 < 12 ? 'AM' : 'PM';
  const h12  = slotHour24 % 12 === 0 ? 12 : slotHour24 % 12;
  const slotString = `${String(h12).padStart(2, '0')}:${String(slotMin).padStart(2, '0')} ${ampm}`;

  // ✅ Build slotDate correctly from the PKT calendar date + slot time.
  //
  // Strategy: construct "PKT midnight of the slot's PKT date" in UTC, then
  // add the slot's minute offset.
  //
  // PKT midnight = UTC midnight − 5 h.
  // Date.UTC(pkYear, pkMonth-1, pkDay + dayOffset, -5, 0, 0, 0)
  //   → JavaScript normalises hour=-5 automatically to the correct UTC time
  //     on the previous UTC day (e.g. 2026-05-19 PKT midnight = 2026-05-18T19:00Z)
  //
  // Then add (slotHour24 * 60 + slotMin) minutes to get the slot UTC timestamp.
  const pkMidnightUTC = Date.UTC(pkYear, pkMonth - 1, pkDay + dayOffset, -5, 0, 0, 0);
  const slotDate = new Date(pkMidnightUTC + (slotHour24 * 60 + slotMin) * 60 * 1000);

  console.log(
    `🕐 PKT time: ${pkHour}:${String(pkMinute).padStart(2, '0')}`,
    `→ next slot: ${slotString}`,
    `| slotDate UTC: ${slotDate.toISOString()}`,
  );

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
// HELPER: check if the next slot falls within doctor's working hours
//
// FIX EXPLANATION:
//   The old code did:
//     const pkDate = new Date(slotDate.getTime() + 5 * 60 * 60 * 1000);
//     const todayDayName = DAY_NAMES[pkDate.getUTCDay()];
//   This is fragile — if slotDate was wrong (as it was in getNextSlot),
//   adding 5h gave the wrong day.
//
//   The fix: use Intl.DateTimeFormat with weekday:'long' directly on
//   slotDate to get the PKT weekday name. This is independent of any
//   manual offset arithmetic and always correct.
// ============================================================
function isDoctorAvailableForSlot(doctor: any, slotDate: Date, slotString: string): {
  available: boolean;
  reason: string;
} {
  // ✅ FIX: derive PKT day name via Intl — no manual +5h arithmetic
  const pkDayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'long',
  });
  const todayDayName = pkDayFormatter.format(slotDate);

  // 1. Check if doctor works today at all
  const availableDays: string[] = doctor.availableDays || [];
  if (!availableDays.includes(todayDayName)) {
    return {
      available: false,
      reason: `Dr. ${doctor.name} is not available today (${todayDayName}). Their working days are: ${availableDays.join(', ')}.`,
    };
  }

  // 2. Check if the next slot falls within any of their time slot ranges for today
  const timeSlots: Array<{ day: string; startTime: string; endTime: string }> = doctor.timeSlots || [];
  const todaySlots = timeSlots.filter((ts: any) => ts.day === todayDayName);

  if (todaySlots.length === 0) {
    // Graceful fallback: if MongoDB has no timeSlots for this doctor at all,
    // treat availableDays as sufficient so emergencies are never blocked by
    // missing DB data. Log a warning so you know to fix the DB.
    if (timeSlots.length === 0) {
      console.warn(`⚠️  Dr. ${doctor.name} has NO timeSlots in MongoDB. Falling back to availableDays only.`);
      console.warn(`    Run the MongoDB fix commands to populate timeSlots correctly.`);
      return { available: true, reason: '' };
    }
    return {
      available: false,
      reason: `Dr. ${doctor.name} has no scheduled hours for ${todayDayName}.`,
    };
  }

  // Convert slotString (e.g. "09:30 AM") to total minutes since midnight
  const [timePart, period] = slotString.split(' ');
  const [sh, sm] = timePart.split(':').map(Number);
  let slotMinutes = sh * 60 + sm;
  if (period === 'PM' && sh !== 12) slotMinutes += 720;
  if (period === 'AM' && sh === 12) slotMinutes = sm; // 12:xx AM = 00:xx

  // 🔍 DEBUG — remove after confirming fix
  console.log('🔍 Emergency availability check:');
  console.log('   PKT day name  :', todayDayName);
  console.log('   Next slot     :', slotString, '→', slotMinutes, 'min');
  console.log('   availableDays :', availableDays);
  console.log('   timeSlots today:', JSON.stringify(todaySlots));

  const slotFits = todaySlots.some((ts: any) => {
    const [startH, startM] = ts.startTime.split(':').map(Number);
    const [endH,   endM]   = ts.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes   = endH   * 60 + endM;
    console.log(
      `   Range ${ts.startTime}(${startMinutes})–${ts.endTime}(${endMinutes})`,
      `slot=${slotMinutes} fits=${slotMinutes >= startMinutes && (slotMinutes + 15) <= endMinutes}`,
    );
    // Slot must START at or after startTime, and END (slot+15 min) at or before endTime
    return slotMinutes >= startMinutes && (slotMinutes + 15) <= endMinutes;
  });

  if (!slotFits) {
    const hoursText = todaySlots
      .map((ts: any) => `${ts.startTime}–${ts.endTime}`)
      .join(', ');
    return {
      available: false,
      reason: `The next available slot (${slotString}) is outside Dr. ${doctor.name}'s working hours today (${hoursText}).`,
    };
  }

  return { available: true, reason: '' };
}

// ============================================================
// ROUTE 2 — POST /api/emergency/book
// Body: { doctorId, patientId, reason, category }
// Logic:
//   1. Calculate next 15-min slot from NOW (PKT)
//   2. Verify doctor is available today AND in that slot
//   3. Check if that slot is already taken today
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
    const todayStr = slotDate.toISOString().split('T')[0]; // "YYYY-MM-DD" in UTC

    // 2. Find doctor
    const doctor = await Doctor.findOne({ id: doctorId }).lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    const doctorName = (doctor as any).name;

    // 3. Check doctor availability for today + next slot
    const availability = isDoctorAvailableForSlot(doctor, slotDate, slotString);
    if (!availability.available) {
      return res.status(409).json({
        success: false,
        doctorUnavailable: true,  // frontend uses this flag to show "visit hospital" message
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
      bumpedPatientId     = existingAppointment.patientName; // stores patientId/userId
      bumpedAppointmentId = existingAppointment.id;

      existingAppointment.status = 'Cancelled';
      await existingAppointment.save();

      console.log(`🚨 Emergency bump: cancelled appointment #${bumpedAppointmentId} (patient: ${bumpedPatientId})`);

      // 4b. Send cancellation email to bumped patient (non-blocking)
      try {
        await sendEmergencyBumpEmail(
          bumpedPatientId!,
          doctorName,
          slotDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Karachi' }),
          slotString,
          bumpedAppointmentId!
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
