package com.attendance.repository;

import com.attendance.model.AttendanceRecord;
import com.attendance.model.AttendanceStatus;
import com.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA Repository for AttendanceRecord entity.
 * Fulfills Expt 7 persistent queries and relationship querying.
 */
@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    List<AttendanceRecord> findAllByOrderByTimestampDesc();

    boolean existsByStudentAndTimestampBetween(Student student, LocalDateTime start, LocalDateTime end);

    long countByTimestampBetween(LocalDateTime start, LocalDateTime end);

    long countByStatusAndTimestampBetween(AttendanceStatus status, LocalDateTime start, LocalDateTime end);

    void deleteByStudent(Student student);
}

