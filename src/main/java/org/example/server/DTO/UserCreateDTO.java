package org.example.server.DTO;

import lombok.Data;

@Data
public class UserCreateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String country;
    private String dateOfBirth;
    private String gender;
}
