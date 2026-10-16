# EMR Appointment Management System

A MERN-stack application for managing patient registration, doctor schedules, appointments, and consultation workflows with role-based access control.

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT access tokens, refresh tokens, HTTP-only cookies
- **Password Security:** bcrypt
- **API Testing:** Postman
- **Development Tools:** VS Code, Git

## User Roles

### Super Admin

- Create and manage doctor and receptionist accounts.
- View appointments across the system.
- Update appointment statuses and cancel appointments.
- Configure doctor schedules through the backend API.

### Receptionist

- Register new patients and retrieve existing patient records.
- Search patients by name, patient ID, or mobile number.
- Book appointments using available doctor slots.
- View appointments, mark patients as arrived, and cancel appointments.

### Doctor

- View their appointments and associated patient information.
- Review patient details and appointment status.
- Add consultation notes.
- Complete appointments.

## Implemented Features

### Authentication and Authorization

- Login and logout endpoints.
- JWT-based access authentication.
- Refresh-token handling and rotation.
- HTTP-only authentication cookies.
- Password hashing.
- Protected frontend routes and backend role-based authorization.

### Patient Management

- Register patients with name, mobile number, date of birth, and gender.
- Generate a patient ID for new patient records.
- Search existing patients through the API.
- Display patient information in a separate search page.

### Doctor Schedules and Appointment Slots

- Configure doctor working days.
- Support multiple working sessions and breaks in the schedule API.
- Generate appointment slots based on the configured schedule and slot duration.
- Exclude unavailable and already-booked slots from the slot results.
- Validate schedule constraints during appointment booking.

Pending — Admin-side Schedule Management UI

- A dedicated Super Admin frontend page to create and update doctor schedules has not yet been implemented.
- Schedule configuration is currently performed by calling the backend API directly, for example through Postman.
- The Super Admin cannot yet manage working days, sessions, and breaks through the application interface.

Known Limitations

- Schedule Management UI: Backend APIs for doctor schedule configuration and slot generation are implemented and tested. The - - - frontend interface for administrators to manage schedules remains pending.

### Appointment Management

- Book appointments for registered patients and doctors.
- View appointments with patient and doctor information.
- Update appointment status.
- Mark patients as arrived.
- Add consultation notes and complete appointments.
- Cancel appointments.
- Search loaded appointments by patient name, patient ID, mobile number, or doctor name.

### Frontend

- Login page and protected routes.
- Role-based dashboard navigation.
- Patient registration and patient search pages.
- Appointment booking with dynamically loaded slots.
- Appointment listing and management.
- Staff management for Super Admin users.
- Loading indicators and error handling.

## API Overview

Base URL: `http://localhost:5001/api/v1`

| Method | Endpoint                       | Purpose                                                              |
| ------ | ------------------------------ | -------------------------------------------------------------------- |
| POST   | `/auth/login`                  | Authenticate a user                                                  |
| POST   | `/auth/logout`                 | Log out and invalidate the refresh token                             |
| POST   | `/auth/refresh`                | Refresh authentication tokens                                        |
| GET    | `/auth/me`                     | Retrieve the authenticated user                                      |
| GET    | `/users`                       | List staff accounts for authorized administrators                    |
| POST   | `/users`                       | Create staff accounts                                                |
| GET    | `/users/doctors`               | Retrieve doctors                                                     |
| POST   | `/patients`                    | Register a patient                                                   |
| GET    | `/patients`                    | Search and retrieve patients                                         |
| GET    | `/slots?doctorId=...&date=...` | Retrieve available appointment slots                                 |
| PUT    | `/doctor-schedules/:doctorId`  | Create or update a doctor's schedule                                 |
| POST   | `/appointments`                | Book an appointment                                                  |
| GET    | `/appointments`                | Retrieve appointments                                                |
| PUT    | `/appointments/:id`            | Update an appointment                                                |
| DELETE | `/appointments/:id`            | Cancel an appointment, subject to authorization                      |
| POST   | `/appointments/:id/arrive`     | Mark an appointment as arrived, if supported by the configured route |

All protected endpoints require valid authentication and the appropriate role permissions. Request validation and response details depend on the individual endpoint implementation.

## Project Structure

```text
emr-appointment-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── scripts/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── README.md
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── ENGINEERING_DECISIONS.md
├── DATABASE_SCHEMA.md
├── API_DOCUMENTATION.md
└── README.md

```

## Local Setup

### Prerequisites

- Node.js and npm
- A MongoDB Atlas cluster or local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd emr-appointment-management
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a local `.env` file using the environment-variable names expected by the backend configuration. Set the MongoDB connection URI, port, environment, JWT secrets, and frontend origin.

Use strong, unique secrets and never commit your real `.env` file.

Start the backend using the appropriate script in `backend/package.json`.

### 3. Configure the frontend

In a separate terminal:

```bash
cd frontend
npm install
```

Configure the frontend API URL in its local `.env` file. For local development, the API base URL is:

```text
VITE_API_URL=http://localhost:5001/api/v1
```

Start the frontend using the appropriate script in `frontend/package.json`.

The local frontend runs on port `5173` when using the current Vite configuration, and the backend runs on port `5001`.

### 4. Create the initial administrator

Use the provided admin seed script if configured for your environment. Review the script and its required environment variables before running it. Do not publish seed credentials.

## Testing

The application has been manually tested through Postman and the frontend for core workflows, including authentication, staff creation, patient registration and search, appointment booking and updates, schedule configuration, slot retrieval, and role-based page access.

For additional verification:

- Test each role using separate accounts.
- Verify invalid and expired authentication tokens.
- Test unavailable slots, breaks, past dates, and conflicting bookings.
- Verify unauthorized requests are rejected by the backend.
- Run the frontend production build before submission.

## Known Limitations and Future Improvements

- **Admin Schedule Management UI:** Schedule configuration is available through the backend API, but a dedicated Super Admin frontend page for managing working days, sessions, and breaks remains pending.
- **Appointment Search:** The current frontend search filters the appointments returned by the API. Server-side appointment search, filtering, sorting, and pagination should be added or verified for larger datasets.
- **Concurrent Booking:** Concurrent booking protection should be validated with simultaneous requests and an appropriate database-level constraint.
- **Real-Time Updates:** Live scheduler updates across multiple users remain a future enhancement unless a real-time mechanism is added and tested.

## Security Notes

- Keep environment files and credentials out of version control.
- Use HTTPS and secure cookie settings in production.
- Configure CORS for trusted frontend origins only.
- Enforce authorization on the backend; frontend route protection alone is not sufficient.
- Use non-sensitive error messages in production.

## License

Add the applicable license information before public distribution.
