import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { AppointmentService } from '../core/services/appointment.service';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { map, Observable } from 'rxjs';

interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatRippleModule
  ],
  template: `
    <div class="calendar-container mat-elevation-z4">
      <div class="calendar-header">
        <div class="month-navigation">
          <button mat-icon-button (click)="previousMonth()" matTooltip="Previous Month" class="nav-button">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <h2>{{ currentDate | date:'MMMM yyyy' }}</h2>
          <button mat-icon-button (click)="nextMonth()" matTooltip="Next Month" class="nav-button">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
        <div class="week-days">
          <div *ngFor="let day of weekDays" class="week-day">{{ day }}</div>
        </div>
      </div>
      
      <div class="calendar-grid">
        <div 
          *ngFor="let day of days" 
          class="day-cell"
          [class.today]="day.isToday"
          [class.other-month]="!day.isCurrentMonth"
          cdkDropList
          [cdkDropListData]="(appointments | async)?.[day.date.toDateString()] || []"
          (cdkDropListDropped)="onDrop($event, day.date)"
          matRipple
          [matRippleDisabled]="true"
        >
          <div class="day-header">
            <span>{{ day.date | date:'d' }}</span>
            <button 
              mat-icon-button 
              class="add-button"
              (click)="openAppointmentForm(day.date)"
              matTooltip="Add Appointment"
            >
              <mat-icon>add</mat-icon>
            </button>
          </div>
          
          <div class="appointments-container">
            <div
              *ngFor="let appointment of (appointments | async)?.[day.date.toDateString()] || []"
              cdkDrag
              [cdkDragData]="appointment"
              class="appointment-card mat-elevation-z2"
              [style.borderLeft]="'4px solid ' + getAppointmentColor(appointment)"
              [matTooltip]="appointment.description || appointment.title"
              matTooltipPosition="above"
            >
              <div class="appointment-content">
                <span class="appointment-time">{{ appointment.date | date:'shortTime' }}</span>
                <span class="appointment-title">{{ appointment.title }}</span>
              </div>
              <div class="appointment-actions">
                <button 
                  mat-icon-button 
                  (click)="editAppointment(appointment)"
                  matTooltip="Edit"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  (click)="deleteAppointment(appointment.id)"
                  matTooltip="Delete"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button 
      mat-fab 
      color="primary" 
      class="fab-button"
      (click)="openAppointmentForm()"
      matTooltip="Add New Appointment"
    >
      <mat-icon>add</mat-icon>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
      height: 100%;
      box-sizing: border-box;
      background-color: #f5f5f5;
    }

    .calendar-container {
      height: calc(100% - 48px);
      background: white;
      border-radius: 8px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 96px);
    }

    .calendar-header {
      padding: 16px;
      background: #1976d2;
      color: white;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .month-navigation {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;

      h2 {
        margin: 0 24px;
        font-size: 24px;
        font-weight: 500;
        min-width: 200px;
        text-align: center;
      }

      .nav-button {
        color: white;
        background: rgba(255,255,255,0.1);
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }
      }
    }

    .week-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .week-day {
      text-align: center;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.8em;
      opacity: 0.9;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(150px, 1fr));
      gap: 1px;
      background: #e0e0e0;
      flex: 1;
      min-height: 0;
      min-width: fit-content;
    }

    .day-cell {
      background: white;
      padding: 8px;
      display: flex;
      flex-direction: column;
      min-height: 120px;
      position: relative;
      overflow: hidden;

      &.today {
        background: #e3f2fd;
        .day-header span {
          background: #1976d2;
          color: white;
        }
      }

      &.other-month {
        background: #fafafa;
        .day-header span {
          opacity: 0.5;
        }
      }

      &:hover .add-button {
        opacity: 1;
      }
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      span {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 500;
      }

      .add-button {
        opacity: 0;
        transition: opacity 0.2s ease;
        transform: scale(0.8);
      }
    }

    .appointments-container {
      flex: 1;
      overflow-y: auto;
      min-height: 0;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #bdbdbd;
        border-radius: 2px;
      }
    }

    .appointment-card {
      background: white;
      margin: 4px 0;
      border-radius: 4px;
      cursor: move;
      transition: box-shadow 0.3s ease, transform 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9em;
      border: 1px solid #e0e0e0;
      user-select: none;

      &:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transform: translateY(-1px);

        .appointment-actions {
          opacity: 1;
        }
      }

      &.cdk-drag-preview {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transform: scale(1.05);
        background: white;
      }

      &.cdk-drag-placeholder {
        opacity: 0.3;
        background: #e3f2fd;
        border: 2px dashed #1976d2;
      }

      &.cdk-drag-animating {
        transition: transform 250ms ease;
      }
    }

    .cdk-drop-list-dragging .appointment-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms ease;
    }

    .cdk-drop-list-receiving {
      background-color: #e3f2fd !important;
      transition: background-color 250ms ease;
    }

    .appointment-content {
      padding: 8px;
      flex: 1;
      min-width: 0;
    }

    .appointment-time {
      display: block;
      font-size: 0.8em;
      color: #666;
      margin-bottom: 2px;
    }

    .appointment-title {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .appointment-actions {
      opacity: 0;
      transition: opacity 0.2s ease;
      display: flex;
      padding-right: 4px;

      button {
        transform: scale(0.8);
      }
    }

    .fab-button {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .day-cell.cdk-drop-list-dragging .appointment-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class CalendarComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);
  
  weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  days: CalendarDay[] = [];
  currentDate = new Date();
  appointments: Observable<{ [key: string]: any[] }> = this.appointmentService.appointments.pipe(
    map(apps => {
      const grouped: { [key: string]: any[] } = {};
      apps.forEach(app => {
        const key = new Date(app.date).toDateString();
        grouped[key] = grouped[key] || [];
        grouped[key].push({
          ...app,
          date: new Date(app.date)
        });
        // Sort appointments by time
        grouped[key].sort((a, b) => a.date.getTime() - b.date.getTime());
      });
      return grouped;
    })
  );

  ngOnInit() {
    this.generateCalendarDays();
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  private calculateNewTime(items: any[], newIndex: number, currentDate: Date): Date {
    const BUSINESS_START = 9; // 9 AM
    const BUSINESS_END = 18; // 6 PM
    const MIN_GAP = 15; // minutes
    const DEFAULT_DURATION = 30; // minutes
    const newTime = new Date(currentDate);
    
    // Function to check if a time is within business hours
    const isWithinBusinessHours = (time: Date): boolean => {
      const hours = time.getHours();
      return hours >= BUSINESS_START && hours < BUSINESS_END;
    };

    // Function to find the next available time slot
    const findNextAvailableSlot = (startTime: Date, items: any[]): Date => {
      let candidateTime = new Date(startTime);
      
      // Ensure we start within business hours
      if (!isWithinBusinessHours(candidateTime)) {
        candidateTime.setHours(BUSINESS_START, 0, 0, 0);
        if (candidateTime < startTime) {
          candidateTime.setDate(candidateTime.getDate() + 1);
        }
      }

      // Check each existing appointment for conflicts
      for (const item of items) {
        const appointmentTime = new Date(item.date);
        if (Math.abs(appointmentTime.getTime() - candidateTime.getTime()) < MIN_GAP * 60000) {
          candidateTime = new Date(appointmentTime);
          candidateTime.setMinutes(candidateTime.getMinutes() + DEFAULT_DURATION);
          
          // If we've gone past business hours, move to next day
          if (!isWithinBusinessHours(candidateTime)) {
            candidateTime.setDate(candidateTime.getDate() + 1);
            candidateTime.setHours(BUSINESS_START, 0, 0, 0);
          }
        }
      }
      
      return candidateTime;
    };

    if (newIndex === 0) {
      // If dropped at the start, try to keep original time if within business hours
      if (isWithinBusinessHours(newTime)) {
        return newTime;
      }
      newTime.setHours(BUSINESS_START, 0, 0, 0);
      return findNextAvailableSlot(newTime, items);
    }

    if (newIndex >= items.length) {
      // If dropped at the end, place after the last item
      const lastItem = items[items.length - 1];
      const afterLastItem = new Date(lastItem.date);
      afterLastItem.setMinutes(afterLastItem.getMinutes() + DEFAULT_DURATION);
      return findNextAvailableSlot(afterLastItem, items);
    }

    // If dropped between items, try to fit it in the gap
    const prevItem = items[newIndex - 1];
    const nextItem = items[newIndex];
    const prevTime = new Date(prevItem.date);
    const nextTime = new Date(nextItem.date);
    const gap = (nextTime.getTime() - prevTime.getTime()) / 60000; // gap in minutes

    if (gap >= DEFAULT_DURATION + (2 * MIN_GAP)) {
      // If there's enough gap, place it in the middle
      const midTime = new Date(prevTime.getTime() + (gap / 2) * 60000);
      return findNextAvailableSlot(midTime, items.filter(item => 
        item.id !== prevItem.id && item.id !== nextItem.id
      ));
    }

    // If no good spot found, add it after the previous item
    const afterPrevItem = new Date(prevTime);
    afterPrevItem.setMinutes(afterPrevItem.getMinutes() + DEFAULT_DURATION);
    return findNextAvailableSlot(afterPrevItem, items);
  }

  onDrop(event: CdkDragDrop<any[]>, targetDate: Date) {
    const appointment = event.item.data;
    const newDate = new Date(targetDate);
    newDate.setHours(appointment.date.getHours());
    newDate.setMinutes(appointment.date.getMinutes());
    
    if (event.previousContainer === event.container) {
      // Reorder within the same day
      const items = event.container.data;
      const newIndex = event.currentIndex;
      const oldIndex = items.findIndex(item => item.id === appointment.id);
      
      if (oldIndex !== newIndex) {
        const newTime = this.calculateNewTime(items, newIndex, appointment.date);
        newDate.setHours(newTime.getHours());
        newDate.setMinutes(newTime.getMinutes());
      }
    }
    
    this.appointmentService.updateAppointment({
      ...appointment,
      date: newDate
    });
  }

  deleteAppointment(id: string) {
    this.appointmentService.deleteAppointment(id);
  }

  editAppointment(appointment: any) {
    this.openAppointmentForm(undefined, appointment);
  }

  openAppointmentForm(date?: Date, appointment?: any) {
    this.dialog.open(AppointmentFormComponent, {
      width: '360px',
      maxHeight: '80vh',
      panelClass: 'appointment-dialog',
      data: {
        appointment,
        selectedDate: date
      }
    });
  }

  getAppointmentColor(appointment: any): string {
    // Generate a consistent color based on the appointment title
    const colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#795548'];
    const index = Array.from(appointment.title as string).reduce((acc, char: string) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }

  private generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - firstDayOfMonth.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      days.push({
        date,
        isToday: this.isSameDay(date, today),
        isCurrentMonth: date.getMonth() === month
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    
    this.days = days;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}
