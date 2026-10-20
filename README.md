# RFID-Based Student Attendance System

> A modern, full-stack, simulation-ready university attendance portal featuring automated contactless RFID card tap verification, role-based departmental access control, and real-time attendance analytics.

---

## 📌 Overview

The **RFID-Based Student Attendance System** is an end-to-end IoT-ready application designed to streamline student identity verification and attendance tracking in educational institutions. The system integrates a **Spring Boot RESTful backend**, a **React 18 single-page application (SPA)** styled in an elegant Cream & Mauve palette, and a **Python hardware emulator** that simulates physical 13.56 MHz RFID readers (e.g., RC522 / PN532).

---

## ✨ Key Features

- **Department-Level Role-Based Access Control (RBAC)**:
  - Faculty members are scoped strictly to their respective departments (e.g., Mechanical Engineering faculty can only mark ME students; Computer Engineering faculty can only mark CE students).
  - Cross-department scan attempts are rejected at the service level with `HTTP 403 Forbidden`.
  - Head of Department (HOD) holds universal authority to mark attendance and monitor live feeds across all university branches.
- **Contactless RFID Tap Processing**:
  - Sub-second scan processing with strict idempotency: duplicate taps on the same calendar day are rejected with `HTTP 409 Conflict`.
  - Punctuality classification: scans before 09:30 AM are marked `PRESENT`, while later scans are flagged `LATE`.
  - Immediate identification of unregistered badges with `HTTP 404 Not Found`.
- **Interactive Virtual RFID Badge Scanner**:
  - Built-in browser modal allowing users to simulate smartcard taps directly from the UI without physical hardware.
  - Interactive smartcards with departmental lock indicators and direct custom tag dispatcher.
- **Real-Time Analytical Dashboard**:
  - Live metric cards tracking total enrollment, present count, punctuality split, and overall attendance percentage.
  - Real-time attendance feed updating dynamically via background polling.
- **Hardware RFID Emulator**:
  - Standalone Python CLI tool with interactive menu, auto-streaming tap modes, and direct command-line arguments.
- **Full Student Directory Management**:
  - Searchable student directory with real-time validated enrollment modal, department filtering, and cascade deletion.
- **Zero-Config Persistent Storage**:
  - Powered by Spring Data JPA and an embedded H2 database with web console inspection.

---

## 🔐 Faculty Authentication & Role-Based Access Matrix

The system enforces granular authentication at the API and UI layers:

| Role | Username | Password | Department Scope | Permissions & Enforcement |
|---|---|---|---|---|
| **ME Faculty** | `me_faculty` | `password123` | Mechanical Engineering | • View ME student directory and department metrics.<br>• Mark ME students present via RFID badge scans.<br>• **Strictly Forbidden (HTTP 403)** from scanning or viewing CE students. |
| **CE Faculty** | `ce_faculty` | `password123` | Computer Science & Engineering | • View CE student directory and department metrics.<br>• Mark CE students present via RFID badge scans.<br>• **Strictly Forbidden (HTTP 403)** from scanning or viewing ME students. |
| **Head of Dept (HOD)** | `hod` | `password123` | Universal (All Departments) | • **Unrestricted Oversight**: Can view and mark attendance for any student across all branches.<br>• Interactive department filter dropdown (All Branches, ME, CE) with live feed switching. |

> **Backend Security Enforcement**: Role and department headers (`X-Faculty-Role`, `X-Faculty-Department`) are validated on each scan. Attempting to scan a student outside the authenticated faculty's department immediately triggers an `HTTP 403 Forbidden` response.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |       React 18 + Vite Frontend        |
                                  |        http://localhost:5173          |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / REST (Fetch API)
                                                      v
+-----------------------------+           +-----------+-----------+           +------------------------------+
|   Python Hardware Simulator |  HTTP     |   Spring Boot Backend |   JPA     |   H2 In-Memory Database      |
|  (RC522 / PN532 Emulator)   | --------> |  http://localhost:8080| --------> |  jdbc:h2:mem:attendancedb    |
|   rfid_hardware_emulator.py |   POST    |                       | Hibernate |   Web Console: /h2-console   |
+-----------------------------+           +-----------------------+           +------------------------------+
```

---

## 📂 Project Structure

```
rfid-attendance-system/
├── backend/
│   ├── pom.xml                                      # Maven build specification (Spring Boot 3, JPA, H2)
│   ├── mvnw.cmd / mvnw                              # Cross-platform Maven wrapper scripts
│   └── src/main/java/com/attendance/
│       ├── AttendanceApplication.java               # Spring Boot entry point & student seed runner
│       ├── config/
│       │   └── CorsConfig.java                      # Global CORS filter for frontend integration
│       ├── model/
│       │   ├── Student.java                         # Student JPA entity (Roll No, RFID Tag, Dept)
│       │   ├── AttendanceRecord.java                # AttendanceRecord entity (ManyToOne Student)
│       │   └── AttendanceStatus.java                # Status enum (PRESENT, LATE)
│       ├── repository/
│       │   ├── StudentRepository.java               # Spring Data JPA queries for students
│       │   └── AttendanceRepository.java            # Spring Data JPA queries for attendance logs
│       ├── service/
│       │   └── AttendanceService.java               # Business logic, RBAC checks & analytics
│       └── controller/
│           ├── AuthController.java                  # Faculty login & user registry endpoints
│           ├── StudentController.java               # Student CRUD REST APIs
│           └── AttendanceController.java            # RFID scan verification & live feed APIs
│       └── resources/
│           └── application.properties               # Server port & H2 database configuration
├── frontend/
│   ├── package.json                                 # React 18, Vite, Tailwind CSS, Lucide icons
│   ├── index.html                                   # HTML shell
│   ├── vite.config.js                               # Vite build configuration & server proxy
│   ├── tailwind.config.js                           # Tailwind CSS theme configuration
│   └── src/
│       ├── main.jsx                                 # React DOM entry point
│       ├── App.jsx                                  # Application layout & authentication gating
│       ├── index.css                                # Cream, Mauve, and White design system
│       ├── context/
│       │   └── AttendanceContext.jsx                # Global state provider & REST API connector
│       └── components/
│           ├── LoginPage.jsx                        # Pure username & password faculty sign-in form
│           ├── Navbar.jsx                           # Navigation bar with department scope & branch switcher
│           ├── MetricCards.jsx                      # Real-time analytics metric cards
│           ├── StudentManagement.jsx                # Student directory with search, delete, and add modal
│           ├── AttendanceFeed.jsx                   # Live reverse-chronological attendance activity feed
│           └── RFIDSimulatorModal.jsx               # Interactive contactless RFID smartcard simulator
├── simulator/
│   └── rfid_hardware_emulator.py                    # Standalone Python hardware emulator CLI
└── docs/
    └── postman_collection.json                      # Automated Postman Collection v2.1 test suite
```

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18.0 or higher (with `npm`)
- **Python**: 3.8 or higher (with `requests` library)

---

### Step 1: Start the Backend (Spring Boot)

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

- **Backend API**: `http://localhost:8080`
- **H2 Database Console**: `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:attendancedb`
  - **User**: `sa`
  - **Password**: *(leave empty)*
- **Pre-seeded Records**: The database automatically initializes with 23 registered students across CSE, ME, and ECE.

---

### Step 2: Start the Frontend Dashboard (React + Vite)

Open a second terminal and navigate to the `frontend/` directory:

```bash
cd frontend

# Install dependencies (first run only)
npm install

# Start development server
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- Sign in with any of the faculty credentials (`me_faculty`, `ce_faculty`, or `hod` with password `password123`).

---

### Step 3: Run the RFID Hardware Simulator (Python)

Open a third terminal and run the hardware emulator script:

```bash
cd simulator

# Interactive Menu Mode (choose auto-streaming, manual tag tap, or live feed)
python rfid_hardware_emulator.py

# Automated Continuous Streaming (taps cards every 3 seconds)
python rfid_hardware_emulator.py --auto --interval 3

# Single Tag Tap as HOD (Universal Access)
python rfid_hardware_emulator.py --tag TAG-A101 --role HOD

# Single Tag Tap as ME Faculty (Authorized for ME; 403 on CE)
python rfid_hardware_emulator.py --tag TAG-E505 --role FACULTY --dept "Mechanical Engineering"
```

---

## 📡 REST API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Sample Payload |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate faculty member | `{"username": "me_faculty", "password": "password123"}` |
| `GET` | `/api/auth/users` | List available faculty accounts | *None* |

### Student Management Endpoints
| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/students` | List registered students | `?department=Mechanical+Engineering` *(optional)* |
| `GET` | `/api/students/{id}` | Get student by ID | *None* |
| `POST` | `/api/students` | Enroll a new student | Body: `{"name": "...", "rollNo": "...", "rfidTagId": "...", "department": "..."}` |
| `PUT` | `/api/students/{id}` | Update student details | Body: `{"name": "...", "rollNo": "...", "rfidTagId": "...", "department": "..."}` |
| `DELETE` | `/api/students/{id}` | Delete a student and cascade logs | *None* |
| `DELETE` | `/api/students` | Clear all students and logs | *None* |

### Attendance Endpoints
| Method | Endpoint | Description | Headers / Payload |
|---|---|---|---|
| `POST` | `/api/attendance/scan` | Process an RFID scan tap event | `{"rfidTagId": "TAG-A101"}`<br>Headers: `X-Faculty-Role`, `X-Faculty-Department` |
| `GET` | `/api/attendance/today` | Fetch today's verified attendance records | `?department=...` *(optional filter)* |
| `GET` | `/api/attendance/stats` | Compute real-time analytics & percentages | `?department=...` *(optional filter)* |

---

## 🧪 Automated API Testing

A complete **Postman Collection v2.1** is included at [`docs/postman_collection.json`](docs/postman_collection.json).

### Running in Postman:
1. Open the **Postman** application.
2. Click **Import** and select `docs/postman_collection.json`.
3. Use the **Collection Runner** to execute all tests automatically against `http://localhost:8080`.

### Running via Terminal (Newman):
```powershell
npx newman run docs/postman_collection.json
```

---

## 🛡️ Business Rules & Integrity Verification

1. **Tag Authentication**: Every scan verifies the RFID tag against the `students` table. Unregistered badges are immediately rejected with `404 Not Found`.
2. **Department Boundary Enforcement**: Scans submitted by faculty members are validated against the student's enrolled department. Out-of-scope taps return `403 Forbidden`.
3. **Duplicate Check-In Prevention**: Students may check in at most once per calendar day. Subsequent taps return `409 Conflict`.
4. **Punctuality Evaluation**: Taps recorded at or before `09:30 AM` are classified as `PRESENT`. Taps recorded after `09:30 AM` are marked as `LATE`.
5. **Relational Data Cascading**: Deleting a student cascades to remove their associated attendance history, preserving referential integrity.
