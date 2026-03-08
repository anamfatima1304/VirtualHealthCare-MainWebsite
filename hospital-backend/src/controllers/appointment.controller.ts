import { Request, Response } from 'express';
import Appointment from '../models/appointment.model';
import Doctor from '../models/Doctor.model';

export class AppointmentController {
  
  // 1. Get appointments by doctorId (Dynamic based on logged-in doctor)
  async getAppointmentsByDoctorId(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = parseInt(req.params.doctorId);
      
      const appointments = await Appointment.find({ doctorId: doctorId })
                                            .sort({ appointmentDate: 1, time: 1 });

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 2. Update Appointment Status (Confirm, Complete, Cancel)
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      // Find by numeric id and update the status
      const updatedAppointment = await Appointment.findOneAndUpdate(
        { id: id },
        { status: status },
        { new: true } // returns the updated document
      );

      if (!updatedAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
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

  // 3. Seed initial dummy appointments
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
          doctorId: doctors[0].id, // Usually ID 1
          patientName: 'Ahmed Ali',
          appointmentDate: new Date(),
          time: '10:00 AM',
          priority: 'High',
          status: 'pending'
        },
        {
          id: 2,
          doctorId: 6, // Specific ID for Doctor Dawood
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