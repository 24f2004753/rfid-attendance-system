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
                        // Computer Science & Engineering (CE Faculty Scope) - 11 Students
                        new Student("Aarav Sharma", "CS2024-001", "TAG-A101", "Computer Science & Engineering"),
                        new Student("Diya Patel", "CS2024-002", "TAG-B202", "Computer Science & Engineering"),
                        new Student("Rohan Verma", "CS2024-003", "TAG-C303", "Computer Science & Engineering"),
                        new Student("Ishaan Gupta", "CS2024-004", "TAG-C304", "Computer Science & Engineering"),
                        new Student("Tanvi Deshmukh", "CS2024-005", "TAG-C305", "Computer Science & Engineering"),
                        new Student("Aditya Nambiar", "CS2024-006", "TAG-C306", "Computer Science & Engineering"),
                        new Student("Rhea Kapoor", "CS2024-007", "TAG-C307", "Computer Science & Engineering"),
                        new Student("Vikramaditya Sen", "CS2024-008", "TAG-C308", "Computer Science & Engineering"),
                        new Student("Meera Chawla", "CS2024-009", "TAG-C309", "Computer Science & Engineering"),
                        new Student("Devansh Singhal", "CS2024-010", "TAG-C310", "Computer Science & Engineering"),
                        new Student("Anushka Saxena", "CS2024-011", "TAG-C311", "Computer Science & Engineering"),

                        // Mechanical Engineering (ME Faculty Scope) - 10 Students
                        new Student("Kabir Mehta", "ME2024-088", "TAG-E505", "Mechanical Engineering"),
                        new Student("Priya Nair", "ME2024-089", "TAG-E506", "Mechanical Engineering"),
                        new Student("Arjun Das", "ME2024-090", "TAG-E507", "Mechanical Engineering"),
                        new Student("Siddharth Rao", "ME2024-091", "TAG-E508", "Mechanical Engineering"),
                        new Student("Rishi Kulkarni", "ME2024-092", "TAG-E509", "Mechanical Engineering"),
                        new Student("Pooja Hegde", "ME2024-093", "TAG-E510", "Mechanical Engineering"),
                        new Student("Gaurav Reddy", "ME2024-094", "TAG-E511", "Mechanical Engineering"),
                        new Student("Shruti Menon", "ME2024-095", "TAG-E512", "Mechanical Engineering"),
                        new Student("Harshavardhan Joshi", "ME2024-096", "TAG-E513", "Mechanical Engineering"),
                        new Student("Kavya Pillai", "ME2024-097", "TAG-E514", "Mechanical Engineering"),

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
