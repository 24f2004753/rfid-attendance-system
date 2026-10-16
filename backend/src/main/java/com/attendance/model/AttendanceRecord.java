package com.attendance.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * AttendanceRecord Entity representing a verified physical or simulated RFID scan event.
 * Implements Many-to-One relationship with Student (Expt 7 - ORM relationships).
 */
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    public AttendanceRecord() {
    }

    public AttendanceRecord(Student student, LocalDateTime timestamp, AttendanceStatus status) {
        this.student = student;
        this.timestamp = timestamp;
        this.status = status;
    }

    public AttendanceRecord(Long id, Student student, LocalDateTime timestamp, AttendanceStatus status) {
        this.id = id;
        this.student = student;
        this.timestamp = timestamp;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "AttendanceRecord{" +
                "id=" + id +
                ", student=" + (student != null ? student.getName() : "null") +
                ", timestamp=" + timestamp +
                ", status=" + status +
                '}';
    }
}
