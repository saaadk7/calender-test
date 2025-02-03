# Angular Calendar Application

A modern, feature-rich calendar application built with Angular and Material Design. This application allows users to manage appointments with an intuitive drag-and-drop interface and beautiful Material Design styling.

![Calendar Screenshot](screenshot.png)

## Features

- 📅 Monthly calendar view with navigation
- ✨ Modern Material Design interface
- 🎨 Color-coded appointments
- 🖱️ Drag and drop functionality
- 💾 Local storage persistence
- 📱 Responsive design
- 🎯 Type-safe implementation
- 🔄 Real-time updates

## Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Angular CLI version 19.1.0 or higher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ui-calendar.git
   cd ui-calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

## Usage

### Creating Appointments

1. Click the "+" button in any day cell or the floating action button
2. Fill in the appointment details:
   - Title (required)
   - Date (required)
   - Time (required)
   - Description (optional)
   - Color (optional)
3. Click "Create" to save the appointment

### Managing Appointments

- **Edit**: Click the edit icon on any appointment to modify its details
- **Delete**: Click the delete icon to remove an appointment
- **Move**: Drag and drop appointments between days
- **View Details**: Hover over an appointment to see its full description

### Navigation

- Use the arrow buttons to move between months
- Click on any day to quickly add an appointment
- Current day is highlighted automatically

## Project Structure

```
src/
├── app/
│   ├── calendar/
│   │   ├── calendar.component.ts
│   │   └── appointment-form/
│   │       └── appointment-form.component.ts
│   ├── core/
│   │   └── services/
│   │       └── appointment.service.ts
│   ├── app.component.ts
│   └── app.config.ts
├── styles.scss
└── index.html
```

## Key Components

### CalendarComponent

The main calendar view component that handles:
- Monthly calendar grid display
- Appointment rendering
- Drag and drop functionality
- Month navigation

### AppointmentFormComponent

A dialog component for:
- Creating new appointments
- Editing existing appointments
- Color selection
- Form validation

### AppointmentService

Manages appointment data with:
- State management using RxJS
- Local storage persistence
- CRUD operations for appointments

## Styling

The application uses:
- Angular Material components
- Custom SCSS styling
- Material Design color palette
- Responsive grid layout
- Custom animations and transitions

## Development

### Building for Production

```bash
ng build --configuration production
```

### Running Tests

```bash
ng test
```

### Code Style

The project follows Angular style guide and uses:
- TypeScript strict mode
- ESLint for code linting
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Angular team for the amazing framework
- Material Design team for the beautiful components
- All contributors who have helped improve this project
