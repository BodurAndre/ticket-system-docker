package org.example.server.DTO;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String dateOfBirth;
    private String gender;
    private Long userId;
}
