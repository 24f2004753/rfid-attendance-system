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
     * Seeds initial student dataset with realistic RFID badges
     * to enable immediate testing across frontend, Postman, and Python emulator.
     */
    @Bean
    CommandLineRunner seedInitialData(StudentRepository studentRepository) {
        return args -> {
            if (studentRepository.count() == 0) {
                List<Student> sampleStudents = List.of(
                        new Student("Aarav Sharma", "CS2024-001", "TAG-A101", "Computer Science & Engineering"),
                        new Student("Diya Patel", "CS2024-002", "TAG-B202", "Computer Science & Engineering"),
                        new Student("Rohan Verma", "IT2024-015", "TAG-C303", "Information Technology"),
                        new Student("Ananya Iyer", "EC2024-042", "TAG-D404", "Electronics & Comm Engineering"),
                        new Student("Kabir Mehta", "ME2024-088", "TAG-E505", "Mechanical Engineering")
                );
                studentRepository.saveAll(sampleStudents);
                System.out.println(">>> [RFID System] Seeded " + sampleStudents.size() + " sample students with active RFID tags.");
            }
        };
    }
}
