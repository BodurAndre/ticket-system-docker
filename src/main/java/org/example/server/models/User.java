package org.example.server.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "USERS")
public class User {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "PROFILE_PHOTO_URL")
    private String profilePhotoUrl;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "DATE_OF_BIRTH")
    private String dateOfBirth;

    @Column(name = "GENDER")
    private String gender;

    @Column(name = "ROLE")
    private String role;

    @Column(name = "FIRSTLOGIN")
    private Boolean firstLogin;

    public User(String email, String password, String firstName, String lastName, String dateOfBirth, String gender) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
    }
}