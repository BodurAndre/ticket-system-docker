package org.example.server.controllers;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.PhoneNumberCreateDTO;
import org.example.server.models.Company;
import org.example.server.models.PhoneNumber;
import org.example.server.service.CompanyService;
import org.example.server.service.PhoneNumberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@Slf4j
public class PhoneNumberController {
    private final PhoneNumberService phoneNumberService;
    private final CompanyService companyService;

    public PhoneNumberController(PhoneNumberService phoneNumberService, CompanyService companyService) {
        this.phoneNumberService = phoneNumberService;
        this.companyService = companyService;
    }

    @PostMapping("/api/create-phoneNumber")
    @ResponseBody
    public ResponseEntity<?> createPhoneNumber(@RequestBody PhoneNumberCreateDTO phoneNumberCreateDTO) {
        try {
            log.warn("Request " + phoneNumberCreateDTO);
            
            // Валидация входных данных
            if (phoneNumberCreateDTO.getCompanyID() == null) {
                return ResponseEntity.badRequest().body("{\"message\": \"ID компании не может быть пустым\"}");
            }
            
            if (phoneNumberCreateDTO.getNumber() == null || phoneNumberCreateDTO.getNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"message\": \"Номер телефона не может быть пустым\"}");
            }
            
            Company company = companyService.getCompanyById(phoneNumberCreateDTO.getCompanyID());
            if (company == null) {
                return ResponseEntity.badRequest().body("{\"message\": \"Компания с ID " + phoneNumberCreateDTO.getCompanyID() + " не найдена\"}");
            }
            
            PhoneNumber phoneNumber = new PhoneNumber();
            phoneNumber.setCompany(company);
            phoneNumber.setNumber(phoneNumberCreateDTO.getNumber().trim());
            phoneNumber = phoneNumberService.savePhoneNumber(phoneNumber);
            log.info("Created phone number: {} for company: {}", phoneNumber.getNumber(), company.getName());
            return ResponseEntity.ok("{\"message\": \"Номер телефона успешно создан\"}");
        } catch (Exception e) {
            log.error("Error creating phone number: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка в создании номера телефона\"}");
        }
    }

    @GetMapping("/api/phoneNumbers/{companyId}")
    @ResponseBody
    public ResponseEntity<?> getPhoneNumbersByCompany(@PathVariable Long companyId) {
        try {
            log.info("Getting phone numbers for company ID: {}", companyId);
            List<PhoneNumber> phoneNumbers = phoneNumberService.getPhoneNumbersByCompanyId(companyId);
            return ResponseEntity.ok(phoneNumbers);
        } catch (Exception e) {
            log.error("Error getting phone numbers: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при получении номеров телефонов\"}");
        }
    }
}

