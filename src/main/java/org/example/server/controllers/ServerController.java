package org.example.server.controllers;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.ServerSaveWithCompanyDTO;
import org.example.server.models.Company;
import org.example.server.models.Server;
import org.example.server.service.CompanyService;
import org.example.server.service.ServerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@Slf4j
public class ServerController {
    private final ServerService serverService;
    private final CompanyService companyService;

    public ServerController(ServerService serverService, CompanyService companyService){
        this.serverService = serverService;
        this.companyService = companyService;
    }

    @PostMapping("/api/create-server")
    @ResponseBody
    public ResponseEntity<?> createServer(@RequestBody ServerSaveWithCompanyDTO serverSaveWithCompanyDTO) {
        try{
            log.warn("Request " + serverSaveWithCompanyDTO);
            
            // Валидация входных данных
            if (serverSaveWithCompanyDTO.getCompanyID() == null) {
                return ResponseEntity.badRequest().body("{\"message\": \"ID компании не может быть пустым\"}");
            }
            
            if (serverSaveWithCompanyDTO.getServerName() == null || serverSaveWithCompanyDTO.getServerName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"message\": \"Название сервера не может быть пустым\"}");
            }
            
            Company company = companyService.getCompanyById(serverSaveWithCompanyDTO.getCompanyID());
            if (company == null) {
                return ResponseEntity.badRequest().body("{\"message\": \"Компания с ID " + serverSaveWithCompanyDTO.getCompanyID() + " не найдена\"}");
            }
            
            Server server = new Server();
            server.setCompany(company);
            server.setName(serverSaveWithCompanyDTO.getServerName().trim());
            server = serverService.saveServer(server);
            log.info("Created server: {} for company: {}", server.getName(), company.getName());
            return ResponseEntity.ok("{\"message\": \"Сервер успешно создан\"}");
        }
        catch (Exception e) {
            log.error("Error creating server: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка в создании сервера\"}");
        }
    }

}