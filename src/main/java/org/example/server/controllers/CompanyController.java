package org.example.server.controllers;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.CompanyCreateDTO;
import org.example.server.models.Company;
import org.example.server.service.CompanyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService){
        this.companyService = companyService;
    }


    @PostMapping ("/api/create-company")
    @ResponseBody
    public ResponseEntity<?> createCompany(@RequestBody CompanyCreateDTO companyCreateDTO) {
        try{
            log.warn("Request " + companyCreateDTO);
            
            // Валидация входных данных
            if (companyCreateDTO.getName() == null || companyCreateDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"message\": \"Название компании не может быть пустым\"}");
            }
            
            Company company = new Company();
            company.setName(companyCreateDTO.getName().trim());
            companyService.saveCompany(company);
            log.info("Created company: {}", company.getName());
            return ResponseEntity.ok("{\"message\": \"Компания успешно создана\"}");
        }
        catch (Exception e) {
            log.error("Error creating company: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка в создании компании\"}");
        }
    }
}
