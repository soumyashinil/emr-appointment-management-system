# Engineering Decisions

## 1. Architecture: Modular Monolith

The application uses a modular backend built with Node.js and Express, backed by MongoDB and Mongoose. The frontend is a separate React application.

The backend separates responsibilities into routes, controllers, services, models, middleware, validators, and utilities.

**Decision:** Use a modular monolith instead of microservices.

**Reasoning:**

- The assignment has a manageable domain and a short delivery timeline.
- A modular structure keeps authentication, patients, appointments, schedules, and staff management logically separated.
- The architecture is easier to run, test, and maintain without introducing distributed-system complexity.

## 2. Controllers and Services

Routes define API endpoints and middleware. Controllers handle HTTP requests and responses. Services contain application logic, and models define database schemas.

**Decision:** Keep business logic in service modules instead of placing it directly in route handlers.

**Reasoning:**

- Business rules are easier to test and reuse.
- Controllers remain focused on HTTP concerns.
- Changes to appointment rules do not require duplicating logic across multiple routes.

## 3. Authentication and Token Handling

The application uses JWT access tokens and refresh tokens.

- Access tokens are short-lived.
- Refresh tokens support obtaining new access tokens.
- Refresh-token rotation is implemented.
- Refresh tokens are stored as hashes in the database rather than as reusable plaintext tokens.
- HTTP-only cookies are used for authentication token handling.
- Logout invalidates the relevant refresh token.

**Decision:** Separate access-token authentication from refresh-token lifecycle management.

**Reasoning:**

- Short-lived access tokens limit the impact of a leaked access token.
- Refresh-token rotation helps reduce the usefulness of a previously issued refresh token.
- Hashing stored refresh tokens reduces exposure if the token database is compromised.

**Security consideration:** Cookie settings, HTTPS, CORS, and CSRF protections must be configured appropriately for the deployment environment.

## 4. Password Security

Passwords are hashed with bcrypt before storage.

**Decision:** Never store plaintext passwords.

**Reasoning:** Password hashing reduces the impact of database exposure. Authentication code must compare the supplied password with the stored hash instead of comparing plaintext values.

## 5. Role-Based Access Control

The system defines three roles:

- `super_admin`
- `receptionist`
- `doctor`

Authentication middleware verifies the authenticated user. Authorization middleware restricts access based on the user's role. The frontend also uses protected routes and role-based navigation.

**Decision:** Enforce permissions on the backend, with frontend restrictions as a usability layer.

**Reasoning:** Frontend restrictions alone can be bypassed by calling APIs directly. Every protected backend operation must enforce its required role and, where applicable, resource ownership.

Doctors should only access their own appointments and associated patient information. Receptionist and administrator permissions are defined by the appointment and staff-management workflows.

## 6. Patient Identity and Search

Patient records receive a generated patient identifier. Patients can be searched using identifying fields such as name, mobile number, and patient ID.

**Decision:** Keep the database identifier separate from the human-readable patient ID.

**Reasoning:**

- A readable patient ID is more convenient for staff.
- MongoDB's document identifier remains suitable for database references.
- Existing patients can be retrieved rather than unnecessarily duplicated during appointment booking.

Mobile-number validation and uniqueness rules should be consistently enforced by the backend according to the application's patient-registration requirements.

## 7. Doctor Schedules and Slot Generation

Doctor schedules store:

- Working days.
- One or more working sessions.
- Breaks within sessions.
- Slot duration.

The slot service uses the doctor's configured schedule and existing appointments to generate available slots.

**Decision:** Generate slots from schedule data instead of storing every possible slot as a permanent record.

**Reasoning:**

- Schedule changes can be reflected in newly generated availability.
- Breaks and working hours can be handled as schedule rules.
- Existing bookings can be excluded when presenting available slots.

Appointment booking must validate the selected date, working day, session boundaries, breaks, and existing appointments on the backend. A slot returned by an earlier availability request is not a guarantee that the slot remains available at booking time.

**Known limitation:** Schedule configuration is supported by the backend API, but the dedicated Super Admin schedule-management UI remains pending.
The doctor schedule configuration API (PUT /doctor-schedules/:doctorId) and slot-generation API are implemented and tested through Postman. The dedicated Super Admin frontend for creating and managing schedules has not been implemented. Schedule configuration currently requires direct API access.

## 8. Appointment Lifecycle

Appointments support these statuses:

- `scheduled`
- `arrived`
- `completed`
- `cancelled`

**Decision:** Represent appointment progress with explicit status values.

**Reasoning:**

- Receptionists can record patient arrival.
- Doctors can document consultation notes and complete visits.
- Cancellation is distinguishable from completion.
- Role-based workflows can restrict which status transitions a user may perform.

The backend must validate status transitions and reject operations that are not permitted for the current user or appointment state.

## 9. Appointment Conflict Handling

The booking service checks for existing appointments that overlap with the requested time.

**Decision:** Perform availability validation on the server rather than relying on the frontend slot grid.

**Reasoning:** A client can submit an outdated or manually modified slot. The backend must independently validate the booking.

**Further hardening:** A read-then-create conflict check alone can be vulnerable to simultaneous requests. Production-grade concurrency protection requires an appropriate database constraint or atomic reservation strategy, together with tests proving that competing requests cannot create conflicting active bookings. This behavior should be verified before it is described as fully concurrency-safe.

## 10. API Validation and Error Handling

The backend uses validation middleware, validators, and centralized error handling.

**Decision:** Validate incoming data at the API boundary and return consistent error responses.

**Reasoning:**

- Invalid input should not reach business logic unchecked.
- Error-handling behavior is easier to maintain centrally.
- The backend should return appropriate HTTP status codes and avoid exposing internal stack traces or sensitive implementation details in production.

## 11. Frontend API Communication

The frontend communicates with the backend through a shared Axios API client configured with credentials. Authentication refresh handling is implemented in the client.

**Decision:** Centralize API configuration instead of creating independent clients for every page.

**Reasoning:**

- The base API URL and credential behavior remain consistent.
- Authentication handling can be maintained in one place.
- Individual pages can focus on their feature-specific requests and UI states.

## 12. Search, Filtering, and Pagination

Patient search is supported through the backend API. The appointment page currently filters the appointment data loaded into the frontend.

**Decision:** Use frontend filtering for the current loaded result set, but prefer server-side filtering and pagination for larger appointment datasets.

**Reasoning:**

- Client-side filtering is straightforward for a limited dataset.
- Server-side filtering avoids downloading every appointment as the dataset grows.
- Server-side pagination and sorting provide more predictable performance and consistent access-control enforcement.

Server-side appointment search, filtering, and pagination should be verified or completed before they are considered implemented features.

## 13. Environment Configuration and Secrets

Configuration values are stored in environment variables rather than hard-coded into source files. `.env` files are excluded through Git ignore rules.

**Decision:** Keep development credentials outside version control.

**Reasoning:**

- Database URIs and JWT secrets are sensitive.
- Developers can use different configuration values without changing application code.
- An `.env.example` file can document required variable names with safe placeholder values.

Real secrets must never be committed. If a secret has already been committed, it must be rotated; removing the file from a later commit is not sufficient.

## 14. Testing Strategy

The core application workflows have been manually tested using Postman and the frontend.

Recommended additional automated and integration tests include:

- Authentication, refresh rotation, and logout.
- Role permissions and appointment ownership.
- Patient input validation.
- Slot generation across working days, sessions, and breaks.
- Rejection of past or conflicting appointments.
- Simultaneous booking attempts for the same slot.
- Appointment status transitions.
- Search, filtering, and pagination.

Manual testing confirms observed workflows but does not replace automated regression and concurrency tests.

## 15. Current Scope and Trade-offs

The project prioritizes a clear modular structure, authentication, role-based access, patient workflows, appointment management, and backend schedule/slot functionality.

The following items remain incomplete or require further verification:

- Dedicated Super Admin schedule-management UI.
- Server-side appointment search, filtering, sorting, and pagination.
- Automated tests for simultaneous booking and database-level conflict prevention.
- Real-time scheduler updates across connected users, unless implemented separately.

These items are documented explicitly to distinguish implemented functionality from future improvements.
