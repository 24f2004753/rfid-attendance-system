package com.attendance.controller;

import com.attendance.model.AttendanceRecord;
import com.attendance.service.AttendanceService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RESTful API Controller for Attendance verification, live feed, and real-time statistics.
 * Supports Role-Based Faculty Authorization (ME, CE, HOD).
 */
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * DTO for incoming RFID tap payload with optional Faculty authorization context.
     */
    public static class ScanRequest {
        @NotBlank(message = "RFID Tag ID is required")
        private String rfidTagId;

        private String facultyRole; // "HOD" or "FACULTY"
        private String facultyDepartment; // "Mechanical Engineering", "Computer Science & Engineering", etc.

        public ScanRequest() {}

        public ScanRequest(String rfidTagId) {
            this.rfidTagId = rfidTagId;
        }

        public ScanRequest(String rfidTagId, String facultyRole, String facultyDepartment) {
            this.rfidTagId = rfidTagId;
            this.facultyRole = facultyRole;
            this.facultyDepartment = facultyDepartment;
        }

        public String getRfidTagId() {
            return rfidTagId;
        }

        public void setRfidTagId(String rfidTagId) {
            this.rfidTagId = rfidTagId;
        }

        public String getFacultyRole() {
            return facultyRole;
        }

        public void setFacultyRole(String facultyRole) {
            this.facultyRole = facultyRole;
        }

        public String getFacultyDepartment() {
            return facultyDepartment;
        }

        public void setFacultyDepartment(String facultyDepartment) {
            this.facultyDepartment = facultyDepartment;
        }
    }

    /**
     * POST /api/attendance/scan - Process RFID tap event with department access checks
     */
    @PostMapping("/scan")
    public ResponseEntity<AttendanceRecord> processScan(
            @RequestBody ScanRequest request,
            @RequestHeader(value = "X-Faculty-Role", required = false) String headerRole,
            @RequestHeader(value = "X-Faculty-Department", required = false) String headerDept
    ) {
        if (request == null || request.getRfidTagId() == null || request.getRfidTagId().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String effectiveRole = request.getFacultyRole() != null ? request.getFacultyRole() : headerRole;
        String effectiveDept = request.getFacultyDepartment() != null ? request.getFacultyDepartment() : headerDept;

        AttendanceRecord record = attendanceService.processScan(request.getRfidTagId(), effectiveRole, effectiveDept);
        return new ResponseEntity<>(record, HttpStatus.CREATED);
    }

    /**
     * GET /api/attendance/today - Get attendance records for today (optionally filtered by department)
     */
    @GetMapping("/today")
    public ResponseEntity<List<AttendanceRecord>> getTodayAttendance(
            @RequestParam(required = false) String department
    ) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(department));
    }

    /**
     * GET /api/attendance - Get all historical attendance records
     */
    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    /**
     * GET /api/attendance/stats - Get real-time metrics (optionally filtered by department)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAttendanceStats(
            @RequestParam(required = false) String department
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceStats(department));
    }
}
