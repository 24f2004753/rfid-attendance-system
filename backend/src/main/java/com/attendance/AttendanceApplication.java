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
     * Initial student seeder - currently disabled to keep database clean.
     * Can be uncommented if sample demo students are ever required.
     */
    @Bean
    CommandLineRunner seedInitialData(StudentRepository studentRepository) {
        return args -> {
            // Seeding disabled: Database starts empty
            System.out.println(">>> [RFID System] Initialized with empty student database.");
        };
    }
}
