package com.attendance.controller;

import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * RESTful API Controller for Student CRUD operations.
 * Fulfills Expt 1 (REST Architecture) & Expt 6 (Spring Boot CRUD).
 */
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"})
public class StudentController {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * GET /api/students - Retrieve registered students (optionally filtered by department)
     */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String department) {
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(studentRepository.findByDepartmentContainingIgnoreCase(department.trim()));
        }
        return ResponseEntity.ok(studentRepository.findAll());
    }

    /**
     * GET /api/students/{id} - Retrieve student by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with ID: " + id));
        return ResponseEntity.ok(student);
    }

    /**
     * POST /api/students - Register a new student with unique RFID tag and Roll Number
     */
    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        if (studentRepository.existsByRollNo(student.getRollNo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Roll number '" + student.getRollNo() + "' is already registered");
        }
        if (studentRepository.existsByRfidTagId(student.getRfidTagId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFID Tag ID '" + student.getRfidTagId() + "' is already assigned to another student");
        }
        Student savedStudent = studentRepository.save(student);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    /**
     * PUT /api/students/{id} - Update an existing student's details
     */
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @Valid @RequestBody Student updatedStudent) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with ID: " + id));

        // Check rollNo uniqueness if changed
        if (!existingStudent.getRollNo().equalsIgnoreCase(updatedStudent.getRollNo()) &&
                studentRepository.existsByRollNo(updatedStudent.getRollNo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Roll number '" + updatedStudent.getRollNo() + "' already exists");
        }

        // Check rfidTagId uniqueness if changed
        if (!existingStudent.getRfidTagId().equalsIgnoreCase(updatedStudent.getRfidTagId()) &&
                studentRepository.existsByRfidTagId(updatedStudent.getRfidTagId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFID Tag ID '" + updatedStudent.getRfidTagId() + "' is already assigned");
        }

        existingStudent.setName(updatedStudent.getName());
        existingStudent.setRollNo(updatedStudent.getRollNo());
        existingStudent.setRfidTagId(updatedStudent.getRfidTagId());
        existingStudent.setDepartment(updatedStudent.getDepartment());

        Student saved = studentRepository.save(existingStudent);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/students/{id} - Delete a student record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

