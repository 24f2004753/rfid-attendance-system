package com.attendance.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Student Entity representing enrolled students in the University Lab system.
 * Implements persistent entity mapping using Spring Data JPA / Hibernate (Expt 7).
 */
@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = "rollNo"),
    @UniqueConstraint(columnNames = "rfidTagId")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student name cannot be empty")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Roll number cannot be empty")
    @Column(nullable = false, unique = true)
    private String rollNo;

    @NotBlank(message = "RFID Tag ID cannot be empty")
    @Column(nullable = false, unique = true)
    private String rfidTagId;

    @NotBlank(message = "Department cannot be empty")
    @Column(nullable = false)
    private String department;

    public Student() {
    }

    public Student(String name, String rollNo, String rfidTagId, String department) {
        this.name = name;
        this.rollNo = rollNo;
        this.rfidTagId = rfidTagId;
        this.department = department;
    }

    public Student(Long id, String name, String rollNo, String rfidTagId, String department) {
        this.id = id;
        this.name = name;
        this.rollNo = rollNo;
        this.rfidTagId = rfidTagId;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getRfidTagId() {
        return rfidTagId;
    }

    public void setRfidTagId(String rfidTagId) {
        this.rfidTagId = rfidTagId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", rollNo='" + rollNo + '\'' +
                ", rfidTagId='" + rfidTagId + '\'' +
                ", department='" + department + '\'' +
                '}';
    }
}
