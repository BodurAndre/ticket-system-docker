package org.example.server.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
}
