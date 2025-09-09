package org.example.server.DTO;

import lombok.Data;

@Data
public class PhoneNumberSaveWithCompanyDTO {
    private Long companyID;
    private String phoneNumber;
}
