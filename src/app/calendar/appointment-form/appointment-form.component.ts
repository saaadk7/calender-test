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
    MatIconModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header" [style.backgroundColor]="selectedColor">
        <h2 mat-dialog-title>{{ data.appointment ? 'Edit' : 'New' }} Appointment</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" #titleInput>
              <mat-hint align="end">{{ titleInput.value.length }}/50</mat-hint>
              <mat-error *ngIf="form.get('title')?.errors?.['required']">
                Title is required
              </mat-error>
              <mat-error *ngIf="form.get('title')?.errors?.['maxlength']">
                Title must be less than 50 characters
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row date-time-row">
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('date')?.errors?.['required']">
                Date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput type="time" formControlName="time">
              <mat-error *ngIf="form.get('time')?.errors?.['required']">
                Time is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                rows="3"
                #descInput
                maxlength="200"
              ></textarea>
              <mat-hint align="end">{{ descInput.value.length }}/200</mat-hint>
            </mat-form-field>
          </div>

          <div class="form-row color-selection">
            <label>Color</label>
            <div class="color-options">
              <button 
                *ngFor="let color of colors" 
                type="button"
                class="color-option"
                [class.selected]="color === selectedColor"
                [style.backgroundColor]="color"
                (click)="selectColor(color)"
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
            [disabled]="form.invalid || form.pristine"
          >
            {{ data.appointment ? 'Update' : 'Create' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      margin: -24px;
    }

    .form-header {
      background-color: #1976d2;
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        margin: 0;
        font-weight: 400;
      }

      button {
        color: white;
      }
    }

    mat-dialog-content {
      padding: 0 24px;
      margin: 0;
      max-height: none;
    }

    .form-row {
      margin-bottom: 16px;

      mat-form-field {
        width: 100%;
      }
    }

    .date-time-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .color-selection {
      label {
        display: block;
        margin-bottom: 8px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .color-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s ease;
      padding: 0;

      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: #000;
        transform: scale(1.1);
      }
    }

    mat-dialog-actions {
      padding: 24px;
      margin: 0;
    }
  `]
})
export class AppointmentFormComponent {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descInput') descInput!: ElementRef<HTMLTextAreaElement>;
  
  form: FormGroup;
  colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#795548'];
  selectedColor: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentFormComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
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
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const date = new Date(formValue.date);
      const [hours, minutes] = formValue.time.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      const appointment = {
        title: formValue.title.trim(),
        date,
        description: formValue.description?.trim(),
        color: this.selectedColor
      };

      if (this.data.appointment) {
        this.appointmentService.updateAppointment({
          ...this.data.appointment,
          ...appointment
        });
      } else {
        this.appointmentService.addAppointment(appointment);
      }

      this.dialogRef.close();
    }
  }
}
