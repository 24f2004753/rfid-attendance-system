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
 * Fulfills Expt 1 (REST Architecture) & Expt 6 (Spring Boot Attendance APIs).
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
     * DTO for incoming RFID tap payload.
     */
    public static class ScanRequest {
        @NotBlank(message = "RFID Tag ID is required")
        private String rfidTagId;

        public ScanRequest() {}

        public ScanRequest(String rfidTagId) {
            this.rfidTagId = rfidTagId;
        }

        public String getRfidTagId() {
            return rfidTagId;
        }

        public void setRfidTagId(String rfidTagId) {
            this.rfidTagId = rfidTagId;
        }
    }

    /**
     * POST /api/attendance/scan - Process RFID tap event
     */
    @PostMapping("/scan")
    public ResponseEntity<AttendanceRecord> processScan(@RequestBody ScanRequest request) {
        if (request == null || request.getRfidTagId() == null || request.getRfidTagId().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        AttendanceRecord record = attendanceService.processScan(request.getRfidTagId());
        return new ResponseEntity<>(record, HttpStatus.CREATED);
    }

    /**
     * GET /api/attendance/today - Get attendance records for the current day
     */
    @GetMapping("/today")
    public ResponseEntity<List<AttendanceRecord>> getTodayAttendance() {
        return ResponseEntity.ok(attendanceService.getTodayAttendance());
    }

    /**
     * GET /api/attendance - Get all historical attendance records
     */
    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    /**
     * GET /api/attendance/stats - Get real-time metric analytics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAttendanceStats() {
        return ResponseEntity.ok(attendanceService.getAttendanceStats());
    }
}

