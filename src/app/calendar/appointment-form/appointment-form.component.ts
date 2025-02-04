import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { AppointmentService } from '../../core/services/appointment.service';

interface DialogData {
  appointment?: {
    id: string;
    title: string;
    date: Date;
    description?: string;
    color?: string;
  };
  selectedDate?: Date;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatNativeDateModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header" [style.backgroundColor]="selectedColor">
        <div class="header-content">
          <mat-icon class="header-icon">{{ data.appointment ? 'edit_calendar' : 'add_circle' }}</mat-icon>
          <h2 mat-dialog-title>{{ data.appointment ? 'Edit' : 'New' }} Appointment</h2>
        </div>
        <button mat-icon-button mat-dialog-close matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="appointment-form">
        <mat-dialog-content>
          <div class="form-section">
            <mat-form-field appearance="fill">
              <mat-label>Title</mat-label>
              <mat-icon matPrefix class="prefix-icon">title</mat-icon>
              <input matInput formControlName="title" #titleInput placeholder="Enter appointment title">
              <mat-error *ngIf="form.get('title')?.errors?.['required']">Required</mat-error>
              <mat-error *ngIf="form.get('title')?.errors?.['maxlength']">Max 50 characters</mat-error>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3 class="section-title">Schedule</h3>
            <div class="form-row date-time-row">
              <mat-form-field appearance="fill">
                <mat-label>Date</mat-label>
                <mat-icon matPrefix class="prefix-icon">calendar_today</mat-icon>
                <input matInput [matDatepicker]="picker" formControlName="date" [min]="minDate">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="form.get('date')?.errors?.['required']">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Time</mat-label>
                <mat-icon matPrefix class="prefix-icon">schedule</mat-icon>
                <input matInput type="time" formControlName="time" [min]="minTime" (change)="onTimeChange()">
                <mat-error *ngIf="form.get('time')?.errors?.['required']">Required</mat-error>
              </mat-form-field>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Details</h3>
            <mat-form-field appearance="fill">
              <mat-label>Description (Optional)</mat-label>
              <mat-icon matPrefix class="prefix-icon">description</mat-icon>
              <textarea 
                matInput 
                formControlName="description" 
                rows="2"
                #descInput
                maxlength="200"
                placeholder="Add appointment details"
              ></textarea>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3 class="section-title">Color</h3>
            <div class="color-options">
              <button 
                *ngFor="let color of colors" 
                type="button"
                class="color-option"
                [class.selected]="color === selectedColor"
                [style.backgroundColor]="color"
                (click)="selectColor(color)"
                [matTooltip]="'Select color'"
                matTooltipPosition="above"
              ></button>
            </div>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close type="button">Cancel</button>
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            [disabled]="form.invalid"
            (click)="onSubmit()"
          >
            {{ data.appointment ? 'Update' : 'Create' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      background: #fafafa;
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      color: white;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      .header-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 0.25px;
      }

      .header-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      button {
        margin: -6px;
        color: white;
      }
    }

    .appointment-form {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    mat-dialog-content {
      padding: 16px;
      margin: 0;
      max-height: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
      background: white;
    }

    .form-section {
      .section-title {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 500;
        color: rgba(0,0,0,0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .prefix-icon {
      color: rgba(0,0,0,0.4);
      font-size: 16px;
      margin-right: 8px;
    }

    .form-row {
      &.date-time-row {
        display: flex;
        gap: 12px;

        mat-form-field:first-child {
          flex: 1.2;
        }

        mat-form-field:last-child {
          flex: 0.8;
        }
      }
    }

    .color-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px;
      justify-content: flex-start;
    }

    .color-option {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;

      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: white;
        box-shadow: 0 0 0 2px currentColor;
      }
    }

    mat-dialog-actions {
      margin: 0;
      padding: 8px 16px;
      background: white;
      border-top: 1px solid #eee;

      button {
        min-width: 80px;

        &[color="primary"] {
          background: linear-gradient(135deg, #1976d2, #1565c0);
        }
      }
    }

    ::ng-deep {
      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      .mat-mdc-text-field-wrapper {
        background: #f5f5f5;
        border-radius: 4px;
      }

      .mdc-text-field--filled:not(.mdc-text-field--disabled) {
        background: #f5f5f5;
      }
    }
  `]
})
export class AppointmentFormComponent {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descInput') descInput!: ElementRef<HTMLTextAreaElement>;

  form: FormGroup;
  colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#795548', '#009688', '#607d8b'];
  minDate = new Date();
  minTime = '';
  selectedColor: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentFormComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    // Set minimum time if date is today
    this.updateMinTime();

    const date = data.selectedDate || data.appointment?.date || new Date();
    const time = date.toTimeString().slice(0, 5); // Format: HH:mm

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      date: [date, [Validators.required]],
      time: [time, [Validators.required]],
      description: ['', [Validators.maxLength(200)]]
    });

    if (data.appointment) {
      this.form.patchValue({
        ...data.appointment,
        time: data.appointment.date.toTimeString().slice(0, 5)
      });
      this.selectedColor = data.appointment.color || this.colors[0];
    } else {
      this.selectedColor = this.colors[0];
    }
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.form.markAsDirty();
  }

  clearForm() {
    this.form.reset({
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5)
    });
    this.selectedColor = this.colors[0];
  }

  updateMinTime() {
    const today = new Date();
    const selectedDate = this.form?.get('date')?.value;

    if (selectedDate && this.isSameDay(selectedDate, today)) {
      const hours = today.getHours().toString().padStart(2, '0');
      const minutes = today.getMinutes().toString().padStart(2, '0');
      this.minTime = `${hours}:${minutes}`;
    } else {
      this.minTime = '';
    }
  }

  onTimeChange() {
    const today = new Date();
    const selectedDate = this.form.get('date')?.value;
    const selectedTime = this.form.get('time')?.value;

    if (selectedDate && selectedTime && this.isSameDay(selectedDate, today)) {
      const [hours, minutes] = selectedTime.split(':');
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(parseInt(hours), parseInt(minutes));

      if (selectedDateTime < today) {
        this.form.get('time')?.setValue(this.minTime);
      }
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const [hours, minutes] = formValue.time.split(':');
      const date = new Date(formValue.date);
      date.setHours(parseInt(hours), parseInt(minutes));

      const appointment = {
        id: this.data.appointment?.id || crypto.randomUUID(),
        title: formValue.title,
        date,
        description: formValue.description,
        color: this.selectedColor
      };

      if (this.data.appointment) {
        this.appointmentService.updateAppointment(appointment);
      } else {
        this.appointmentService.addAppointment(appointment);
      }

      this.dialogRef.close(appointment);
    }
  }
}
