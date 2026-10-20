package com.attendance;

import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

/**
 * Main Spring Boot Application Entry Point for RFID Attendance System.
 * Coordinates RESTful Web Layer, Service Layer, and Spring Data JPA Repository.
 */
@SpringBootApplication
public class AttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AttendanceApplication.class, args);
    }

    /**
     * Seeds initial student dataset with active RFID keycards across departments
     * for testing ME faculty, CE faculty, and universal HOD permissions.
     */
    @Bean
    CommandLineRunner seedInitialData(StudentRepository studentRepository) {
        return args -> {
            if (studentRepository.count() == 0) {
                List<Student> sampleStudents = List.of(
                        // Computer Science & Engineering (CE Faculty Scope)
                        new Student("Aarav Sharma", "CS2024-001", "TAG-A101", "Computer Science & Engineering"),
                        new Student("Diya Patel", "CS2024-002", "TAG-B202", "Computer Science & Engineering"),
                        new Student("Rohan Verma", "CS2024-003", "TAG-C303", "Computer Science & Engineering"),
                        new Student("Ishaan Gupta", "CS2024-004", "TAG-C304", "Computer Science & Engineering"),

                        // Mechanical Engineering (ME Faculty Scope)
                        new Student("Kabir Mehta", "ME2024-088", "TAG-E505", "Mechanical Engineering"),
                        new Student("Priya Nair", "ME2024-089", "TAG-E506", "Mechanical Engineering"),
                        new Student("Arjun Das", "ME2024-090", "TAG-E507", "Mechanical Engineering"),
                        new Student("Siddharth Rao", "ME2024-091", "TAG-E508", "Mechanical Engineering"),

                        // Electronics & Comm Engineering (Universal HOD Scope)
                        new Student("Ananya Iyer", "EC2024-042", "TAG-D404", "Electronics & Comm Engineering"),
                        new Student("Neha Kulkarni", "EC2024-043", "TAG-D405", "Electronics & Comm Engineering")
                );
                studentRepository.saveAll(sampleStudents);
                System.out.println(">>> [RFID System] Seeded " + sampleStudents.size() + " students with active RFID tags.");
            }
        };
    }
}
