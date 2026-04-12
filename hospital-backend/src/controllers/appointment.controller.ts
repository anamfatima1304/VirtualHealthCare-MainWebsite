import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model'; // ✅ new import

export class AppointmentController {

  // 1. Get appointments by doctorId — resolves userId → full name
  async getAppointmentsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = parseInt(req.params.doctorId);

      const appointments = await Appointment.find({ doctorId })
                                            .sort({ appointmentDate: 1, time: 1 });

      // ✅ For each appointment, look up userId in patient_db > patients
      const resolvedAppointments = await Promise.all(
        appointments.map(async (appt) => {
          const apptObj = appt.toObject();
          const patientUserId = apptObj.patientName; // e.g. "PAT1765520190186763"

          const patient = await Patient.findOne({ userId: patientUserId }).select('firstName lastName');

          if (patient) {
            // Replace the stored ID with the real full name
            apptObj.patientName = `${patient.firstName} ${patient.lastName}`;
          }
          // If not found, leave as-is so frontend still shows something

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

  // rest of your methods stay exactly the same...
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
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

      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: updatedAppointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating appointment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

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

      const inserted = await Appointment.insertMany(dummyAppointments);
      res.status(201).json({ success: true, count: inserted.length, data: inserted });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' });
    }
  }
}