package com.attendance.service;

import com.attendance.model.AttendanceRecord;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.Student;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service handling core business logic for RFID attendance processing.
 * Enforces business rules:
 * 1. Card validity check (404 if tag is not enrolled)
 * 2. Role-Based Department Access Control:
 *    - HOD can mark ANY student present across all branches.
 *    - ME Faculty can ONLY mark Mechanical Engineering students present (403 Forbidden otherwise).
 *    - CE Faculty can ONLY mark Computer Engineering students present (403 Forbidden otherwise).
 * 3. Idempotency & duplicate check (prevents multiple scans on the same calendar day)
 * 4. Punctuality status classification (PRESENT vs LATE)
 * 5. Department-filtered metrics & live feed
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    private static final LocalTime CUTOFF_TIME = LocalTime.of(9, 30);

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Backward-compatible processScan without faculty context.
     */
    @Transactional
    public AttendanceRecord processScan(String rfidTagId) {
        return processScan(rfidTagId, null, null);
    }

    /**
     * Process an incoming RFID card scan event with Role-Based Department Authorization.
     * @param rfidTagId Unique card hex/tag ID
     * @param facultyRole "HOD" or "FACULTY"
     * @param facultyDepartment "Mechanical Engineering", "Computer Science & Engineering", or "ALL"
     * @return Persisted AttendanceRecord
     */
    @Transactional
    public AttendanceRecord processScan(String rfidTagId, String facultyRole, String facultyDepartment) {
        if (rfidTagId == null || rfidTagId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RFID Tag ID cannot be null or blank");
        }

        String cleanTagId = rfidTagId.trim();

        // 1. Look up student by rfidTagId
        Student student = studentRepository.findByRfidTagId(cleanTagId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Unregistered RFID Card: Tag ID '" + cleanTagId + "' is not linked to any enrolled student."
                ));

        // 2. Department-Level Authorization Check:
        // HOD can mark anyone present across all branches.
        // ME faculty can ONLY mark ME students.
        // CE faculty can ONLY mark CE students.
        if (facultyRole != null && !facultyRole.equalsIgnoreCase("HOD")) {
            String studentDept = student.getDepartment().toLowerCase();
            String authDept = facultyDepartment != null ? facultyDepartment.toLowerCase() : "";

            boolean isAllowed = false;
            if (authDept.contains("mechanical") && studentDept.contains("mechanical")) {
                isAllowed = true;
            } else if ((authDept.contains("computer") || authDept.contains("ce")) &&
                    (studentDept.contains("computer") || studentDept.contains("ce") || studentDept.contains("cse"))) {
                isAllowed = true;
            } else if (!authDept.isEmpty() && studentDept.contains(authDept)) {
                isAllowed = true;
            }

            if (!isAllowed) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access Denied: " + facultyDepartment + " Faculty is only authorized to mark attendance for their own department. " +
                        "Student '" + student.getName() + "' is enrolled in '" + student.getDepartment() + "'."
                );
            }
        }

        // 3. Prevent duplicate check-ins for the same day
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        boolean alreadyMarked = attendanceRepository.existsByStudentAndTimestampBetween(student, startOfDay, endOfDay);
        if (alreadyMarked) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Duplicate Scan Rejected: Student " + student.getName() + " (" + student.getRollNo() + ") already checked in today."
            );
        }

        // 4. Determine status (PRESENT if <= 9:30 AM, LATE if > 9:30 AM)
        LocalDateTime now = LocalDateTime.now();
        AttendanceStatus status = now.toLocalTime().isAfter(CUTOFF_TIME) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        // 5. Create and persist the record
        AttendanceRecord record = new AttendanceRecord(student, now, status);
        return attendanceRepository.save(record);
    }

    /**
     * Retrieve all attendance records for today, optionally filtered by department.
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getTodayAttendance(String department) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<AttendanceRecord> allToday = attendanceRepository.findByTimestampBetweenOrderByTimestampDesc(startOfDay, endOfDay);

        if (department == null || department.trim().isEmpty() || department.equalsIgnoreCase("ALL")) {
            return allToday;
        }

        String filterDept = department.trim().toLowerCase();
        return allToday.stream()
                .filter(r -> r.getStudent() != null && matchesDepartment(r.getStudent().getDepartment(), filterDept))
                .collect(Collectors.toList());
    }

    /**
     * Backward-compatible getTodayAttendance.
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getTodayAttendance() {
        return getTodayAttendance(null);
    }

    /**
     * Retrieve complete history of all attendance records.
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getAllAttendance() {
        return attendanceRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Compute real-time dashboard analytics, optionally filtered by department.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStats(String department) {
        boolean isAll = (department == null || department.trim().isEmpty() || department.equalsIgnoreCase("ALL"));
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        long totalEnrolled;
        long totalPresentToday;
        long onTimeCount;
        long lateCount;

        if (isAll) {
            totalEnrolled = studentRepository.count();
            totalPresentToday = attendanceRepository.countByTimestampBetween(startOfDay, endOfDay);
            onTimeCount = attendanceRepository.countByStatusAndTimestampBetween(AttendanceStatus.PRESENT, startOfDay, endOfDay);
            lateCount = attendanceRepository.countByStatusAndTimestampBetween(AttendanceStatus.LATE, startOfDay, endOfDay);
        } else {
            String filterDept = department.trim().toLowerCase();
            List<Student> deptStudents = studentRepository.findAll().stream()
                    .filter(s -> matchesDepartment(s.getDepartment(), filterDept))
                    .collect(Collectors.toList());
            totalEnrolled = deptStudents.size();

            List<AttendanceRecord> deptTodayRecords = attendanceRepository.findByTimestampBetweenOrderByTimestampDesc(startOfDay, endOfDay).stream()
                    .filter(r -> r.getStudent() != null && matchesDepartment(r.getStudent().getDepartment(), filterDept))
                    .collect(Collectors.toList());

            totalPresentToday = deptTodayRecords.size();
            onTimeCount = deptTodayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            lateCount = deptTodayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        }

        double percentage = 0.0;
        if (totalEnrolled > 0) {
            percentage = Math.round(((double) totalPresentToday / (double) totalEnrolled) * 1000.0) / 10.0;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnrolled", totalEnrolled);
        stats.put("totalPresentToday", totalPresentToday);
        stats.put("attendancePercentage", percentage);
        stats.put("onTimeCount", onTimeCount);
        stats.put("lateCount", lateCount);
        stats.put("cutoffTime", CUTOFF_TIME.toString());
        stats.put("departmentFilter", isAll ? "ALL" : department);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStats() {
        return getAttendanceStats(null);
    }

    private boolean matchesDepartment(String studentDept, String filterDept) {
        if (studentDept == null || filterDept == null) return false;
        String s = studentDept.toLowerCase();
        String f = filterDept.toLowerCase();
        if (f.contains("mechanical") && s.contains("mechanical")) return true;
        if ((f.contains("computer") || f.contains("ce")) && (s.contains("computer") || s.contains("ce") || s.contains("cse"))) return true;
        return s.contains(f);
    }
}
