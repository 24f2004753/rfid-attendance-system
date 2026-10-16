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

/**
 * Service handling core business logic for RFID attendance processing.
 * Enforces business rules:
 * 1. Card validity check (404 if tag is not enrolled)
 * 2. Idempotency & duplicate check (prevents multiple scans on the same calendar day)
 * 3. On-time vs Late classification threshold
 * 4. Real-time metrics calculation
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    // Standard cutoff time for punctuality (e.g. 09:30 AM)
    private static final LocalTime CUTOFF_TIME = LocalTime.of(9, 30);

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Process an incoming RFID card scan event.
     * @param rfidTagId The unique hex/alphanumeric code broadcast by the card
     * @return The persisted AttendanceRecord
     */
    @Transactional
    public AttendanceRecord processScan(String rfidTagId) {
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

        // 2. Define today's time window [00:00:00 to 23:59:59.999999999]
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        // 3. Prevent duplicate check-ins for the same day
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
     * Retrieve all attendance records for the current calendar day in reverse chronological order.
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getTodayAttendance() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return attendanceRepository.findByTimestampBetweenOrderByTimestampDesc(startOfDay, endOfDay);
    }

    /**
     * Retrieve complete history of all attendance records.
     */
    @Transactional(readOnly = true)
    public List<AttendanceRecord> getAllAttendance() {
        return attendanceRepository.findAllByOrderByTimestampDesc();
    }

    /**
     * Compute real-time dashboard analytics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        long totalEnrolled = studentRepository.count();
        long totalPresentToday = attendanceRepository.countByTimestampBetween(startOfDay, endOfDay);
        long onTimeCount = attendanceRepository.countByStatusAndTimestampBetween(AttendanceStatus.PRESENT, startOfDay, endOfDay);
        long lateCount = attendanceRepository.countByStatusAndTimestampBetween(AttendanceStatus.LATE, startOfDay, endOfDay);

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
        return stats;
    }
}

