package org.example.server.controllers;

import lombok.extern.slf4j.Slf4j;
import org.example.server.DTO.CompanyDTO;
import org.example.server.DTO.RequestDTO;
import org.example.server.DTO.RequestListDTO;
import org.example.server.DTO.RequestUpdateDTO;
import org.example.server.DTO.ServerDTO;
import org.example.server.DTO.FilterRequestDTO;
import org.example.server.models.Company;
import org.example.server.models.Request;
import org.example.server.models.Server;
import org.example.server.models.User;
import org.example.server.service.CompanyService;
import org.example.server.service.RequestService;
import org.example.server.service.ServerService;
import org.example.server.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Controller
@Slf4j
public class SupportController {

    private final RequestService requestService;
    private final UserService userService;
    private final CompanyService companyService;
    private final ServerService serverService;

    public SupportController(RequestService requestService, UserService userService, 
                           CompanyService companyService, ServerService serverService) {
        this.requestService = requestService;
        this.userService = userService;
        this.companyService = companyService;
        this.serverService = serverService;
    }

    /*NEW Version*/

    @GetMapping(value = "/requests", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> requests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean isAdmin = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isProcessor = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_PROCESSOR"));

        List<Request> requestList;

        if (isAdmin) {
            requestList = requestService.getAllRequests();
        } else {
            String email;
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            requestList = requestService.getRequestsByCreatorEmail(email);
        }

        List<RequestListDTO> dtoList = requestList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        log.warn("RequestListOpen" + dtoList);
        return ResponseEntity.ok(dtoList);
    }

    /*NEW Version*/

    @GetMapping(value = "/getRequestsOpen", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getRequestsOpen() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean isAdmin = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        List<Request> requestList;

        if (isAdmin) {
            requestList = requestService.getAllRequestsWithStatusOpen();
        } else {
            String email;
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            requestList = requestService.getOpenRequestsByCreatorEmail(email);
        }

        List<RequestListDTO> dtoList = requestList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        log.warn("RequestListOpen" + dtoList);
        return ResponseEntity.ok(dtoList);
    }



    @GetMapping(value = "/getRequestsClose", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getRequestsClose() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean isAdmin = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        List<Request> requestList;

        if (isAdmin) {
            requestList = requestService.getAllRequestsWithStatusClose();
        } else {
            String email;
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            log.warn("Email " + email);
            requestList = requestService.getCloseRequestsByCreatorEmail(email);
        }

        List<RequestListDTO> dtoList = requestList.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        log.warn("RequestListClosed" + dtoList);
        return ResponseEntity.ok(dtoList);
    }


    @GetMapping(value = "/getRequest/{id}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getRequest(@PathVariable long id) {
        Request request = requestService.getRequest(id);

        if (request == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Не найдена заявка");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь не аутентифицирован");
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        boolean isAdmin = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        boolean isUser = authorities.stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));

        RequestListDTO requestListDTO = mapToDTO(request);
        if (isAdmin) {
            return ResponseEntity.ok(requestListDTO);
        } else {
            String email;
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetails) {
                email = ((UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            log.warn("Email " + email);
            if (isUser && requestListDTO.getCreateUser().getEmail().equals(email)){
                return ResponseEntity.ok(requestListDTO);
            }
            else return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Недостаточно прав для доступа");
        }
    }


    @PostMapping("/RequestCreate")
    public ResponseEntity<?> createRequest(@RequestBody RequestDTO requestDTO) {
        try {
            // Получение текущего авторизованного пользователя
            log.warn("Request " + requestDTO);
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username;

            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }

            // Поиск пользователя, создавшего заявку
            User creator = userService.getUserByEmail(username);

            // Маппинг DTO -> Entity
            Request request = new Request();
            request.setData(requestDTO.getData());
            request.setTime(requestDTO.getTime());
            request.setTema(requestDTO.getTema());
            request.setStatus(requestDTO.getStatus());
            request.setPriority(requestDTO.getPriority());
            request.setDescription(requestDTO.getDescription());
            request.setContacts(requestDTO.getContacts());
            request.setCreateUser(creator);

            // Устанавливаем компанию
            if (requestDTO.getCompanyId() != null) {
                Company company = companyService.getCompanyById(requestDTO.getCompanyId());
                request.setCompany(company);
            }

            // Устанавливаем сервер
            if (requestDTO.getServerId() != null) {
                Server server = serverService.getServerById(requestDTO.getServerId());
                request.setServer(server);
            }

            // Назначаем исполнителя, если передан корректный ID
            if (requestDTO.getAssigneeUserId() != null) {
                User assignee = userService.getUser(requestDTO.getAssigneeUserId());
                if (assignee != null) {
                    request.setAssigneeUser(assignee);
                } else {
                    log.warn("Исполнитель с ID " + requestDTO.getAssigneeUserId() + " не найден");
                }
            }

            // Сохраняем
            Request savedRequest = requestService.setRequest(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Заявка создана");
            response.put("id", savedRequest != null ? savedRequest.getId() : null);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Ошибка в создании заявки\"}");
        }
    }


    @PostMapping("/requestClose")
    public ResponseEntity<String> closeRequest(@RequestBody long id) {
        try {
            log.info("ID request", id);
            
            // Получаем текущего пользователя
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username;
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
            User currentUser = userService.getUserByEmail(username);
            
            // Получаем заявку и устанавливаем кто закрыл
            Request request = requestService.getRequest(id);
            if (request != null) {
                request.setClosedByUser(currentUser);
                requestService.setRequest(request);
            }
            
            requestService.closeRequest(id);
            return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\": \"Заявка закрыта\"}");
        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Ошибка в закрытии заявки\"}");
        }
    }


    @PostMapping("/updateRequest")
    public ResponseEntity<String> updateRequest(@RequestBody RequestUpdateDTO requestData) {
        try {
            log.warn("requestData - " + requestData);
            log.warn("assigneeUserId - " + requestData.getAssigneeUserId());

            // Получаем заявку
            Request request = requestService.getRequest(requestData.getRequestId());
            if (request == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"message\": \"Заявка не найдена\"}");
            }

            // Обновляем поля заявки
            request.setTema(requestData.getTema());
            request.setPriority(requestData.getPriority());
            request.setDescription(requestData.getDescription());
            request.setContacts(requestData.getContacts());

            // Назначаем пользователя, если передан корректный ID
            if (requestData.getAssigneeUserId() != null) {
                User user = userService.getUser(requestData.getAssigneeUserId());
                if (user != null) {
                    request.setAssigneeUser(user);
                    log.warn("Назначен пользователь: " + user.getFirstName() + " " + user.getLastName());
                } else {
                    log.warn("Пользователь с ID " + requestData.getAssigneeUserId() + " не найден");
                }
            } else {
                // Если assigneeUserId null, убираем назначение
                request.setAssigneeUser(null);
                log.warn("Убрано назначение пользователя");
            }

            // Обновляем компанию
            if (requestData.getCompanyId() != null) {
                Company company = companyService.getCompanyById(requestData.getCompanyId());
                if (company != null) {
                    request.setCompany(company);
                } else {
                    log.warn("Компания с ID " + requestData.getCompanyId() + " не найдена");
                }
            }

            // Обновляем сервер
            if (requestData.getServerId() != null) {
                Server server = serverService.getServerById(requestData.getServerId());
                if (server != null) {
                    request.setServer(server);
                } else {
                    log.warn("Сервер с ID " + requestData.getServerId() + " не найден");
                }
            }

            // Сохраняем изменения
            requestService.setRequest(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("{\"message\": \"Заявка обновлена\"}");

        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка при обновлении заявки\"}");
        }
    }


    @PostMapping("/reopenRequest")
    public ResponseEntity<String> reopenRequest(@RequestBody long id) {
        try {
            log.info("ID request", id);
            
            // Получаем заявку и очищаем closedByUser
            Request request = requestService.getRequest(id);
            if (request != null) {
                request.setClosedByUser(null);
                requestService.setRequest(request);
            }
            
            requestService.reopenRequest(id);
            return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\": \"Заявка восстановлена\"}");
        } catch (Exception e) {
            log.error("Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Ошибка восстановление заявки\"}");
        }
    }

    @GetMapping(value = "/api/companies", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getCompanies() {
        try {
            log.info("Getting companies...");
            List<Company> companies = companyService.getAllCompanies();
            log.info("Found {} companies", companies.size());
            
            List<CompanyDTO> companyDTOs = companies.stream()
                    .map(this::mapToCompanyDTO)
                    .collect(Collectors.toList());
            
            log.info("Mapped to {} DTOs", companyDTOs.size());
            return ResponseEntity.ok(companyDTOs);
        } catch (Exception e) {
            log.error("Error getting companies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка получения списка компаний\"}");
        }
    }

    @GetMapping(value = "/api/servers", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getServers() {
        try {
            log.info("Getting all servers...");
            List<Server> servers = serverService.getAllServers();
            log.info("Found {} servers", servers.size());
            
            List<ServerDTO> serverDTOs = servers.stream()
                    .map(this::mapToServerDTO)
                    .collect(Collectors.toList());
            
            log.info("Mapped to {} DTOs", serverDTOs.size());
            return ResponseEntity.ok(serverDTOs);
        } catch (Exception e) {
            log.error("Error getting servers: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка получения списка серверов\"}");
        }
    }

    @GetMapping(value = "/api/servers/{companyId}", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> getServersByCompany(@PathVariable Long companyId) {
        try {
            log.info("Getting servers for company ID: {}", companyId);
            List<Server> servers = serverService.getServersByCompanyId(companyId);
            log.info("Found {} servers for company {}", servers.size(), companyId);
            
            List<ServerDTO> serverDTOs = servers.stream()
                    .map(this::mapToServerDTO)
                    .collect(Collectors.toList());
            
            log.info("Mapped to {} DTOs", serverDTOs.size());
            return ResponseEntity.ok(serverDTOs);
        } catch (Exception e) {
            log.error("Error getting servers by company: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка получения списка серверов\"}");
        }
    }

    @PostMapping("/api/init-data")
    @ResponseBody
    public ResponseEntity<?> initializeData() {
        try {
            log.info("Starting data initialization...");
            
            // Проверяем, есть ли уже данные
            List<Company> existingCompanies = companyService.getAllCompanies();
            log.info("Found {} existing companies", existingCompanies.size());
            
            if (!existingCompanies.isEmpty()) {
                log.info("Data already initialized, skipping...");
                return ResponseEntity.ok("{\"message\": \"Данные уже инициализированы\"}");
            }

            log.info("Creating companies...");
            // Создаем компании
            Company company1 = new Company();
            company1.setName("ООО \"Технологии будущего\"");
            company1 = companyService.saveCompany(company1);
            log.info("Created company: {} with ID: {}", company1.getName(), company1.getId());

            Company company2 = new Company();
            company2.setName("ИП Иванов А.А.");
            company2 = companyService.saveCompany(company2);
            log.info("Created company: {} with ID: {}", company2.getName(), company2.getId());

            Company company3 = new Company();
            company3.setName("АО \"Инновационные решения\"");
            company3 = companyService.saveCompany(company3);
            log.info("Created company: {} with ID: {}", company3.getName(), company3.getId());

            Company company4 = new Company();
            company4.setName("ООО \"Цифровые системы\"");
            company4 = companyService.saveCompany(company4);
            log.info("Created company: {} with ID: {}", company4.getName(), company4.getId());

            Company company5 = new Company();
            company5.setName("ИП Петров С.В.");
            company5 = companyService.saveCompany(company5);
            log.info("Created company: {} with ID: {}", company5.getName(), company5.getId());

            log.info("Creating servers...");
            // Создаем серверы для каждой компании
            Server server1 = new Server();
            server1.setName("Телефон");
            server1.setCompany(company1);
            server1 = serverService.saveServer(server1);
            log.info("Created server: {} for company: {}", server1.getName(), company1.getName());

            Server server2 = new Server();
            server2.setName("Вайбер");
            server2.setCompany(company1);
            server2 = serverService.saveServer(server2);
            log.info("Created server: {} for company: {}", server2.getName(), company1.getName());

            Server server3 = new Server();
            server3.setName("Телефон");
            server3.setCompany(company2);
            server3 = serverService.saveServer(server3);
            log.info("Created server: {} for company: {}", server3.getName(), company2.getName());

            Server server4 = new Server();
            server4.setName("Вайбер");
            server4.setCompany(company2);
            server4 = serverService.saveServer(server4);
            log.info("Created server: {} for company: {}", server4.getName(), company2.getName());

            Server server5 = new Server();
            server5.setName("Телефон");
            server5.setCompany(company3);
            server5 = serverService.saveServer(server5);
            log.info("Created server: {} for company: {}", server5.getName(), company3.getName());

            Server server6 = new Server();
            server6.setName("Вайбер");
            server6.setCompany(company3);
            server6 = serverService.saveServer(server6);
            log.info("Created server: {} for company: {}", server6.getName(), company3.getName());

            Server server7 = new Server();
            server7.setName("Телефон");
            server7.setCompany(company4);
            server7 = serverService.saveServer(server7);
            log.info("Created server: {} for company: {}", server7.getName(), company4.getName());

            Server server8 = new Server();
            server8.setName("Вайбер");
            server8.setCompany(company4);
            server8 = serverService.saveServer(server8);
            log.info("Created server: {} for company: {}", server8.getName(), company4.getName());

            Server server9 = new Server();
            server9.setName("Телефон");
            server9.setCompany(company5);
            server9 = serverService.saveServer(server9);
            log.info("Created server: {} for company: {}", server9.getName(), company5.getName());

            Server server10 = new Server();
            server10.setName("Вайбер");
            server10.setCompany(company5);
            server10 = serverService.saveServer(server10);
            log.info("Created server: {} for company: {}", server10.getName(), company5.getName());

            log.info("Data initialization completed successfully");
            return ResponseEntity.ok("{\"message\": \"Данные успешно инициализированы\"}");
        } catch (Exception e) {
            log.error("Error initializing data: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Ошибка инициализации данных\"}");
        }
    }

    @GetMapping(value = "/api/test", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> test() {
        try {
            log.info("Test endpoint called");
            Map<String, String> response = new HashMap<>();
            response.put("message", "API is working");
            response.put("timestamp", new java.util.Date().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in test endpoint: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Test endpoint error\"}");
        }
    }

    @PostMapping(value = "/requests/filter", produces = "application/json")
    @ResponseBody
    public ResponseEntity<?> filterRequests(@RequestBody FilterRequestDTO filter) {
        List<Request> filtered = requestService.filterRequests(
            filter.getStatus(),
            filter.getPriority(),
            filter.getCompanyId(),
            filter.getAssigneeId(),
            filter.getCreatorId(),
            filter.getDate()
        );
        List<RequestListDTO> dtoList = filtered.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    private RequestListDTO mapToDTO(Request request) {
        RequestListDTO dto = new RequestListDTO();
        dto.setId(request.getId());
        dto.setData(request.getData());
        dto.setTime(request.getTime());
        dto.setTema(request.getTema());
        dto.setStatus(request.getStatus());
        dto.setPriority(request.getPriority());
        dto.setDescription(request.getDescription());
        dto.setContacts(request.getContacts());

        // Company
        if (request.getCompany() != null) {
            RequestListDTO.CompanyListDTO companyDTO = new RequestListDTO.CompanyListDTO();
            companyDTO.setId(request.getCompany().getId());
            companyDTO.setName(request.getCompany().getName());
            dto.setCompany(companyDTO);
        }

        // Server
        if (request.getServer() != null) {
            RequestListDTO.ServerListDTO serverDTO = new RequestListDTO.ServerListDTO();
            serverDTO.setId(request.getServer().getId());
            serverDTO.setName(request.getServer().getName());
            dto.setServer(serverDTO);
        }

        // createUser
        RequestListDTO.UserListDTO createUser = new RequestListDTO.UserListDTO();
        if(request.getCreateUser()!=null){
            createUser.setId(request.getCreateUser().getId());
            createUser.setEmail(request.getCreateUser().getEmail());
            createUser.setFirstName(request.getCreateUser().getFirstName());
            createUser.setLastName(request.getCreateUser().getLastName());
        }
        else createUser = null;
        dto.setCreateUser(createUser);

        // assigneeUser
        RequestListDTO.UserListDTO assigneeUser = new RequestListDTO.UserListDTO();
        if(request.getAssigneeUser()!=null){
            assigneeUser.setId(request.getAssigneeUser().getId());
            assigneeUser.setEmail(request.getAssigneeUser().getEmail());
            assigneeUser.setFirstName(request.getAssigneeUser().getFirstName());
            assigneeUser.setLastName(request.getAssigneeUser().getLastName());
        }
        else assigneeUser = null;
        dto.setAssigneeUser(assigneeUser);

        // closedByUser
        RequestListDTO.UserListDTO closedByUser = new RequestListDTO.UserListDTO();
        if(request.getClosedByUser()!=null){
            closedByUser.setId(request.getClosedByUser().getId());
            closedByUser.setEmail(request.getClosedByUser().getEmail());
            closedByUser.setFirstName(request.getClosedByUser().getFirstName());
            closedByUser.setLastName(request.getClosedByUser().getLastName());
        }
        else closedByUser = null;
        dto.setClosedByUser(closedByUser);
        
        return dto;
    }

    private CompanyDTO mapToCompanyDTO(Company company) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        dto.setName(company.getName());
        return dto;
    }

    private ServerDTO mapToServerDTO(Server server) {
        ServerDTO dto = new ServerDTO();
        dto.setId(server.getId());
        dto.setName(server.getName());
        if (server.getCompany() != null) {
            dto.setCompanyId(server.getCompany().getId());
        }
        return dto;
    }
}
