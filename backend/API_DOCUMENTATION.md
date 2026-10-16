# EMR Appointment Management System — API Documentation

## 1. Overview

This document describes the REST APIs for the Enterprise EMR Appointment Management System.

**Base URL (local):** `http://localhost:5001/api/v1`

**Content type:** `application/json`

Authentication uses JWT access tokens and refresh tokens. Refresh tokens are handled through HTTP-only cookies.

## 2. Authentication

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/login` | Log in with credentials | Public |
| POST | `/auth/refresh` | Refresh the access token | Refresh cookie |
| POST | `/auth/logout` | Log out and invalidate the refresh token | Authenticated |
| GET | `/auth/me` | Get the current user's information | Authenticated |

### Login request

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

The successful response should contain the authenticated user's information. Tokens and cookies depend on the implementation of the authentication controller.

### Authentication notes

- Passwords are hashed using bcrypt.
- Access tokens are short-lived.
- Refresh tokens are rotated when refreshed.
- Refresh tokens are stored as hashes in the database.
- HTTP-only cookies are used for refresh-token handling.

## 3. User and staff management

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/users` | List users/staff | Verify role restrictions |
| POST | `/users` | Create a staff account | Super Admin |
| GET | `/users/doctors` | List doctors for appointment booking | Authenticated users as permitted |

Staff roles include `super_admin`, `doctor`, and `receptionist`.

A Super Admin can create doctor and receptionist accounts. Verify the supported filters and exact response format in the user controller.

## 4. Patient management

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/patients` | Register a patient | Receptionist or authorized role |
| GET | `/patients` | List or search patients | Authenticated, subject to role restrictions |

### Search example

```http
GET /api/v1/patients?search=PT-123
```

The `search` query parameter is used by the frontend to search patient records. Confirm the exact searchable fields in the backend implementation.

Patient records include a generated patient identifier, name, mobile number, date of birth, and gender, subject to the actual model definition.

## 5. Doctor schedules

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| PUT | `/doctor-schedules/:doctorId` | Create or update a doctor's schedule | Super Admin |

The schedule configuration supports working days, sessions, and breaks according to the implemented schedule model.

Example request structure — adapt the fields to your actual validator and model:

```json
{
  "workingDays": [1, 2, 3, 4, 5],
  "sessions": [
    {
      "startTime": "09:00",
      "endTime": "17:00",
      "breaks": [
        {
          "startTime": "12:00",
          "endTime": "13:00"
        }
      ]
    }
  ],
  "slotDurationMinutes": 15
}
```

**Important:** Confirm the exact schedule request structure before using this example in API tests.

## 6. Appointment slots

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/slots?doctorId=:doctorId&date=:date` | Retrieve available appointment slots | Authenticated, subject to role restrictions |

### Example request

```http
GET /api/v1/slots?doctorId=DOCTOR_ID&date=2026-10-20
```

The API uses the selected doctor's schedule and existing appointments to determine availability.

## 7. Appointment management

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/appointments` | Book an appointment | Receptionist or authorized role |
| GET | `/appointments` | List appointments | Authenticated, with role restrictions |
| PATCH | `/appointments/:id` | Update appointment details or status | Authorized role |
| PATCH or other configured method | `/appointments/:id/cancel` | Cancel an appointment, if this is the route implemented | Verify route |

### Example booking request

The following is an illustrative request. Confirm the exact field names in `appointmentValidators.js` and `appointmentController.js`.

```json
{
  "patient": "PATIENT_ID",
  "doctor": "DOCTOR_ID",
  "appointmentDate": "2026-10-20",
  "startTime": "09:00",
  "endTime": "09:15"
}
```

### Appointment lifecycle

The intended appointment lifecycle is:

- `scheduled` → `arrived` → `completed`
- `scheduled` → `cancelled`

Doctors can view their appointments, access permitted patient information, add consultation notes, and complete appointments, according to the authorization rules implemented in the backend.

### Appointment rules

The system is intended to validate schedule availability, prevent overlapping bookings, and reject invalid appointment dates or times. Verify which protections are enforced by database constraints versus application-level checks.

## 8. Error handling

The API uses HTTP status codes to communicate success and failure. Exact response bodies depend on the central error handler.

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request or validation failure |
| `401 Unauthorized` | Authentication required or invalid |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Booking conflict or duplicate resource, if implemented |
| `500 Internal Server Error` | Unexpected server error |

## 9. Security

- Passwords are hashed rather than stored as plain text.
- Protected endpoints require authentication.
- Role-based authorization restricts privileged operations.
- Refresh tokens are stored as hashes and rotated.
- Sensitive environment variables must remain in `.env` files and must not be committed to Git.

## 10. Local setup

1. Install backend and frontend dependencies.
2. Configure the required environment variables using the project's environment example files.
3. Start the backend on port `5001`.
4. Start the Vite frontend on port `5173`.
5. Test the APIs using Postman or the frontend.

For exact setup commands and required environment variables, refer to `README.md`.

---

**Documentation maintenance:** Update this document whenever an endpoint, request field, role restriction, or response format changes. All endpoint methods and payload examples should be checked against the current route, controller, and validator files before submission.
