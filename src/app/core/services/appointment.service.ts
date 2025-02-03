import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  constructor() {
    // Load initial data if needed
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      const appointments = JSON.parse(savedAppointments).map((app: any) => ({
        ...app,
        date: new Date(app.date)
      }));
      this.appointmentsSubject.next(appointments);
    }
  }

  get appointments() {
    return this.appointmentsSubject.asObservable();
  }

  private saveToStorage(appointments: Appointment[]) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }

  addAppointment(appointment: Omit<Appointment, 'id'>) {
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      date: new Date(appointment.date)
    };

    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = [...currentAppointments, newAppointment];
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
  }

  updateAppointment(updated: Appointment) {
    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = currentAppointments.map(app => 
      app.id === updated.id ? { ...updated, date: new Date(updated.date) } : app
    );
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
  }

  deleteAppointment(id: string) {
    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = currentAppointments.filter(app => app.id !== id);
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
  }
}
