# NeemaMed - Medical Records Management System

A modern web application for managing medical records, appointments, and notifications. Built with React, TypeScript, and Tailwind CSS.

## Features

- User authentication with role-based access (Patient, Doctor, Lab Technician)
- Medical records management
- Appointment scheduling
- Real-time notifications
- Responsive design
- Local storage-based data persistence

## Demo Accounts

The application comes with pre-configured demo accounts:

1. Patient Account:
   - Email: demo@example.com
   - Password: demo123

2. Doctor Account:
   - Email: doctor@example.com
   - Password: doctor123

3. Lab Technician Account:
   - Email: lab@example.com
   - Password: lab123

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd neemamed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── contexts/         # React contexts for state management
├── lib/             # Utility functions and local storage database
├── pages/           # Page components
├── types/           # TypeScript type definitions
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- React Router
- Local Storage API

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License 