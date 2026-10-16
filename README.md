# RFID-Based Student Attendance System (Simulation-Ready)
> **Academic Full-Stack Engineering Course &bull; Laboratory Implementation**  
> *Production-Ready University IoT Architecture for Student Verification & Real-Time Analytics*

---

## 📋 Academic Laboratory Experiments Mapping Table

This project is architected and implemented to satisfy the learning outcomes of the five required university laboratory experiments:

| Experiment # | Learning Outcome | Focus Domain | Concrete Implementation Files | How Requirement is Fulfilled |
|---|---|---|---|---|
| **Expt 1** | **LO1**: Core Web & Mobile Development Concepts | REST API Architecture & Testing | • `docs/postman_collection.json`<br>• `backend/.../controller/`<br>• `simulator/rfid_hardware_emulator.py` | Implementation of standard RESTful HTTP methods (GET, POST, PUT, DELETE), JSON payloads, stateless request-response model, HTTP status codes (200, 201, 204, 404, 409), and an automated Postman Collection v2.1 with assertions. |
| **Expt 2** | **LO2**: Front-End Development with React | UI Components, JSX & Dynamic Rendering | • `frontend/src/App.jsx`<br>• `frontend/src/components/Navbar.jsx`<br>• `frontend/src/components/MetricCards.jsx`<br>• `frontend/src/components/AttendanceFeed.jsx` | Modular component hierarchy, responsive UI styled with Tailwind CSS, JSX templates, live data tables, conditional status chips, dynamic progress bars, and reactive metric cards. |
| **Expt 3** | **LO2**: Front-End Development with React | State Management, Hooks & Form Validation | • `frontend/src/context/AttendanceContext.jsx`<br>• `frontend/src/components/StudentManagement.jsx`<br>• `frontend/src/components/RFIDSimulatorModal.jsx` | Centralized state management using React Context API + custom hook `useAttendance()`, React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`), controlled form inputs with real-time validation (uniqueness, empty checks, length), and interactive RFID badge simulator. |
| **Expt 6** | **LO4**: Backend Development | Spring Boot RESTful Web Services | • `backend/.../controller/StudentController.java`<br>• `backend/.../controller/AttendanceController.java`<br>• `backend/.../service/AttendanceService.java` | Spring Web MVC controllers providing full Student CRUD (`/api/students`), RFID scan ingestion (`/api/attendance/scan`), attendance logs (`/api/attendance/today`), and real-time statistics (`/api/attendance/stats`), with business rules (duplicate prevention, late threshold). |
| **Expt 7** | **LO4**: Backend Development | Spring Data JPA / Hibernate Persistence | • `backend/.../model/Student.java`<br>• `backend/.../model/AttendanceRecord.java`<br>• `backend/.../repository/StudentRepository.java`<br>• `backend/.../repository/AttendanceRepository.java` | ORM entity mapping with Jakarta Persistence annotations (`@Entity`, `@Table`, `@Id`, `@GeneratedValue`), Relational `@ManyToOne` association between `AttendanceRecord` and `Student`, unique database constraints, Spring Data JPA repository derived queries, and zero-config H2 persistence. |

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |     Vite + React 18+ Frontend         |
                                  |       http://localhost:5173           |
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

## 📂 Project File Tree

```
rfid-attendance-system/
├── backend/
│   ├── pom.xml                                      # Maven build config (Spring Boot 3, Data JPA, H2)
│   ├── mvnw.cmd / mvnw                              # Cross-platform Maven wrapper scripts
│   └── src/main/java/com/attendance/
│       ├── AttendanceApplication.java               # Spring Boot entry point & initial data seeder
│       ├── config/
│       │   └── CorsConfig.java                      # Global CORS configuration for React frontend
│       ├── model/
│       │   ├── Student.java                         # Student JPA Entity (PK, Roll No, RFID Tag, Dept)
│       │   ├── AttendanceRecord.java                # AttendanceRecord JPA Entity (ManyToOne Student)
│       │   └── AttendanceStatus.java                # Enum (PRESENT, LATE)
│       ├── repository/
│       │   ├── StudentRepository.java               # Spring Data JPA Repository for Students
│       │   └── AttendanceRepository.java            # Spring Data JPA Repository for Attendance
│       ├── service/
│       │   └── AttendanceService.java               # Business logic (idempotency, duplicate check, stats)
│       └── controller/
│           ├── StudentController.java               # RESTful CRUD: GET, POST, PUT, DELETE /api/students
│           └── AttendanceController.java            # Scan verification, live feed & stats APIs
│       └── resources/
│           └── application.properties               # H2 database & server configuration
├── frontend/
│   ├── package.json                                 # React 18, Vite, Tailwind CSS, Lucide icons
│   ├── index.html                                   # HTML5 shell with Google Inter/JetBrains fonts
│   ├── vite.config.js                               # Vite bundler configuration & backend proxy
│   ├── tailwind.config.js                           # Tailwind utility setup
│   └── src/
│       ├── main.jsx                                 # React DOM root entry
│       ├── App.jsx                                  # Master layout, toast notifications & tab views
│       ├── index.css                                # Glassmorphism & holographic RFID badge styles
│       ├── context/
│       │   └── AttendanceContext.jsx                # Global state (students, logs, stats, actions)
│       └── components/
│           ├── Navbar.jsx                           # Lab badges, live polling switch, scanner modal CTA
│           ├── MetricCards.jsx                      # Enrolled, present today, percentage, punctuality
│           ├── StudentManagement.jsx                # Search, table, delete, validated Add Student modal
│           ├── AttendanceFeed.jsx                   # Today's live log feed with status filters
│           └── RFIDSimulatorModal.jsx               # Interactive virtual smartcards & custom tag tester
├── simulator/
│   └── rfid_hardware_emulator.py                    # Standalone Python CLI & auto-stream card emulator
├── docs/
│   └── postman_collection.json                      # Postman Collection v2.1 with tests & assertions
└── README.md                                        # Master documentation & lab compliance report
```

---

## 🚀 Execution Instructions (Step-by-Step)

To run the complete full-stack environment concurrently, open **three terminal windows**:

### 1. Terminal 1: Start the Spring Boot Backend

```bash
# Navigate to backend directory
cd backend

# Option A: If Maven is installed in your PATH
mvn spring-boot:run

# Option B: Using the included wrapper script (Windows)
.\mvnw.cmd spring-boot:run

# Option C: Using the included wrapper script (Linux/macOS)
./mvnw spring-boot:run
```

* Backend will start at: `http://localhost:8080`
* H2 Database Web Console: `http://localhost:8080/h2-console`
  * **JDBC URL**: `jdbc:h2:mem:attendancedb`
  * **User Name**: `sa`
  * **Password**: *(leave blank)*
* Pre-seeded students: 5 sample students across CS, IT, EC, and ME departments are automatically populated upon launch.

---

### 2. Terminal 2: Start the React Frontend (Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (only required on first setup)
npm install

# Start Vite development server
npm run dev
```

* Frontend dashboard will be live at: `http://localhost:5173`
* Features:
  * **Live Polling**: Automatically refreshes today's attendance every 3 seconds.
  * **Interactive Badge Scanner**: Click the **"RFID Badge Scanner"** button to simulate physical contactless smartcard taps directly from the browser.
  * **Form Validation**: Click **"Add Student"** to test real-time validation rules (prevents empty inputs and duplicate roll numbers/tags).

---

### 3. Terminal 3: Run the Hardware RFID Simulator (Python)

The simulator uses the Python `requests` library to emulate physical 13.56 MHz RFID sensor broadcasts:

```bash
# Navigate to simulator directory
cd simulator

# Interactive Menu Mode (Choose between auto-stream, manual tag tap, stress test, or view feed)
python rfid_hardware_emulator.py

# OR: Automated Continuous Streaming Mode (Taps student badges every 3 seconds)
python rfid_hardware_emulator.py --auto --interval 3

# OR: Instant Single-Tag Test
python rfid_hardware_emulator.py --tag TAG-A101
```

---

## 🧪 Postman API Verification (Expt 1 Compliance)

1. Open **Postman**.
2. Click **Import** &bull; select `docs/postman_collection.json`.
3. Pre-configured endpoints included in the collection:
   * `GET {{baseUrl}}/api/students` &bull; List all registered students
   * `GET {{baseUrl}}/api/students/1` &bull; Fetch student by ID
   * `POST {{baseUrl}}/api/students` &bull; Enroll new student with validation
   * `PUT {{baseUrl}}/api/students/1` &bull; Update student record
   * `DELETE {{baseUrl}}/api/students/5` &bull; Delete student record
   * `POST {{baseUrl}}/api/attendance/scan` &bull; Valid card tap (HTTP 201)
   * `POST {{baseUrl}}/api/attendance/scan` &bull; Duplicate scan rejection test (HTTP 409)
   * `POST {{baseUrl}}/api/attendance/scan` &bull; Unregistered tag test (HTTP 404)
   * `GET {{baseUrl}}/api/attendance/today` &bull; Today's verified feed
   * `GET {{baseUrl}}/api/attendance/stats` &bull; Analytical metrics computation
4. Run the collection runner to execute all assertions and test scripts automatically.

---

## 🛡️ Business Logic & Error Handling Rules

1. **Card Authentication (404 Not Found)**:
   * When an RFID tag is tapped, the backend verifies if the tag is registered in the `students` table.
   * If unregistered, the server immediately returns `404 Not Found` with an informative error message.
2. **Duplicate Prevention / Idempotency (409 Conflict)**:
   * A student can only be checked in **once per calendar day** (`00:00:00` to `23:59:59`).
   * Subsequent taps on the same day are rejected with `409 Conflict`, preserving data integrity.
3. **Punctuality Classification**:
   * Scans recorded on or before `09:30 AM` are classified as `PRESENT`.
   * Scans recorded after `09:30 AM` are classified as `LATE`.
4. **Real-Time Analytics Calculation**:
   * Total enrolled students, total present today, punctuality split, and overall attendance percentage are calculated dynamically.

---

## 👥 University Lab Course Submission

* **Project Title**: RFID-Based Attendance System (Simulation-Ready)
* **Status**: Complete & Production-Ready
* **Turnaround Window**: Completed within 24 hours
* **Target Platforms**: Windows, macOS, Linux