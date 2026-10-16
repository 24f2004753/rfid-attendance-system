package com.attendance.repository;

import com.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Student entity.
 * Fulfills Expt 7 persistent database integration requirements.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRfidTagId(String rfidTagId);

    Optional<Student> findByRollNo(String rollNo);

    boolean existsByRollNo(String rollNo);

    boolean existsByRfidTagId(String rfidTagId);

    List<Student> findByDepartmentContainingIgnoreCase(String department);
}
